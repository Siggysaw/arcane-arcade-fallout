import { conditionIdFromStatusId } from '../helpers/status-effects.mjs'

/**
 * Extends core's TokenHUD so left-click / right-click on a status-effect
 * icon increments / decrements the underlying Condition item's quantity
 * (deleting it once that would take it to 0) instead of core's plain
 * on/off toggle plus right-click-sets-overlay behavior. Registered via
 * `CONFIG.Token.hudClass` in falloutzero.mjs.
 *
 * Only applies to icons produced by this system's own CONFIG.statusEffects
 * list (see helpers/status-effects.mjs, which replaces the default list
 * with one entry per item in the "conditions" compendium) - anything else
 * falls back to core's default toggle/overlay handling untouched.
 *
 * CAVEAT: `data-status-id` on the clicked control is Foundry's own internal
 * convention for identifying a status icon in the HUD markup, not something
 * this system defines - it's consistent across recent Foundry versions but
 * isn't officially documented, so this is the one piece of this feature
 * that's worth confirming actually fires in-game (see
 * token-status-effects-as-conditions.md for what to test). If a version
 * ever renames it, left/right-click here would silently stop doing
 * anything special and just fall through to `#onClickEffect`'s early
 * return.
 */
export default class FalloutZeroTokenHUD extends foundry.applications.hud.TokenHUD {
  static DEFAULT_OPTIONS = {
    actions: {
      effect: {
        buttons: [0, 2],
        handler: FalloutZeroTokenHUD.#onClickEffect,
      },
    },
  }

  static async #onClickEffect(event, target) {
    const statusId = target?.dataset?.statusId ?? target?.closest?.('[data-status-id]')?.dataset.statusId
    const actor = this.object?.actor ?? this.actor
    if (!statusId || !actor) return

    const conditionId = conditionIdFromStatusId(statusId)
    if (!conditionId) {
      // Not one of ours - shouldn't normally happen since CONFIG.statusEffects
      // is fully replaced, but keep core's own toggle/overlay behavior intact
      // for any leftover reference to a vanilla status id.
      return actor.toggleStatusEffect(statusId, { overlay: event.button === 2 })
    }

    event.preventDefault()
    if (event.button === 2) {
      await actor.decrementConditionStatus(statusId)
    } else {
      await actor.incrementConditionStatus(statusId, conditionId)
    }
    this.render()
  }
}
