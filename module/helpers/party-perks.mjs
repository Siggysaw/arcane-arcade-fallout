/**
 * Party-wide perk conditions.
 *
 * Some perks benefit the whole party. For each such perk, every
 * character-type actor (never NPCs) gets a matching condition whose level
 * (system.quantity) is worked out from how many characters hold the perk.
 * The effect of that level is applied elsewhere:
 *
 *   Outrageous Advantage - level = number of holders, for everyone
 *                          (holders included). Each level adds a d20 to
 *                          advantage rolls (./advantage.mjs).
 *   Lifegiver            - "Your max HP +10 and each other player
 *                          character's max HP +1", repeatable. Level = the
 *                          Lifegiver ranks (perk quantity) held by every
 *                          OTHER character; +1 max HP per level. The owner's
 *                          own +10 per rank is added in data/character.mjs.
 *
 * Only conditions this sync created (flagged flags.falloutzero.<flag>) are
 * ever changed or removed, so a copy a GM adds by hand is left alone and
 * stacks on top.
 *
 * Runs on exactly one client - the active GM - because only a GM can edit
 * every player's actor, and two GMs syncing at once would double up.
 */

const PARTY_PERKS = [
  {
    key: 'outrageousAdvantage',
    perk: /^outrageous advantage$/i,
    condition: /^outrageous advantage( condition)?$/i,
    flag: 'outrageousAdvantageAuto',
    // Conditions compendium entry, if it exists.
    packId: 's3WCa2qBSZUWGkIw',
    level: (actor, holders) => holders.size,
    fallback: {
      name: 'Outrageous Advantage',
      description:
        '<p>For each level of Outrageous Advantage:</p><p>When rolling with advantage, add one more d20 to the roll.</p>',
    },
  },
  {
    key: 'lifegiver',
    perk: /^life ?giver$/i,
    condition: /^life ?giver( condition)?$/i,
    flag: 'lifegiverAuto',
    packId: null,
    // +1 max HP per Lifegiver rank held by any OTHER character.
    level: (actor, holders) => totalRanks(holders) - (holders.get(actor) ?? 0),
    fallback: {
      name: 'Lifegiver Condition',
      img: 'systems/arcane-arcade-fallout/assets/vaultboy/perk-icons/lifegiver.png',
      description:
        '<p>+1 max HP per level.</p><p>You gain one level for every rank of the Lifegiver perk held by another party member.</p>',
    },
  },
]

const CONDITION_PACK = 'conditions'

const nameOf = (doc) => String(doc?.name ?? '').trim()

function characters() {
  return game.actors?.filter((actor) => actor.type === 'character') ?? []
}

function isResponsibleGM() {
  const activeGM = game.users?.activeGM
  return activeGM ? activeGM.isSelf : game.user?.isGM
}

/** Perk rank: the perk item's quantity (taking it again), at least 1. */
function rankOf(item) {
  return Math.max(1, Math.floor(Number(item.system?.quantity) || 1))
}

/** Characters holding the config's perk -> their total rank in it. */
function holdersOf(config) {
  const holders = new Map()
  for (const actor of characters()) {
    const ranks = actor.items
      .filter((i) => i.type === 'perk' && config.perk.test(nameOf(i)))
      .reduce((sum, i) => sum + rankOf(i), 0)
    if (ranks > 0) holders.set(actor, ranks)
  }
  return holders
}

function totalRanks(holders) {
  let total = 0
  for (const ranks of holders.values()) total += ranks
  return total
}

/** Item data for the condition - compendium copy, then world item, then a bare condition. */
async function conditionSourceData(config) {
  try {
    const pack =
      game.packs.get(`arcane-arcade-fallout.${CONDITION_PACK}`) ??
      game.packs.find((p) => p.metadata.name === CONDITION_PACK)
    let doc = config.packId ? await pack?.getDocument(config.packId) : null
    if (!doc && pack) {
      const index = await pack.getIndex()
      const entry = index.find((e) => e.type === 'condition' && config.condition.test(nameOf(e)))
      if (entry) doc = await pack.getDocument(entry._id)
    }
    doc ??= game.items?.find((i) => i.type === 'condition' && config.condition.test(nameOf(i)))
    if (doc) return doc.toObject()
  } catch (err) {
    console.warn(`Arcane Arcade Fallout | Could not load the ${config.fallback.name} condition`, err)
  }
  const { name, img, description } = config.fallback
  return {
    name,
    type: 'condition',
    ...(img ? { img } : {}),
    system: { description, ...(img ? { img } : {}) },
  }
}

async function syncOne(config) {
  const holders = holdersOf(config)
  let source = null
  for (const actor of characters()) {
    const level = holders.size ? Math.max(0, config.level(actor, holders)) : 0
    const auto = actor.items.filter((i) => i.type === 'condition' && i.flags?.falloutzero?.[config.flag] === true)
    if (level <= 0) {
      if (auto.length) await actor.deleteEmbeddedDocuments('Item', auto.map((i) => i.id))
      continue
    }
    const [keep, ...extras] = auto
    if (extras.length) await actor.deleteEmbeddedDocuments('Item', extras.map((i) => i.id))
    if (keep) {
      const update = {}
      if (Number(keep.system.quantity) !== level) update['system.quantity'] = level
      // Keep the icon in line with the source (e.g. after an icon change).
      source ??= await conditionSourceData(config)
      if (source.img && keep.img !== source.img) update.img = source.img
      if (Object.keys(update).length) await keep.update(update)
      continue
    }
    source ??= await conditionSourceData(config)
    const data = foundry.utils.deepClone(source)
    delete data._id
    foundry.utils.setProperty(data, 'system.quantity', level)
    foundry.utils.setProperty(data, `flags.falloutzero.${config.flag}`, true)
    await actor.createEmbeddedDocuments('Item', [data])
  }
}

let running = false
let rerun = false

/** Brings every character's party-perk conditions in line with who holds which perk. */
export async function syncPartyPerks() {
  if (!isResponsibleGM()) return
  if (running) {
    rerun = true
    return
  }
  running = true
  try {
    for (const config of PARTY_PERKS) {
      try {
        await syncOne(config)
      } catch (err) {
        console.error(`Arcane Arcade Fallout | ${config.fallback.name} sync failed`, err)
      }
    }
  } finally {
    running = false
    if (rerun) {
      rerun = false
      queueSync()
    }
  }
}

const queueSync = foundry.utils.debounce(() => syncPartyPerks(), 300)

/* -------------------------------------------- */
/*  Triggers                                    */
/* -------------------------------------------- */

function isPartyPerk(item) {
  return item?.type === 'perk' && PARTY_PERKS.some((config) => config.perk.test(nameOf(item)))
}

function onCharacter(item) {
  return item?.parent?.documentName === 'Actor' && item.parent.type === 'character'
}

Hooks.once('ready', () => queueSync())

Hooks.on('createItem', (item) => {
  if (onCharacter(item) && isPartyPerk(item)) queueSync()
})
Hooks.on('deleteItem', (item) => {
  if (onCharacter(item) && isPartyPerk(item)) queueSync()
})
Hooks.on('updateItem', (item, changes) => {
  if (!onCharacter(item) || item.type !== 'perk') return
  // Renamed to/from a party perk, or a party perk's rank (quantity) changed.
  const renamed = 'name' in (changes ?? {})
  const rankChanged = foundry.utils.hasProperty(changes ?? {}, 'system.quantity')
  if (renamed || (rankChanged && isPartyPerk(item))) queueSync()
})
Hooks.on('createActor', (actor) => {
  if (actor.type === 'character') queueSync()
})
Hooks.on('deleteActor', (actor) => {
  if (actor.type === 'character') queueSync()
})
// A GM taking over (e.g. the previous active GM left) catches up.
Hooks.on('userConnected', () => queueSync())
