import { FALLOUTZERO } from '../../config.mjs'
export default class PerkListApplication extends Application {
    constructor() {
        super();
        this.filters = [
            'strength',
            'perception',
            'endurance',
            'charisma',
            'intelligence',
            'agility',
            'luck',
            'general',
            'racial',
        ]
        this.perks = []

        this.selectedFilters = []
        this.searchQuery = ''
    }

    async init() {
        try {
            const perksPack = game.packs.find((p) => p.collection === 'arcane-arcade-fallout.perks')
            this.perks = await perksPack.getDocuments()
        } catch (error) {
            console.error(error);
            ui.notifications.warn('Failed to get perks from compendium')
        }
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "perk-list",
            title: 'Perks',
            template: 'systems/arcane-arcade-fallout/templates/dialog/perk-list.hbs',
            classes: ['pipboy-dialog'],
            width: 800,
            height: 'auto',
            popOut: true,
            resizable: true,
        });
    }

    getData() {
        const context = super.getData()

        const filteredPerks = this.selectedFilters.length > 0 ? this.perks.filter((perk) => {
            const specialKey = FALLOUTZERO.abilities[perk.system.specialReq.special]?.label?.toLowerCase() || null
            const requiredRaces = perk.system.raceReq
            if (specialKey && this.selectedFilters.includes(specialKey)){
                return true
            } else if (requiredRaces.length > 0 && this.selectedFilters.includes('racial')) {
                return true
            } else if (!specialKey && requiredRaces.length === 0 && this.selectedFilters.includes('general')) {
                return true
            }
        }) : this.perks

        // Same "does this perk have anything to show in the requirements
        // box" check used by the level-up Choose Perk dialog, so the two
        // share the same card look.
        const perksWithRequirements = filteredPerks.map((perk) => {
            if (
                perk.system.lvlReq > 1 ||
                perk.system.raceReq.length > 0 ||
                (perk.system.specialReq.special !== '' && perk.system.specialReq.special !== 'None')
            ) {
                perk.hasRequirements = true
            }
            return perk
        })

        context.perks = perksWithRequirements
        context.filters = this.filters
        context.selectedFilters = this.selectedFilters
        context.searchQuery = this.searchQuery
        return context
    }

    activateListeners(html) {
      super.activateListeners(html)

      html.on('click', '[data-edit]', async(ev) => {
        const perkUuid = ev.currentTarget.dataset.uuid
        const perk = await fromUuidSync(perkUuid)
        perk.sheet.render(true)
      })

      html.on('input', '[data-filter]', (e) => {
        const filterKey = e.currentTarget.dataset.filter
        if (this.selectedFilters.includes(filterKey)) {
            this.selectedFilters = this.selectedFilters.filter((f) => f !== filterKey)
        } else {
            this.selectedFilters.push(filterKey)
        }
        this.render(true);
      })

      // Render-once/DOM-filter search, same architecture as the Crafting
      // Bench and the level-up Choose Perk dialog: typing never calls
      // render() (Application v1's render() replaces this whole `html`,
      // which would drop focus/keystrokes), it just toggles which already-
      // rendered cards are visible.
      html.on('input', '[data-search]', (e) => {
        this.searchQuery = e.currentTarget.value
        this._applyPerkFilter(html)
      })

      html.on('keydown', '[data-search]', (e) => {
        if (e.key !== 'Enter') return
        e.preventDefault()
        const grid = html[0].querySelector('[data-perk-grid]')
        if (!grid) return
        const visible = [...grid.querySelectorAll('.perk-card:not(.is-hidden)')]
        if (visible.length !== 1) return
        visible[0].click()
      })

      // Re-apply on every activateListeners call (i.e. every render,
      // including the ones triggered by the category filter checkboxes
      // above) so a typed search survives switching category filters.
      this._applyPerkFilter(html)
    }

    // Pure DOM show/hide over the already-rendered perk grid — every card
    // stays in the DOM, this just toggles which ones are visible. Mirrors
    // ChoosePerk#_applyPerkFilter (see level-up.mjs).
    _applyPerkFilter(html) {
        const grid = html[0].querySelector('[data-perk-grid]')
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

        if (query && visible.length === 1) {
            visible[0].classList.add('perk-match')
        }

        const emptyMessage = grid.querySelector('[data-empty-message]')
        if (emptyMessage) emptyMessage.hidden = visible.length > 0
    }

}
