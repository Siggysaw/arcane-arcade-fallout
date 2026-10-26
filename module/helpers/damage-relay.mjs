import { FALLOUTZERO } from '../config.mjs'

// Relays damage application to the active GM's client since only an actor's owner can apply it.

const PKG_ID = FALLOUTZERO.systemId
const SOCKET = `system.${PKG_ID}`

/** Converts each damage's properties Set to an array so it survives Foundry's socket JSON relay. */
function serializeDamages(damages) {
  return damages.map((d) => ({ ...d, properties: Array.from(d.properties ?? []) }))
}

/** @param {object[]} damages  Wire-shape damages from serializeDamages. */
function deserializeDamages(damages) {
  return damages.map((d) => ({ ...d, properties: new Set(d.properties ?? []) }))
}

Hooks.once('ready', () => {
  game.socket.on(SOCKET, (payload) => {
    if (payload?.type !== 'applyDamage') return
    // Only the active GM applies this, so multiple GMs online don't double-apply damage.
    if (!game.user.isGM || game.user !== game.users.activeGM) return
    const actor = fromUuidSync(payload.actorUuid)
    if (!actor) return
    actor.applyDamage(deserializeDamages(payload.damages), payload.options ?? {})
  })
})

/** Applies damage to an actor directly if owned, otherwise relays it to the active GM. */
export async function applyDamageToActor(actor, damages, options = {}) {
  if (!actor) return

  if (actor.isOwner) {
    await actor.applyDamage(damages, options)
    return
  }

  game.socket.emit(SOCKET, {
    type: 'applyDamage',
    actorUuid: actor.uuid,
    damages: serializeDamages(damages),
    options,
  })

  if (!game.users.activeGM) {
    ui.notifications.warn(
      `No GM is connected to apply auto-damage to ${actor.name}. Apply it manually once a GM is online.`,
    )
  }
}
