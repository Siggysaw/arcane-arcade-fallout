const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export default class SelectUpgrade extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(actorId, itemId, options = {}) {
        super(options);
        this.actorId = actorId
        this.itemId = itemId
    }

    static DEFAULT_OPTIONS = {
        actions: {
            attach: SelectUpgrade.attach,
            detach: SelectUpgrade.detach,
            done: SelectUpgrade.done,
        },
        classes: ['select-upgrade'],
        window: {
            title: 'Attach/Detach Upgrades',
            resizable: true
        }
    }

    static PARTS = {
        main: {
            template: 'systems/arcane-arcade-fallout/templates/select-upgrade/main.hbs',
        },
    }

    get detachedUpgrades() {
        return this.actor.items.filter((upgrade) => {
            return (upgrade.type === 'armorUpgrade' && !upgrade.system.equipped && upgrade.system.type === this.item.system.armorType)
        })
    }

    get attachedUpgrades() {
        return this.item.system.upgrade.slots.map((slot) => {
            return {
                ...slot,
                description: fromUuidSync(slot.uuid)?.system.description || '',
            }
        })
    }

    get item() {
        return this.actor.items.get(this.itemId)
    }

    _onRender() { };

    async _prepareContext() {
        return {
            maxSlots: this.item.system.upgrade.slotCount,
            usedSlots: this.attachedUpgrades.length,
            item: this.item,
            detachedUpgrades: this.detachedUpgrades,
            attachedUpgrades: this.attachedUpgrades,
        }
    }

    get actor() {
        return game.actors.find((actor) => {
            return actor.id === this.actorId
        })
    }

    // Attach upgrade to item
    static async attach(e, target) {
        const { upgradeId } = target.dataset
        const upgrade = fromUuidSync(upgradeId)

        const slots = this.item.system.upgrade.slots
        slots.push(({
            uuid: upgrade.uuid,
            name: upgrade.name,
            img: upgrade.img,
            type: upgrade.system.type,
        }))

        this.item.update({
            'system.upgrade.slots': slots,
        })

        await upgrade.update({ 'system.equipped': true })

        // Enable all effects of the upgrade
        if (this.item.system.itemEquipped) {
            for (const effect of upgrade.effects) {
                await effect.update({ disabled: false })
            }
        }
        this.render(true)
    }

    // Detach upgrade from item
    static async detach(e, target) {
        const { upgradeId } = target.dataset
        const upgrade = fromUuidSync(upgradeId)

        const slots = this.item.system.upgrade.slots.filter((slot) => slot.uuid !== upgradeId)
        this.item.update({
            'system.upgrade.slots': slots
        })

        await upgrade.update({ 'system.equipped': false })

        // Disable all effects of the upgrade
        if (this.item.system.itemEquipped) {
            for (const effect of upgrade.effects) {
                await effect.update({ disabled: true })
            }
        }
        this.render(true)
    }

    static done() {
        this.close()
    }
}
