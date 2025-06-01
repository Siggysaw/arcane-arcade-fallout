
import SkillRoll from './dice/skill-roll.mjs'
import FalloutZeroArmor from './data/armor.mjs'
import FalloutZeroItem from './documents/item.mjs'
import { getApCost, getLastWaypointGroup, sumWaypoints } from './helpers/movement.mjs'

export function registerHooks() {

    Hooks.once('ready', async function () {
        const migrationVersion = game.settings.get(CONFIG.FALLOUTZERO.systemId, 'MigrationVersion')
        if (!isNewerVersion(game.system.version, migrationVersion)) {
            return
        }
        if (isNewerVersion('0.1.0', migrationVersion)) {
            // Migrate items to new compendium system
            ui.notifications.warn('Migrating world items, please be patient...')
            for (let item of game.items) {
                if (item._stats.compendiumSource) {
                    const uuid = item._stats.compendiumSource
                    const compendiumItem = await fromUuid(uuid)
                    if (compendiumItem?.system?.crafting) {
                        item.update({
                            ['system.crafting']: compendiumItem.system.crafting
                        })
                    }
                }
            }
            ui.notifications.warn('Migrating world items complete')


            // Migrate items to new compendium system
            ui.notifications.warn('Migrating world actor items, please be patient...')
            for (let actor of game.actors) {
                console.log('actor', actor.name)
                for (let item of actor.items) {
                    console.log('item', item.name)
                    if (item._stats.compendiumSource) {
                        const uuid = item._stats.compendiumSource
                        const compendiumItem = await fromUuid(uuid)
                        if (compendiumItem?.system?.crafting) {
                            item.update({
                                ['system.crafting']: compendiumItem.system.crafting
                            })
                        }
                    }
                }
            }
            ui.notifications.warn('Migrating world actor items complete')
        }

        game.settings.set(CONFIG.FALLOUTZERO.systemId, 'MigrationVersion', game.system.version)
    })

    Hooks.once('ready', function () {
        // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
        Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot))

        /* --------------------------------------------  */
        /*  Auto recycle AP on turn end                                */
        /* --------------------------------------------  */
        if (game.user.isGM && game.settings.get('core', 'AutoRecycleAP')) {
            Hooks.on("updateCombat", async (combat, updates, update) => {
                // if round did not change or direction is backwards, return
                if (!updates.round || update.direction !== 1) return

                // else recycle ap for all combatants
                game.combat.combatants.forEach((combatant) => {
                    combatant.actor.recycleAp()
                })
            });
        }
    })

    /* --------------------------------------------  */
    /*  Token movement                                 */
    /* --------------------------------------------  */
    Hooks.on('preMoveToken', (token, movement) => {
        console.log('preMoveToken', movement)
        // if flag not active or not in combat, skip AP deduction
        if (!game.settings.get('core', 'DeductMovementAPInCombat') || !game.combats?.active?.started) return

        const isTurn = game.combats.active.combatant.tokenId === token.id
        if (!isTurn) {
            ui.notifications.warn("Movement is based on combat turn, it's currently not your turn");
            return false
        }

        // Get total cost
        const passedApCost = getApCost(movement.passed.cost)
        let pendingWaypoints = movement.pending.waypoints
        let pendingApCost = 0
        while (pendingWaypoints.length) {
            const waypointGroup = getLastWaypointGroup(pendingWaypoints)
            pendingApCost += sumWaypoints(waypointGroup)
            pendingWaypoints = pendingWaypoints.slice(waypointGroup.length)
        }

        // Check if actor can afford movement
        const apAfterCost = token.actor.getAPAfterCost(passedApCost + pendingApCost)
        if (apAfterCost < 0) {
            ui.notifications.warn("Not enough AP for this movement");
            return false
        }

        // Deduct AP
        if (movement.method !== 'undo') {
            token.actor.applyApCost(getApCost(movement.passed.cost))
        } else {
            // If undo movement, restore AP
            try {
                const waypointGroup = getLastWaypointGroup(movement.history.recorded.waypoints)
                const historyApCost = sumWaypoints(waypointGroup)

                const currentAp = token.actor.system.actionPoints.value
                token.actor.update({
                    'system.actionPoints.value': currentAp + historyApCost
                })
            } catch (error) {
                console.error('Error restoring actors AP', error)
                ui.notifications.warn("Error restoring actors AP", error);
            }
        }

        return true
    });

    /* --------------------------------------------  */
    /*  Other Hooks                                  */
    /* --------------------------------------------  */

    Hooks.on('renderPause', (app, [html]) => {
        const img = html.querySelector('img')
        img.src = 'systems/arcane-arcade-fallout/assets/vaultboy/vaultboy.webp'
    })

    /* --------------------------------------------  */
    /*  AAFO-HUD HOOKS                                */
    /* --------------------------------------------  */
    Hooks.on('aafohud.skillRoll', async (actorUuid, skill) => {
        const actor = fromUuidSync(actorUuid)
        const roll = await new SkillRoll(actor, skill, () => { })
        roll.render(true)
    })

    Hooks.on('aafohud.attackRoll', async (actorUuid, weaponId) => {
        const actor = fromUuidSync(actorUuid)
        const weapon = actor.items.get(weaponId)
        weapon.rollAttack({ advantageMode: 1 })
    })

    Hooks.on('aafohud.toggleEquipArmor', async (actorUuid, itemId) => {
        const actor = fromUuidSync(actorUuid)
        const item = actor.items.get(itemId)
        const cost = item.type == "powerArmor" ? 6 : 3
        const canAffordAP = actor.applyApCost(cost)
        if (canAffordAP) {
            item.update({ 'system.itemEquipped': !item.system.itemEquipped })
        }
    })

    Hooks.on('aafohud.toggleEquipWeapon', async (actorUuid, itemId) => {
        const actor = fromUuidSync(actorUuid)
        const item = actor.items.get(itemId)
        const cost = 3
        const canAffordAP = actor.applyApCost(cost)
        if (canAffordAP) {
            item.update({ 'system.itemEquipped': !item.system.itemEquipped })
        }
    })

    Hooks.on('aafohud.reloadWeapon', async (actorUuid, itemId) => {
        const actor = fromUuidSync(actorUuid)
        actor.reload(itemId)
    })

    Hooks.on('aafohud.useConsumable', async (actorUuid, itemId) => {
        const actor = fromUuidSync(actorUuid)
        const cost = 4
        const canAffordAP = actor.applyApCost(cost)
        if (canAffordAP) {
            actor.lowerInventory(itemId)
        }
    })
}