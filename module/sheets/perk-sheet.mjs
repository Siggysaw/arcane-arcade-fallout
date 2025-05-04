import { FALLOUTZERO } from '../config.mjs'
import { onManageActiveEffect, prepareActiveEffectCategories } from '../helpers/effects.mjs'

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export default class FalloutZeroPerkSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['falloutzero', 'sheet', 'item'],
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'description',
        },
      ],
    })
  }

  /** @override */
  get template() {
    return 'systems/arcane-arcade-fallout/templates/perk/perk.hbs'
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData()

    // Use a safe clone of the item data for further operations.
    const itemData = context.data

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = this.item.getRollData()

    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system
    context.flags = itemData.flags

    // Prepare active effects for easier access
    context.effects = prepareActiveEffectCategories(this.item.effects)

    context.specialOptions = Object.values(FALLOUTZERO.abilities)

    return context
  }
  /* -------------------------------------------- */

  /** @override */

  activateListeners(html) {
    super.activateListeners(html)

    // Active Effect management
    html.on('click', '.effect-control', (ev) => onManageActiveEffect(ev, this.item))
  }

}
