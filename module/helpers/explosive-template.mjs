// Explosive AOE template: player drags Foundry's native circle tool; auto-placed only on a roll of 1.

/** Places a blast template centered on the thrower, for the roll-of-1 "exploded in hand" case. */
export async function placeExplosionOnThrower(originToken, aoe) {
  const outerRadius = aoe?.half ?? aoe?.full
  if (!(outerRadius > 0) || !originToken) return null

  const templateData = {
    t: 'circle',
    distance: outerRadius,
    x: originToken.center?.x ?? 0,
    y: originToken.center?.y ?? 0,
    fillColor: game.user.color ?? '#ff8c3f',
    flags: {
      falloutzero: {
        areaOfEffect: aoe,
      },
    },
  }

  const [created] = await canvas.scene.createEmbeddedDocuments('MeasuredTemplate', [templateData])
  return created ?? null
}
