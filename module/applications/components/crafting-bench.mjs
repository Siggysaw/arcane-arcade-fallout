const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
export default class CraftingBench extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options = {}) {
        super(options);

        this.craftables = {
            armor: {
                label: 'Armor',
            },
            power_armor: {
                label: 'Power armor'
            },
            blades: {
                label: 'Blades',
            },
            blunt: {
                label: 'Blunt'
            },
            mechanical: {
                label: 'Mechanical'
            },
            fist: {
                label: 'Fist'
            },
            melee_mods: {
                label: 'Melee mods'
            },
        }

        this.craftingSelection = null
    }

    static DEFAULT_OPTIONS = {
        actions: {
            select: CraftingBench.selectCraftable,
        },
        classes: ['crafting-bench'],
        window: {
            title: 'Crafting bench',
            resizable: true
        }
    }

    static PARTS = {
        sidebar: {
            template: 'systems/arcane-arcade-fallout/templates/crafting-bench/sidebar.hbs',
        },
        main: {
            template: 'systems/arcane-arcade-fallout/templates/crafting-bench/main.hbs',
        },
    }

    /** @override */
    _configureRenderOptions(options) {
        // This fills in `options.parts` with an array of ALL part keys by default
        // So we need to call `super` first
        super._configureRenderOptions(options);
        // Completely overriding the parts
        // options.parts = ['header', 'tabs', 'description']
        // // Don't show the other tabs if only limited view
        // if (this.document.limited) return;
        // // Keep in mind that the order of `parts` *does* matter
        // // So you may need to use array manipulation
        // switch (this.document.type) {
        // case 'typeA':
        //     options.parts.push('foo')
        //     break;
        // case 'typeB':
        //     options.parts.push('bar')
        //     break;
        // }
    }

    activateListeners(html) {
        super.activateListeners(html);
    };

    get nextLevel() {
        return this.actor.system.level + 1
    }

    async _prepareContext() {
        return {
            craftables: this.craftables,
            selectedCraftable: this.craftables[this.selectCraftable],
        }
    }

    static selectCraftable(e, target) {
        this.selectCraftable = target.dataset.craftable
        this.render()
    }
}