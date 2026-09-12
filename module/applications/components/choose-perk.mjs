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
      const perksPack = game.packs.find((p) => p.collection === 'arcane-arcade-fallout.perks')
      const allPerks = await perksPack.getDocuments()
      const perks = allPerks.sort((a, b) => {
        const nameA = a.name.toUpperCase()
        const nameB = b.name.toUpperCase()
        if (nameA < nameB) {
            return -1;
        }

        if (nameA > nameB) {
            return 1;
        }
        
          return 0;
      }).map((perk) => {
        if (
            perk.system.lvlReq > 1 ||
            perk.system.raceReq.length > 0 ||
            (perk.system.specialReq.special !== '' && perk.system.specialReq.special !== 'None')
        ) {
            perk.hasRequirements = true
        }
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

    // Bind the search box once per DOM element (guarded by dataset.bound so
    // a full re-render, e.g. from toggling "Only available perks", doesn't
    // stack duplicate listeners) and re-apply the current filter after
    // every render. Mirrors the Crafting Bench's render-once/DOM-filter
    // search architecture — see claude/crafting-bench-reskin.md — so typing
    // never triggers a Foundry render and never drops keystrokes/focus.
    _onRender() {
        const searchInput = this.element.querySelector('[data-search]')
        if (searchInput && !searchInput.dataset.bound) {
            searchInput.dataset.bound = 'true'
            searchInput.addEventListener('input', (e) => this.onSearchInput(e))
            searchInput.addEventListener('keydown', (e) => this.onSearchKeydown(e))
            searchInput.addEventListener('blur', () => { this._searchFocused = false })
        }
        // A render that touches the grid (e.g. toggling "Only available
        // perks") replaces the search input itself, so restore focus/cursor
        // if the user was mid-search when it happened.
        if (this._searchFocused && searchInput) {
            searchInput.focus()
            const pos = this._searchCursorPos ?? searchInput.value.length
            searchInput.setSelectionRange(pos, pos)
        }

        this._applyPerkFilter()
    }

    // Pure DOM show/hide over the already-rendered perk grid — every perk
    // card stays in the DOM at all times, this just toggles which ones are
    // visible. Never touches render(), so it's safe to run on every
    // keystroke.
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

        // Autocomplete cue: once typing has narrowed the grid to exactly
        // one perk, highlight it so it's clear what Enter will choose.
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

    // Enter selects the single remaining visible perk, the same way
    // clicking its "choose" button would — a lightweight autocomplete
    // confirm that only fires once the search has actually narrowed things
    // down to one match, so it never fires just from typing.
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
            const raceIds = perk.system.raceReq.map((race) => race.id)
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
        const { perkId } = target.dataset
        const choice = this.perks.find((perk) => perk.id === perkId)
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