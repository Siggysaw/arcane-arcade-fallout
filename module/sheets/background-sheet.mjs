import { prepareActiveEffectCategories } from '../helpers/effects.mjs'

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class FalloutZeroBackgroundSheet extends ItemSheet {
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
    return 'systems/arcane-arcade-fallout/templates/background/background.hbs'
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

    return context
  }
  /* -------------------------------------------- */

  /** @override */

  activateListeners(html) {
    const dragDrop = new DragDrop({
      dropSelector: '[data-grant-drop]',
      callbacks: { drop: this._onDrop.bind(this) },
    })
    dragDrop.bind(html[0])

    html.on('click', '[data-delete-grant]', (e) => {
      const itemId = e.currentTarget.dataset.deleteGrant
      if (!itemId) return

      const grants = this.object.system.grants
      const newGrants = grants.filter((grant) => grant.id === itemId)
      this.object.update({ 'system.grants': newGrants })
    })

    super.activateListeners(html)
  }

  async _onDrop(event) {
    event.preventDefault()
    let dropData
    try {
      dropData = JSON.parse(event.dataTransfer.getData('text/plain'))
    } catch (err) {
      return false
    }
    if (dropData === undefined || dropData.type !== 'Item') return false

    const permitted = ['armor', 'rangedWeapon', 'meleeWeapon']

    const item = await fromUuid(dropData.uuid)

    if (!permitted.includes(item.type)) {
      ui.notifications.warn('Not permitted item drop')
      return false
    }

    this.item.update({
      'system.grants': [
        ...this.item.system.grants,
        {
          key: item.uuid,
          type: item.type,
          name: item.name,
        },
      ],
    })
  }
}
