/* ---- Unarmed Strike starting weapon -----------------------------------------
   Every newly-created actor gets a copy of the "Unarmed Strike" meleeWeapon
   added to their inventory and equipped, so brand-new characters/NPCs start
   with a usable weapon on the sheet.

   Deliberately narrow scope: this only fires on the createActor hook below.
   It does not sweep existing actors, does not watch tokens, and does not
   react to later equip/unequip changes on other weapons - see
   claude/unarmed-strike-auto-equip.md in the project notes for the broader
   version that was tried and reverted the same day. */

const UNARMED_STRIKE_UUID = 'Compendium.arcane-arcade-fallout.melee-weapons.Item.dEy72ouM1YoawrxO'

/**
 * Add "Unarmed Strike" to a newly-created actor's inventory and equip it.
 * No-ops if the actor already somehow has one (e.g. duplicated from another
 * actor) or if this is a compendium template actor.
 * @param {Actor} actor
 */
export async function grantStartingUnarmedStrike(actor) {
  if (!actor?.items || actor.pack) return

  const alreadyHasIt = actor.items.some(
    (i) => i.type === 'meleeWeapon' && i.name === 'Unarmed Strike',
  )
  if (alreadyHasIt) return

  const source = await fromUuid(UNARMED_STRIKE_UUID)
  if (!source) return

  const data = source.toObject()
  data.system.itemEquipped = true

  await actor.createEmbeddedDocuments('Item', [data])
}

Hooks.on('createActor', (actor) => {
  if (!game.user.isGM) return
  grantStartingUnarmedStrike(actor)
})
