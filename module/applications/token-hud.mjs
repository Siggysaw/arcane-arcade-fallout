import { conditionIdFromStatusId } from '../helpers/status-effects.mjs'

/** Extends TokenHUD so clicking a status icon increments/decrements its Condition item's quantity. */
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
