const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
export default class CraftingBench extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(actorId, options = {}) {
        super(options);
        this.actorId = actorId
        this.selectedCraftable = null
        this.openBranches = []
        this.owned = 0

        this.craftingTree = Object.keys(CONFIG.FALLOUTZERO.craftingTypes).reduce((acc, typeKey) => {
            acc[typeKey] = {
                ...CONFIG.FALLOUTZERO.craftingTypes[typeKey],
                items: [],
            }
            return acc
        }, {})
    }

    get actor() {
        return game.actors.find((actor) => {
            return actor.id === this.actorId
        })
    }

    get skills() {
        return Object.keys(this.actor.system.skills).reduce((acc, key) => {
            acc[key] = this.actor.system.skills[key].value
            return acc
        }, {})
    }

    get materials() {
        return this.actor.craftingMaterials.reduce((acc, mat) => {
            acc[mat._stats.compendiumSource] = {
                name: mat.name,
                quantity: mat.system.quantity
            }
            return acc
        }, {})
    }

    get hasMaterials() {
        if (!this.selectedCraftable) return false

        return this.selectedCraftable.materials.every((mat) => {
            return (this.materials[mat.uuid].quantity ?? 0) > mat.quantity
        })
    }

    get hasRequirements() {
        if (!this.selectedCraftable) return false

        return this.selectedCraftable.requirements.reduce((passes, req) => {
            req.keys.forEach((skill) => {
                if (this.skills[skill] < req.dc) {
                    passes = false
                }
            })
            return passes
        }, true)
    }

    async init() {
        try {
            const packsToGet = [
                'arcane-arcade-fallout.armor',
                'arcane-arcade-fallout.ammunition',
                'arcane-arcade-fallout.explosives',
            ]
            const packsWithCraftables = game.packs.filter((p) => packsToGet.includes(p.collection))
            const packCraftables = await Promise.all(
                packsWithCraftables.map(async (pack) => {
                    const items = await pack.getDocuments()
                    return items.filter((item) => item.system.crafting.craftable)
                })
            )

            for (const craftable of packCraftables.flat()) {
                const type = this.craftingTree[craftable.system.crafting.type]
                type.items.push(craftable)
            }

        } catch (error) {
            console.error(error);
            ui.notifications.warn('Failed to get perks from compendium')
        }
    }

    static DEFAULT_OPTIONS = {
        actions: {
            select: CraftingBench.selectCraftable,
            toggleBranch: CraftingBench.toggleBranch,
            craft: CraftingBench.craft,
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
        // // Completely overriding the parts
        // options.parts = ['header', 'tabs', 'description']
        // // Don't show the other tabs if only limited view
        // if (this.document.limited) return;
        // // Keep in mind that the order of `parts` *does* matter
        // // So you may need to use array manipulation
        // switch (this.document.type) {
        //     case 'typeA':
        //         options.parts.push('foo')
        //         break;
        //     case 'typeB':
        //         options.parts.push('bar')
        //         break;
        // }
    }

    activateListeners(html) {
        super.activateListeners(html);
    };

    async _prepareContext() {
        return {
            craftingTree: this.craftingTree,
            selectedCraftable: this.selectedCraftable,
            openBranches: this.openBranches,
            materials: this.materials,
            skills: this.skills,
            owned: this.owned,
        }
    }

    static selectCraftable(e, target) {
        e.stopPropagation()
        e.preventDefault()
        const { branch, index } = target.dataset
        this.selectedCraftable = this.craftingTree[branch].items[index].uuid ? {
            uuid: this.craftingTree[branch].items[index].uuid,
            name: this.craftingTree[branch].items[index].name,
            ...this.craftingTree[branch].items[index].system.crafting
        } : null
        this.owned = this.actor.getItemByCompendiumId(this.selectedCraftable.uuid)?.system?.quantity ?? 0
        this.render()
    }

    static toggleBranch(e, target) {
        const { branchKey } = target.dataset
        if (this.openBranches.includes(branchKey)) {
            this.openBranches.splice(this.openBranches.indexOf(branchKey), 1)
        } else {
            this.openBranches.push(branchKey)
        }
    }

    static craft() {
        if (!this.hasMaterials) {
            return ui.notifications.warn('You do not have the required materials')
        }
        if (hasRequirements) {
            this._createOrUpdateItem()
        } else {
            return new Dialog({
                title: `Craft ${this.selectedCraftable.name}`,
                content: 'Attempt to craft item?',
                buttons: {
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: 'Cancel',
                    },
                    craft: {
                        icon: '<i class="fas fa-chevron-right"></i>',
                        label: 'Yes',
                        callback: () => {
                            // #TODO need to add ability to switch required skill
                        },
                    },
                },
                default: 'close',
            }).render(true)
        }
    }

    async _createOrUpdateItem() {
        const existingItem = this.actor.getItemByCompendiumId(this.selectedCraftable.uuid)

        // Update or create new
        if (existingItem) {
            const newQty = existingItem.system.quantity + 1
            this.actor.updateItemById(existingItem.id, {
                quantity: newQty
            })
            this.owned = newQty
        } else {
            const craftedItem = await fromUuid(this.selectedCraftable.uuid)
            craftedItem.update({
                _stats: {
                    compendiumSource: this.selectedCraftable.uuid
                }
            })
            await Item.create(craftedItem.toObject(), { parent: this.actor })
            this.owned = 1
        }

        // reduce materials
        await Promise.all(
            this.selectedCraftable.materials.map(async (mat) => {
                const item = this.actor.getItemByCompendiumId(mat.uuid)
                return await this.actor.updateItemById(item.id, {
                    quantity: item.system.quantity - mat.quantity
                })
            })
        )

        this.render(true)
    }
}