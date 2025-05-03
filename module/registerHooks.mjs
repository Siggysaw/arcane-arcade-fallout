
import SkillRoll from './dice/skill-roll.mjs'
import FalloutZeroArmor from './data/armor.mjs'
import FalloutZeroItem from './documents/item.mjs'

export function registerHooks() {

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

        const distanceCost = (movement.passed.cost + movement.pending.cost) / game.scenes.active.grid.distance
        const apAfterCost = token.actor.getAPAfterCost(distanceCost)

        if (apAfterCost < 0) {
            ui.notifications.warn("Not enough AP for this movement");
            return false
        }

        // If undoing movement, restore AP
        if (movement.method === 'undo') {
            try {
                let totalCost = 0
                const waypoints = movement.history.recorded.waypoints
                const waypointsCount = waypoints.length - 1
                for (let i = waypointsCount; i >= 0; i--) {
                    // if is first waypoint, or was intermediate step
                    if (i === waypointsCount || waypoints[i].intermediate) {
                        totalCost += waypoints[i].cost
                    } else { // else break
                        break;
                    };
                }
                const currentAp = token.actor.system.actionPoints.value
                token.actor.update({
                    'system.actionPoints.value': currentAp + (totalCost / game.scenes.active.grid.distance)
                })
            } catch (error) {
                ui.notifications.warn("Error restoring actors AP", error);
            }
        } else {
            // Deduct AP
            token.actor.applyApCost(movement.passed.cost / game.scenes.active.grid.distance)
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
            FalloutZeroArmor.prototype.changeEquipStatus(item)
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
        const item = actor.items.get(itemId)
        const cost = 4
        const canAffordAP = actor.applyApCost(cost)
        if (canAffordAP) {
            FalloutZeroItem.prototype.toggleEffects(item, item.system.itemEquipped)
            actor.lowerInventory(itemId)
        }
    })
}