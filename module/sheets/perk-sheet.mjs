import { FALLOUTZERO } from '../config.mjs'
import { prepareActiveEffectCategories } from '../helpers/effects.mjs'

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export default class FalloutZeroBackgroundSheet extends ItemSheet {
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

    const dragDrop = new DragDrop({
      dropSelector: '[data-race-drop]',
      callbacks: { drop: this._onDropRace.bind(this) },
    })
    dragDrop.bind(html[0])

    html[0].querySelectorAll('[data-remove-race]').forEach((el) => {
      el.addEventListener('click', this._onRemoveRace.bind(this))
    })
  }

  async _onRemoveRace(e) {
    e.stopPropagation()
    const { removeRace } = e.currentTarget.dataset
    if (!removeRace) return

    const newRaceReqs = this.item.system.raceReq.filter((req) => {
      return req.id !== removeRace
    })

    const dataLocation = `system.raceReq`
    this.item.update({
      [dataLocation]: newRaceReqs,
    })
  }

  async _onDropRace(e) {
    e.stopPropagation()
    e.preventDefault()

    let dropData
    try {
      dropData = JSON.parse(event.dataTransfer.getData('text/plain'))
    } catch (err) {
      console.error(err)
      return false
    }
    if (dropData === undefined || dropData.type !== 'Item') return false

    const permitted = [
      'race',
    ]

    const item = await fromUuid(dropData.uuid)

    if (!permitted.includes(item.type)) {
      ui.notifications.warn('Only races are accepted here')
      return false
    }

    const alreadyExists = this.item.system.raceReq.find((req) => {
      return req.id === item.system.type
    })

    if (alreadyExists) {
      ui.notifications.warn('Race is already required')
      return false
    }

    const newRaceReqs = [...this.item.system.raceReq, {
      id: item.system.type,
      label: FALLOUTZERO.races[item.system.type]?.label || item.system.type,
    }].filter((req) => Boolean(req.id) && Boolean(req.label))

    const dataLocation = `system.raceReq`
    this.item.update({
      [dataLocation]: newRaceReqs,
    })
  }
}
