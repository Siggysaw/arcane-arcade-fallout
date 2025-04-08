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


        context.perks = filteredPerks
        context.filters = this.filters
        context.selectedFilters = this.selectedFilters
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
    }

}
