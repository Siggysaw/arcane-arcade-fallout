import FalloutZeroItemBase from './itemBase.mjs'

export default class FalloutZeroMaterial extends FalloutZeroItemBase {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 500,
      height: 850,
    })
  }

  itemContextMenu = [
    {
      name: game.i18n.localize('falloutzero.context-menu.delete'),
      icon: '<i class="fas fa-trash"></i>',
      callback: (element) => {
        const uuid = element.closest('.item').data('uuid')
        const attachments = this.item.system.attachedItems
        attachments.splice(attachments.indexOf(uuid), 1)
        this.item.update({
          system: {
            attachedItems: attachments,
          },
        })
      },
    },
  ]

  async getData() {
    const context = await super.getData()

    const attachments = {}
    for (const uuid of this.item.system.attachedItems) {
      attachments[uuid] = await fromUuid(uuid)
    }
    context.attachments = attachments

    return context
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

    const permitted = [
      'junkItem'
    ]

    const item = await fromUuid(dropData.uuid)

    if (!permitted.includes(item.type)) {
      //ui.notifications.error(game.i18n.format('legends.items.not-allowed'))
      return false
    }

    let attachments = this.item.system.attachedItems
    attachments.push(dropData.uuid)
    this.item.update({
      system: {
        attachedItems: attachments,
      },
    })
  }

  activateListeners(html) {
    const dragDrop = new DragDrop({
      dropSelector: '.material-sheet',
      callbacks: { drop: this._onDrop.bind(this) },
    })
    dragDrop.bind(html[0])
    new ContextMenu(html, '.item .menu', this.itemContextMenu)

    super.activateListeners(html)
  }
}
  
