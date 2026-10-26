// Auto-equips "Unarmed Strike" on every newly-created actor; narrow scope, see project notes.

const UNARMED_STRIKE_UUID = 'Compendium.arcane-arcade-fallout.melee-weapons.Item.dEy72ouM1YoawrxO'

/** Adds "Unarmed Strike" to a new actor's inventory and equips it; no-ops if already present. */
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
