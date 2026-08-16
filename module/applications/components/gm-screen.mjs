const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
const { DragDrop, TextEditor } = foundry.applications.ux;

// Packs to leave OUT of the quick-insert search (character-build stuff,
// not things a GM drags onto an actor mid-session). Everything else that's
// an Item compendium gets included automatically.
const QUICK_INSERT_EXCLUDED_PACKS = [
  //'arcane-arcade-fallout.perks',
  //'arcane-arcade-fallout.traits',
  //'arcane-arcade-fallout.race',
  //'arcane-arcade-fallout.background',
  //'arcane-arcade-fallout.properties',
  //'arcane-arcade-fallout.npc-attacks',
  //'arcane-arcade-fallout.upgrades',
]

export default class GMApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  #dragDrop;

  constructor(entities, options = {}) {
    super(options);
    this.actors = entities
    this.groupXp = 0
    this.groupXpmodifier = 0
    this.groupCaps = 0
    this.activeOnly = true
    this.newActorData = this.actors.reduce((acc, actor) => {
      acc[actor.id] = {
        xp: 0,
        caps: 0,
      }
      return acc
    }, {})
    this.#dragDrop = this.#createDragDropHandlers()
  }

  static DEFAULT_OPTIONS = {
    tag: "form",
    form: {
      handler: GMApplication.myFormHandler,
      submitOnChange: false,
      closeOnSubmit: false,
    },
    actions: {
      divideGroup: GMApplication.onDivideGroup,
      cancel: GMApplication.onCancel,
      openSheet: GMApplication.onOpenSheet,
      toggleKarmaCap: GMApplication.onToggleKarmaCap,
      toggleActivePartymember: GMApplication.onToggleActivePartymember,
    },
    window: {
      title: 'GM Screen',
      resizable: true
    },
    dragDrop: [{ dragSelector: null, dropSelector: '[data-actor-drop]' }],
  }

  static PARTS = {
    main: {
      template: 'systems/arcane-arcade-fallout/templates/dialog/gm-screen.hbs',
    },
  }

  async #getQuickInsertItems() {
    const itemPacks = game.packs.filter(
      (pack) => pack.metadata.type === 'Item' && !QUICK_INSERT_EXCLUDED_PACKS.includes(pack.collection)
    )

    const results = await Promise.all(
      itemPacks.map(async (pack) => {
        const index = await pack.getIndex({ fields: ['img', 'type'] })
        return index.map((entry) => ({
          uuid: `Compendium.${pack.collection}.Item.${entry._id}`,
          id: entry._id,
          name: entry.name,
          img: entry.img,
          packType: entry.type,
          packLabel: pack.metadata.label,
        }))
      })
    )

    return results
      .flat()
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  async _prepareContext() {
    const detailActors = this.activeOnly
      ? this.actors.filter((actor) => actor.system.activePartymember)
      : this.actors

    const packItems = await this.#getQuickInsertItems()

    const conditionsByActor = this.actors.reduce((acc, actor) => {
      const grouped = actor.items
        .filter((i) => i.type === 'condition')
        .reduce((group, item) => {
          const key = item.name
          if (!group[key]) {
            group[key] = {
              id: item.id,
              uuid: item.uuid,
              name: item.name,
              img: item.img,
              description: item.system.description,
              quantity: 0,
            }
          }
          group[key].quantity += item.system.quantity ?? 1
          return group
        }, {})
      acc[actor.id] = Object.values(grouped)
      return acc
    }, {})

    const TYPE_ORDER = ['rangedWeapon', 'meleeWeapon', 'ammo', 'foodAnddrink', 'medicine', 'chem']

    const valuableItemsByActor = this.actors.reduce((acc, actor) => {
      const byType = actor.items
        .filter((i) => TYPE_ORDER.includes(i.type) && (i.system?.cost ?? 0) > 0)
        .reduce((groups, item) => {
          if (!groups[item.type]) groups[item.type] = []
          groups[item.type].push({
            id: item.id,
            uuid: item.uuid,
            name: item.name,
            img: item.img,
            quantity: item.system.quantity ?? 1,
            equipped: item.system.itemEquipped ?? false,
          })
          return groups
        }, {})

      acc[actor.id] = Object.keys(byType)
        .map((type) => ({
          type,
          label: game.i18n.localize(CONFIG.Item.typeLabels[type] ?? `TYPES.Item.${type}`),
          items: byType[type].sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type))

      return acc
    }, {})

    return {
      activeOnly: this.activeOnly,
      actors: this.actors,
      detailActors,
      newActorData: this.newActorData,
      conditionsByActor,
      valuableItemsByActor,
      packItems,
      groupXp: this.groupXp,
      groupCaps: this.groupCaps,
      groupXpmodifier: this.groupXpmodifier
    }
  }

  static async onToggleKarmaCap(event, target) {
    event.preventDefault()

    const actorId = target.dataset.actorId
    const capIndex = Number(target.dataset.capIndex)
    const actor = this.actors.find((a) => a.id === actorId)
    if (!actor) return

    const karmaCaps = foundry.utils.deepClone(actor.system.karmaCaps)
    karmaCaps[capIndex] = !karmaCaps[capIndex]

    await actor.update({ 'system.karmaCaps': karmaCaps })
    this.render(true)
  }

  static async onToggleActivePartymember(event, target) {
    event.preventDefault()

    const actorId = target.dataset.actorId
    const actor = this.actors.find((a) => a.id === actorId)
    if (!actor) return

    await actor.update({ 'system.activePartymember': !actor.system.activePartymember })
    this.render(true)
  }

  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        drop: this._canDragDrop.bind(this),
      }
      d.callbacks = {
        dragover: this._onDragOver.bind(this),
        dragleave: this._onDragLeave.bind(this),
        drop: this._onDrop.bind(this),
      }

      return new DragDrop(d)
    })
  }

  _canDragDrop() {
    return game.user.isGM
  }

  static onOpenSheet(event, target) {
    event.preventDefault()
    const actor = this.actors.find((a) => a.id === target.dataset.actorId)
    actor?.sheet.render(true)
  }

  static async myFormHandler() {
    const awards = this.actors.map((actor) => {
      const newXP = actor.system.xp + this.newActorData[actor.id].xp
      const newCaps = actor.system.caps + this.newActorData[actor.id].caps
      return actor.update({
        "system.xp": newXP,
        "system.caps": newCaps
      });
    })

    try {
      await Promise.all(awards)

      this.newActorData = this.actors.reduce((acc, actor) => {
        acc[actor.id] = { xp: 0, caps: 0 }
        return acc
      }, {})
      this.groupXp = 0
      this.groupXpmodifier = 0
      this.groupCaps = 0

      ui.notifications.info('Rewards awarded!')
      this.render(true)
    } catch (error) {
      console.log('Error awarding caps and xp')
    }
  }

  _onRender(context, options) {
    this.#dragDrop.forEach((d) => d.bind(this.element))

    this.element.querySelectorAll('.content-link[draggable="true"]').forEach((link) => {
      link.addEventListener('dragstart', (event) => {
        event.stopPropagation()

        const dragData = {
          type: link.dataset.type,
          uuid: link.dataset.uuid,
        }
        event.dataTransfer.setData('text/plain', JSON.stringify(dragData))
        event.dataTransfer.effectAllowed = 'copy'
      })
    })
    this.element.querySelector('[data-quick-insert-search]')?.addEventListener('input', (event) => {
      const query = event.target.value.trim().toLowerCase()
      const quickInserts = this.element.querySelector('.quick-inserts')

      quickInserts?.classList.toggle('active', query.length > 0)

      quickInserts?.querySelectorAll('[data-item-name]').forEach((el) => {
        const name = el.dataset.itemName.toLowerCase()
        el.style.display = name.includes(query) ? '' : 'none'
      })
    })
    this.element.querySelector('[data-activeOnly]')?.addEventListener('click', (event) => {
      this.activeOnly = !this.activeOnly
      this.render(true)
    })
    this.element.querySelector('[data-group-xp]')?.addEventListener('input', (event) => {
      this.groupXp = parseInt(event.target.value)
    })
    this.element.querySelector('[data-group-xp-modifier]')?.addEventListener('input', (event) => {
      this.groupXpmodifier = parseInt(event.target.value)
    })
    this.element.querySelector('[data-group-caps]')?.addEventListener('input', (event) => {
      this.groupCaps = parseInt(event.target.value)
    })
    this.actors.forEach((actor) => {
      this.element.querySelector(`[data-actor-xp="${actor.id}"]`)?.addEventListener('input', (event) => {
        this.newActorData[actor.id].xp = parseInt(event.target.value)
      })
      this.element.querySelector(`[data-actor-caps="${actor.id}"]`)?.addEventListener('input', (event) => {
        this.newActorData[actor.id].caps = parseInt(event.target.value)
      })
    })
    this.element.querySelectorAll('.condition-badge').forEach((badge) => {
      badge.addEventListener('click', (event) => {
        //event.preventDefault()
        //this._adjustCondition(badge.dataset.actorId, badge.dataset.conditionName, 1)
      })
      badge.addEventListener('contextmenu', (event) => {
        event.preventDefault() // suppress the browser's right-click menu
        this._adjustCondition(badge.dataset.actorId, badge.dataset.conditionName, -1)
      })
    })
  }

  async _adjustCondition(actorId, conditionName, delta) {
    const actor = this.actors.find((a) => a.id === actorId)
    if (!actor) return

    const items = actor.items.filter((i) => i.type === 'condition' && i.name === conditionName)
    if (!items.length) return

    if (delta > 0) {
      const item = items[0]
      const currentQty = item.system.quantity ?? 1
      await item.update({ 'system.quantity': currentQty + 1 })
    } else {
      const item = items[items.length - 1]
      const currentQty = item.system.quantity ?? 1
      if (currentQty <= 1) {
        await item.delete()
      } else {
        await item.update({ 'system.quantity': currentQty - 1 })
      }
    }
  }

  async _onDrop(event) {
    const data = TextEditor.implementation.getDragEventData(event)
    if (data.type !== 'Item') return

    const actorId = event.currentTarget.dataset.actorDrop
    const actor = this.actors.find((a) => a.id === actorId)
    if (!actor) return

    const item = await Item.implementation.fromDropData(data)
    if (!item) return

    await actor.createEmbeddedDocuments('Item', [item.toObject()])
    ui.notifications.info(`${item.name} added to ${actor.name}`)
  }

  _onDragOver(event) {
    event.currentTarget?.classList.add('drag-hover')
  }

  _onDragLeave(event) {
    event.currentTarget?.classList.remove('drag-hover')
  }

  _onFirstRender(context, options) {
    super._onFirstRender(context, options)

    this._actorUpdateHook = Hooks.on('updateActor', (actor) => {
      if (!this.actors.some((a) => a.id === actor.id)) return
      if (this.element.contains(document.activeElement)) return
      this.render(true)
    })
    this._itemCreateHook = Hooks.on('createItem', (item) => {
      if (!this.actors.some((a) => a.id === item.parent?.id)) return
      if (this.element.contains(document.activeElement)) return
      this.render(true)
    })
    this._itemDeleteHook = Hooks.on('deleteItem', (item) => {
      if (!this.actors.some((a) => a.id === item.parent?.id)) return
      if (this.element.contains(document.activeElement)) return
      this.render(true)
    })
    this._itemUpdateHook = Hooks.on('updateItem', (item) => {
      if (!this.actors.some((a) => a.id === item.parent?.id)) return
      if (this.element.contains(document.activeElement)) return
      this.render(true)
    })
  }

  _onClose(options) {
    super._onClose(options)

    Hooks.off('updateActor', this._actorUpdateHook)
    Hooks.off('createItem', this._itemCreateHook)
    Hooks.off('deleteItem', this._itemDeleteHook)
    Hooks.off('updateItem', this._itemUpdateHook)
  }

  static onDivideGroup(e) {
    Object.keys(this.newActorData).forEach((actorId) => {
      let modifiedXP
      this.groupXpmodifier > 0 ? modifiedXP = (this.groupXp * (this.groupXpmodifier / 100)) : modifiedXP = 0
      this.newActorData[actorId].xp = this.groupXp + modifiedXP
      this.newActorData[actorId].caps = this.groupCaps
    })
    this.render(true)
  }

  static onCancel(e) {
    e.preventDefault()
    this.close()
  }
}
