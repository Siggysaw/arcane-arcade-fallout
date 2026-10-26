/** Manages Active Effect instances via effect control buttons on an Actor or Item sheet. */
export function onManageActiveEffect(event, owner) {
  event.preventDefault()
  const a = event.currentTarget
  const li = a.closest('li')
  const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null
  switch (a.dataset.action) {
    case 'create':
      return owner.createEmbeddedDocuments('ActiveEffect', [
        {
          name: game.i18n.format('DOCUMENT.New', {
            type: game.i18n.localize('DOCUMENT.ActiveEffect'),
          }),
          img: 'icons/svg/aura.svg',
          origin: owner.uuid,
          'duration.rounds': li.dataset.effectType === 'temporary' ? 1 : undefined,
          disabled: li.dataset.effectType === 'inactive',
        },
      ])
    case 'edit':
      return effect.sheet.render(true)
    case 'delete':
      return effect.delete()
    case 'toggle':
      return effect.update({ disabled: !effect.disabled })
  }
}

/** Prepares the data structure for Active Effects currently embedded in an Actor or Item. */
export function prepareActiveEffectCategories(effects) {
  // Define effect header categories
  const categories = {
    temporary: {
      type: 'temporary',
      label: game.i18n.localize('FALLOUTZERO.Effect.Temporary'),
      effects: [],
    },
    passive: {
      type: 'passive',
      label: game.i18n.localize('FALLOUTZERO.Effect.Passive'),
      effects: [],
    },
    inactive: {
      type: 'inactive',
      label: game.i18n.localize('FALLOUTZERO.Effect.Inactive'),
      effects: [],
    },
  }

  // Iterate over active effects, classifying them into categories
  for (let e of effects) {
    if (e.disabled) categories.inactive.effects.push(e)
    else if (e.isTemporary) categories.temporary.effects.push(e)
    else categories.passive.effects.push(e)
  }
  return categories
}

/** Flattens a document's system data into sorted dot-notation attribute key paths. */
export function getSystemAttributeKeys(doc) {
  if (!doc?.system) return []
  const plainSystem = doc.toObject().system ?? {}
  const flat = foundry.utils.flattenObject(plainSystem)
  return Object.keys(flat)
    .map((path) => `system.${path}`)
    .sort()
}

/** Turns Attribute Key inputs in an ActiveEffectConfig sheet into an autocomplete dropdown. */
export function attachAttributeKeyAutocomplete(app, html) {
  const root = html instanceof HTMLElement ? html : html?.[0]
  if (!root) return

  const owner = app.document?.parent
  const keySet = new Set(getSystemAttributeKeys(owner))

  // Items owned by an actor also offer the actor's fields, since transfer effects often target it.
  if (owner?.documentName === 'Item' && owner.actor) {
    getSystemAttributeKeys(owner.actor).forEach((key) => keySet.add(key))
  }

  const keys = [...keySet].sort()
  if (!keys.length) return

  const listId = 'aafo-effect-attribute-keys'
  let datalist = root.querySelector(`#${listId}`)
  if (!datalist) {
    datalist = document.createElement('datalist')
    datalist.id = listId
    root.appendChild(datalist)
  }
  datalist.replaceChildren(
    ...keys.map((key) => {
      const option = document.createElement('option')
      option.value = key
      return option
    })
  )

  root.querySelectorAll('input[name$=".key"]').forEach((input) => {
    input.setAttribute('list', listId)
    input.setAttribute('autocomplete', 'off')
  })
}
