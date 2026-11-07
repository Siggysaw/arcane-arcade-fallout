const SYSTEM_PERKS_PACK = 'arcane-arcade-fallout.perks'

const byName = (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })

/**
 * Gathers every perk available to the Level Up / Choose Perk and Perk List dialogs:
 *   1. the system's own perks compendium,
 *   2. any world-level compendium (packageType "world") holding perk Items,
 *   3. perk Items in the world's Items directory.
 *
 * Later sources override earlier ones by (case-insensitive) name, so a GM who copies a
 * system perk into the world and edits it sees their version instead of a duplicate.
 * Anything not from the system pack is flagged `isCustom` for the "Custom" card tag.
 *
 * Only documents the current user can see are returned: world Items need at least
 * Limited ownership and world compendiums must be visible to the player.
 *
 * @returns {Promise<Item[]>} perks sorted by name
 */
export async function getAllPerks() {
    const perksByName = new Map()
    const add = (perk, isCustom) => {
        perk.isCustom = isCustom
        perksByName.set(perk.name.trim().toLowerCase(), perk)
    }

    const systemPack = game.packs.get(SYSTEM_PERKS_PACK)
    if (systemPack) {
        try {
            for (const perk of await systemPack.getDocuments()) add(perk, false)
        } catch (error) {
            console.error(error)
            ui.notifications.warn('Failed to get perks from compendium')
        }
    }

    const worldPacks = game.packs.filter((p) =>
        p.metadata.packageType === 'world' &&
        p.documentName === 'Item' &&
        p.visible
    )
    for (const pack of worldPacks) {
        try {
            const perks = await pack.getDocuments({ type: 'perk' })
            for (const perk of perks) add(perk, true)
        } catch (error) {
            console.error(`Failed to load perks from world compendium ${pack.collection}`, error)
        }
    }

    for (const perk of game.items.filter((i) => i.type === 'perk' && i.visible)) {
        add(perk, true)
    }

    return [...perksByName.values()].sort(byName)
}

/** Same requirements-box check both perk dialogs use to decide whether to show the box. */
export function perkHasRequirements(perk) {
    const special = perk.system.specialReq?.special
    return Boolean(
        perk.system.lvlReq > 1 ||
        perk.system.raceReq?.length > 0 ||
        (special && special !== 'None')
    )
}
