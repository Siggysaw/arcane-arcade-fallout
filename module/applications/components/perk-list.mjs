export default class PerkListApplication extends Application {
    constructor() {
        super();
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
            width: 600,
            height: 'auto',
            popOut: true,
        });
    }

    getData() {
        return {
            perks: this.perks,
        };
    }

    activateListeners(html) {
      super.activateListeners(html)
  
      html.on('click', '[data-edit]', async(ev) => {
        const perkUuid = ev.currentTarget.dataset.uuid
        const perk = await fromUuidSync(perkUuid)
        perk.sheet.render(true)
      })
    }
}
