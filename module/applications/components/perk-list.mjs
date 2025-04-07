export default class PerkListApplication extends Application {
    constructor() {
        super();
        try {
            this.perks = game.packs.find((i) => i.collection === 'arcane-arcade-fallout.perks').index.contents
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
            width: 400,
            height: 'auto',
            popOut: true,
        });
    }

    getData() {
        return {
            perks: this.perks,
        };
    }
}
