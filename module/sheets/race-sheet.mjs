import { FALLOUTZERO } from '../config.mjs'
import { onManageActiveEffect, prepareActiveEffectCategories } from '../helpers/effects.mjs'

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class FalloutZeroRaceSheet extends ItemSheet {
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
    return 'systems/arcane-arcade-fallout/templates/race/race.hbs'
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData()

    // Use a safe clone of the item data for further operations.
    const itemData = context.data

    // Retrieve the roll data for TinyMCE editors.

    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system
    context.flags = itemData.flags

    context.racesOptions = FALLOUTZERO.races
    // Prepare active effects for easier access
    context.effects = prepareActiveEffectCategories(this.item.effects)

    return context
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html)
    // Active Effect management
    html.on('click', '.effect-control', (ev) => onManageActiveEffect(ev, this.item))

    // handles changing ability on weapon
    // html.on('change', '[data-set-race-type]', (ev) => {
    //   const weaponId = ev.currentTarget.dataset.weaponId

    //   this.item.update('system.type', )
    // })
  }
}
