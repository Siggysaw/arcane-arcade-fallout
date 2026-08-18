/**
 * Manage Active Effect instances through an Actor or Item Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning document which manages this effect
 */
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

/**
 * Prepare the data structure for Active Effects which are currently embedded in an Actor or Item.
 * @param {ActiveEffect[]} effects    A collection or generator of Active Effect documents to prepare sheet data for
 * @return {object}                   Data for rendering
 */
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

/**
 * Flatten a document's `system` data into a sorted list of dot-notation
 * attribute key paths (e.g. "system.crafting.type", "system.cost.value"),
 * suitable for populating an Active Effect Change's "Attribute Key" field.
 * Reads from the document's source data (toObject()) rather than the live
 * prepared `system` getter, so derived/computed values and non-plain
 * objects on the DataModel don't leak into the list.
 * @param {Actor|Item|null} doc   The document whose `system` data to inspect
 * @returns {string[]}
 */
export function getSystemAttributeKeys(doc) {
  if (!doc?.system) return []
  const plainSystem = doc.toObject().system ?? {}
  const flat = foundry.utils.flattenObject(plainSystem)
  return Object.keys(flat)
    .map((path) => `system.${path}`)
    .sort()
}

/**
 * Turn every Active Effect Change "Attribute Key" input in a rendered
 * ActiveEffectConfig sheet into a dropdown-with-autocomplete (native
 * <input list="..."> + <datalist>) populated with every dot-notation path
 * available under the owning document's `system` data. For an effect on an
 * Item that's currently owned by an Actor, the Actor's `system` paths are
 * offered too (deduped, merged into one sorted list) since that's usually
 * what a transferable Item effect is actually meant to target. Re-run on
 * every render — rows get added/removed via the sheet's own "Add
 * Change"/"Delete Change" controls, which each trigger a fresh render — so
 * the datalist stays in sync with whatever key inputs currently exist
 * without needing its own change-tracking.
 *
 * Hooked to `renderActiveEffectConfig` (see registerHooks.mjs). Handles
 * both an ApplicationV2-style raw HTMLElement and a legacy jQuery-wrapped
 * element, since core sheets in this compatibility range (v12-14) aren't
 * consistently one or the other.
 * @param {ActiveEffectConfig} app
 * @param {HTMLElement|JQuery} html
 */
export function attachAttributeKeyAutocomplete(app, html) {
  const root = html instanceof HTMLElement ? html : html?.[0]
  if (!root) return

  const owner = app.document?.parent
  const keySet = new Set(getSystemAttributeKeys(owner))

  // Effects on an Item most commonly end up applying to that item's owning
  // Actor once equipped (an ActiveEffect with transfer:true applies its
  // changes to the parent Actor, not the Item), so offer the actor's
  // fields too whenever the item is actually owned by one — in addition
  // to, not instead of, the item's own fields.
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
