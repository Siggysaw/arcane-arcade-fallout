// Migrates legacy aoeRadius text into structured areaOfEffect.full/half fields; re-run safe.

import { FALLOUTZERO } from '../config.mjs'

/** Extracts up to two radii (full/half) from a legacy aoeRadius text string. */
export function parseLegacyAoeRadius(text) {
  if (typeof text !== 'string' || !text.trim()) {
    return { full: 0, half: null, parsed: false }
  }
  const numbers = [...text.matchAll(/(\d+(?:\.\d+)?)/g)].map((m) => Number(m[1]))
  if (!numbers.length) return { full: 0, half: null, parsed: false }
  const [full, half] = numbers
  return { full, half: half ?? null, parsed: true }
}

/** Builds a before/after migration entry for one explosive Item. */
function migrationEntryFor(item) {
  const before = item.system.aoeRadius ?? ''
  const { full, half, parsed } = parseLegacyAoeRadius(before)
  return { name: item.name, uuid: item.uuid, before, after: { full, half }, parsed }
}

/** Migrates every explosive Item's aoeRadius across the world and compendium; GM-only. */
export async function migrateExplosiveAreaOfEffect() {
  if (!game.user.isGM) {
    ui.notifications.warn('Only the GM can run the explosive AOE migration.')
    return { updated: [], unparsed: [] }
  }

  const updated = []
  const unparsed = []

  const applyTo = async (item) => {
    if (item.type !== 'explosive') return
    const entry = migrationEntryFor(item)
    await item.update({ 'system.areaOfEffect': entry.after })
    updated.push(entry)
    if (!entry.parsed) unparsed.push(entry)
  }

  // World-level items (not owned by any actor).
  for (const item of game.items.filter((i) => i.type === 'explosive')) {
    await applyTo(item)
  }

  // Actor-owned items - PCs and NPCs both.
  for (const actor of game.actors) {
    for (const item of actor.items.filter((i) => i.type === 'explosive')) {
      await applyTo(item)
    }
  }

  // The explosives compendium pack itself.
  const pack = game.packs.get(`${FALLOUTZERO.systemId}.explosives`)
  if (pack) {
    const wasLocked = pack.locked
    if (wasLocked) await pack.configure({ locked: false })
    try {
      const docs = await pack.getDocuments()
      for (const item of docs) {
        await applyTo(item)
      }
    } finally {
      if (wasLocked) await pack.configure({ locked: true })
    }
  }

  console.log(
    `[falloutzero] Explosive AOE migration: ${updated.length} item(s) updated, ` +
      `${unparsed.length} could not be confidently parsed and need a manual check.`,
  )
  if (unparsed.length) {
    console.warn('[falloutzero] Explosive AOE migration - needs manual review:', unparsed)
  }

  return { updated, unparsed }
}
