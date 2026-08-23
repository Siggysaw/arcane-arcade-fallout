import { FALLOUTZERO } from '../config.mjs'

/* ---- Auto-apply damage relay ----------------------------------------------
   Attack rolls can auto-roll damage and apply it straight to whichever
   targeted tokens were hit (see dice/attack-roll.mjs#autoApplyDamage).
   Applying damage calls FalloutZeroActor#applyDamage, which persists an
   update on the TARGET actor - something only that actor's owner can do.
   For an NPC that's almost always the GM, not the attacking player, so a
   player's attack can't apply damage directly to a monster they don't own.

   This relays the request over the world's existing socket channel to
   whichever GM client is the table's single "active" GM, so exactly one GM
   ends up applying it. See group-roll.mjs for why this is a raw
   game.socket call rather than a socketlib dependency - same reasoning
   applies here: one message type doesn't justify the dependency, and
   "socket": true is already turned on in system.json for group rolls. */

const PKG_ID = FALLOUTZERO.systemId
const SOCKET = `system.${PKG_ID}`

/**
 * DamageDescription[] carries a Set for `properties`, which doesn't survive
 * Foundry's socket relay (JSON-serialized) as-is.
 * @param {DamageDescription[]} damages
 */
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
    // Only the table's single "active" GM client acts, so a session with
    // more than one GM logged in doesn't apply the same hit twice.
    if (!game.user.isGM || game.user !== game.users.activeGM) return
    const actor = fromUuidSync(payload.actorUuid)
    if (!actor) return
    actor.applyDamage(deserializeDamages(payload.damages), payload.options ?? {})
  })
})

/**
 * Apply damage to a single actor - directly if the current user owns it,
 * otherwise relayed to the table's active GM.
 * @param {Actor} actor
 * @param {DamageDescription[]} damages
 * @param {DamageApplicationOptions} [options={}]
 * @returns {Promise<void>}
 */
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
