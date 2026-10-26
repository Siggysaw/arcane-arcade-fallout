// Replaces Foundry's default status-effect list with one entry per status-flagged Condition item.

const STATUS_PREFIX = 'falloutzero-condition-'

function getConditionsPack() {
  return (
    game.packs.get('arcane-arcade-fallout.conditions') ??
    game.packs.get('conditions') ??
    game.packs.find((p) => p.metadata.name === 'conditions')
  )
}

/** Maps a CONFIG.statusEffects id to its condition compendium document id, or null. */
export function conditionIdFromStatusId(statusId) {
  return typeof statusId === 'string' && statusId.startsWith(STATUS_PREFIX)
    ? statusId.slice(STATUS_PREFIX.length)
    : null
}

/** Builds the CONFIG.statusEffects id for a condition compendium document id. */
export function statusIdFromConditionId(conditionId) {
  return `${STATUS_PREFIX}${conditionId}`
}

/** Finds the current "defeated" status-effect entry so it survives a rebuild. */
function getDefeatedStatusEffect() {
  const defeatedId = CONFIG.specialStatusEffects?.DEFEATED ?? 'dead'
  return CONFIG.statusEffects?.find((effect) => effect.id === defeatedId) ?? null
}

/** Rebuilds CONFIG.statusEffects from the conditions compendium, preserving "defeated". */
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
