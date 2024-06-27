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

  detailsState = {}

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

    context.races = itemData.system.races

    for (let race in context.races) {
      this.detailsState[race] = false
    }
    context.detailsState = this.detailsState

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
      const raceType = e.currentTarget.dataset.raceType
      if (!itemId || !raceType) return

      const grants = this.object.system.races[raceType].grants
      const newGrants = grants.filter((grant) => grant._id !== itemId)
      const dataLocation = `system.races.${raceType}.grants`
      this.object.update({ [dataLocation]: newGrants })
    })

    html.on('click', '[data-race-details]', (e) => {
      const raceType = e.currentTarget.dataset.raceDetails
      this.detailsState[raceType] = !this.detailsState[raceType]
    })

    super.activateListeners(html)
  }

  async _onDrop(event) {
    event.preventDefault()

    if (!event?.currentTarget?.dataset) return

    let dropData
    try {
      dropData = JSON.parse(event.dataTransfer.getData('text/plain'))
    } catch (err) {
      console.error(err)
      return false
    }
    if (dropData === undefined || dropData.type !== 'Item') return false

    const permitted = ['armor', 'rangedWeapon', 'meleeWeapon', 'ammo', 'miscItem', 'foodAnddrink']

    const item = await fromUuid(dropData.uuid)

    if (!permitted.includes(item.type)) {
      ui.notifications.warn('Not permitted item drop')
      return false
    }

    const raceType = event.currentTarget.dataset.grantRace
    const dataLocation = `system.races.${raceType}.grants`
    this.item.update({
      [dataLocation]: [
        ...this.item.system.races[raceType].grants,
        {
          id: item._id,
          key: item.uuid,
          type: item.type,
          name: item.name,
        },
      ],
    })
  }
}
