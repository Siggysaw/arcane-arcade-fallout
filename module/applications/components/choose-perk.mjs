import { getAllPerks, perkHasRequirements } from './perk-sources.mjs'
const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
export default class ChoosePerk extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(actor, perks) {
        super()
        this.actor = actor
        this.onlyAvailablePerks = true
        this.perks = perks
        this.filteredPerks = this.filterPerks()
        this.app = null
        this.searchQuery = ''
    }

    #choice = null
    get choice() {
        return this.#choice
    }

    static DEFAULT_OPTIONS = {
      form: {
        submitOnChange: false,
        closeOnSubmit: true,
      },
      actions: {
        filter: ChoosePerk.onFilter,
        perk: ChoosePerk.onPerkChoice,
        cancel: ChoosePerk.onCancel,
      },
      classes: ['pipboy-dialog'],
      position: { width: 800 },
      window: {
        title: 'Choose a perk!',
        resizable: true
      }
    };

    static PARTS = {
        main: {
            template: 'systems/arcane-arcade-fallout/templates/level-up/dialog/choose-perk.hbs',
            scrollable: [""]
        },
    }

    get nextLevel() {
        return this.actor.system.level + 1
    }
  
    static #onSubmit(choice) {
      this.choice = choice
    }
  
    static async create(actor) {
      // System compendium + world compendiums + world Items, deduped and sorted by name.
      const perks = (await getAllPerks()).map((perk) => {
        perk.hasRequirements = perkHasRequirements(perk)
        return perk
      })

      this.app = new this(actor, perks);

      const { promise, resolve } = Promise.withResolvers();
      this.app.addEventListener("close", () => resolve(this.choice), { once: true });
      this.app.render({ force: true });
      return promise;
    }

    async _prepareContext() {
        return {
            perks: this.filteredPerks,
            onlyAvailablePerks: this.onlyAvailablePerks,
            searchQuery: this.searchQuery,
        }
    }

    // Binds the search box once per element and reapplies the filter after every render.
    _onRender() {
        const searchInput = this.element.querySelector('[data-search]')
        if (searchInput && !searchInput.dataset.bound) {
            searchInput.dataset.bound = 'true'
            searchInput.addEventListener('input', (e) => this.onSearchInput(e))
            searchInput.addEventListener('keydown', (e) => this.onSearchKeydown(e))
            searchInput.addEventListener('blur', () => { this._searchFocused = false })
        }
        // Restores focus/cursor if a grid-touching render replaced the search input mid-search.
        if (this._searchFocused && searchInput) {
            searchInput.focus()
            const pos = this._searchCursorPos ?? searchInput.value.length
            searchInput.setSelectionRange(pos, pos)
        }

        this._applyPerkFilter()
    }

    // Pure DOM show/hide over the rendered perk grid; safe to run on every keystroke.
    _applyPerkFilter() {
        const grid = this.element.querySelector('[data-perk-grid]')
        if (!grid) return

        const query = (this.searchQuery ?? '').trim().toLowerCase()
        const cards = grid.querySelectorAll('.perk-card')
        const visible = []

        cards.forEach((card) => {
            const name = (card.dataset.itemName ?? '').toLowerCase()
            const matches = !query || name.includes(query)
            card.classList.toggle('is-hidden', !matches)
            card.classList.remove('perk-match')
            if (matches) visible.push(card)
        })

        // Highlights the single remaining perk so it's clear what Enter will choose.
        if (query && visible.length === 1) {
            visible[0].classList.add('perk-match')
        }

        const emptyMessage = grid.querySelector('[data-empty-message]')
        if (emptyMessage) emptyMessage.hidden = visible.length > 0
    }

    onSearchInput(e) {
        this.searchQuery = e.currentTarget.value
        this._searchFocused = true
        this._searchCursorPos = e.currentTarget.selectionStart
        this._applyPerkFilter()
    }

    // Enter selects the single remaining visible perk, like clicking its choose button.
    onSearchKeydown(e) {
        if (e.key !== 'Enter') return
        e.preventDefault()
        const grid = this.element.querySelector('[data-perk-grid]')
        if (!grid) return
        const visible = [...grid.querySelectorAll('.perk-card:not(.is-hidden)')]
        if (visible.length !== 1) return
        visible[0].querySelector('[data-action="perk"]')?.click()
    }

    filterPerks() {
        return this.perks.filter((perk) => {
            const raceIds = (perk.system.raceReq ?? []).map((race) => race.id)
            const hasSpecialReq = (perk.system.specialReq.special && perk.system.specialReq.special !== 'None')
            if (
                (!perk.system.lvlReq || this.nextLevel >= perk.system.lvlReq) &&
                (!hasSpecialReq || this.actor.system.abilities[perk.system.specialReq.special].base >= perk.system.specialReq.value) &&
                (raceIds.length === 0 || raceIds.includes(this.actor.getRaceType()))
            ) {
                return perk
            }
        })
    }

    static onPerkChoice (e, target) {
        // Matched by UUID: a world perk and a compendium perk can share the same id.
        const { perkUuid } = target.dataset
        const choice = this.perks.find((perk) => perk.uuid === perkUuid)
        ChoosePerk.#onSubmit(choice)
        this.close()
    }

    static onFilter (e, target) {
        this.onlyAvailablePerks = target.checked
        if (this.onlyAvailablePerks) {
            this.filteredPerks = this.filterPerks()
        } else {
            this.filteredPerks = this.perks
        }
        this.render()
    }

    static onCancel () {
        ChoosePerk.#onSubmit(null)
        this.close()
    }
  }