// Replaces Foundry's default token HUD status-effect list (prone, dead,
// blinded, ...) with one entry per Item in this system's "conditions"
// compendium that has its "Status Effect" checkbox checked
// (system.statusEffect, see data/condition.mjs and the checkbox on
// templates/item/item-condition-sheet.hbs - off by default), so toggling a
// "status effect" on a token actually applies or removes the real Condition
// item on the actor's sheet - not a generic, disconnected ActiveEffect the
// way core Foundry normally works.
//
// The one core entry kept alongside the compendium conditions is
// "defeated" (CONFIG.specialStatusEffects.DEFEATED, "dead" by default) -
// core's Combat Tracker "mark defeated" skull toggle depends on that id
// existing in CONFIG.statusEffects to show its overlay, so it's preserved
// rather than replaced like every other default status.
//
// This file only builds CONFIG.statusEffects and the id <-> compendium-id
// mapping. The actual apply/remove logic lives on FalloutZeroActor
// (module/documents/actor.mjs: `toggleStatusEffect`, `applyConditionStatus`,
// `removeConditionStatus`, and the `statuses` getter override), since that's
// where Foundry's TokenHUD click handling and status-icon highlighting
// already look.

const STATUS_PREFIX = 'falloutzero-condition-'

function getConditionsPack() {
  return (
    game.packs.get('arcane-arcade-fallout.conditions') ??
    game.packs.get('conditions') ??
    game.packs.find((p) => p.metadata.name === 'conditions')
  )
}

/**
 * @param {string} statusId   A CONFIG.statusEffects id.
 * @returns {string|null}     The condition compendium document id it maps to, or null if
 *                            this status id isn't one of ours (e.g. a leftover reference
 *                            to a core status like "dead" from other code/modules).
 */
export function conditionIdFromStatusId(statusId) {
  return typeof statusId === 'string' && statusId.startsWith(STATUS_PREFIX)
    ? statusId.slice(STATUS_PREFIX.length)
    : null
}

/**
 * @param {string} conditionId   A document id in the "conditions" compendium.
 * @returns {string}             The CONFIG.statusEffects id for that condition.
 */
export function statusIdFromConditionId(conditionId) {
  return `${STATUS_PREFIX}${conditionId}`
}

/**
 * Find the current "defeated" entry in CONFIG.statusEffects (whatever core
 * or another module has it set to right now) so it can be preserved across
 * a rebuild. Reads whichever list is live at call time - the very first
 * call (at `ready`, before this module has ever touched CONFIG.statusEffects)
 * sees Foundry's untouched default list; every later call sees our own
 * previously-rebuilt list, which - as long as this function keeps doing its
 * job - still has it, so it keeps getting carried forward.
 * @returns {object|null}
 */
function getDefeatedStatusEffect() {
  const defeatedId = CONFIG.specialStatusEffects?.DEFEATED ?? 'dead'
  return CONFIG.statusEffects?.find((effect) => effect.id === defeatedId) ?? null
}

/**
 * Rebuild CONFIG.statusEffects from the "conditions" compendium, keeping
 * only entries with `system.statusEffect` checked, plus core's "defeated"
 * entry (see `getDefeatedStatusEffect`) - core's Combat Tracker "mark
 * defeated" skull toggle needs that id to still exist in CONFIG.statusEffects
 * to show its overlay. Call once on `ready` (see registerHooks.mjs) -
 * compendium indexes aren't reliably populated any earlier than that - and
 * again whenever a condition's checkbox might have changed (also wired up
 * in registerHooks.mjs) so the token HUD list doesn't need a world reload to
 * catch up.
 */
export async function registerConditionStatusEffects() {
  const pack = getConditionsPack()
  if (!pack) {
    console.warn(
      'falloutzero | Could not find the "conditions" compendium - token status effects were not replaced with Condition items.',
    )
    return
  }

  const defeated = getDefeatedStatusEffect()

  const index = await pack.getIndex({ fields: ['img', 'type', 'system.statusEffect'] })
  const conditionEffects = index
    .filter((entry) => (!entry.type || entry.type === 'condition') && entry.system?.statusEffect)
    .map((entry) => ({
      id: statusIdFromConditionId(entry._id),
      name: entry.name,
      img: entry.img || 'icons/svg/aura.svg',
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  CONFIG.statusEffects = defeated ? [defeated, ...conditionEffects] : conditionEffects
}
