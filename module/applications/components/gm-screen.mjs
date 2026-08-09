const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
const { DragDrop, TextEditor } = foundry.applications.ux;

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
      closeOnSubmit: true,
    },
    actions: {
      divideGroup: GMApplication.onDivideGroup,
      cancel: GMApplication.onCancel,
      openSheet: GMApplication.onOpenSheet,
      toggleKarmaCap: GMApplication.onToggleKarmaCap,
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

  async _prepareContext() {
    return {
      activeOnly: this.activeOnly,
      actors: this.actors,
      newActorData: this.newActorData,
      groupXp: this.groupXp,
      groupCaps: this.groupCaps,
      groupXpmodifier: this.groupXpmodifier
    }
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
      this.close()
    } catch (error) {
      console.log('Error awarding caps and xp')
    }
  }

  _onRender(context, options) {
    this.#dragDrop.forEach((d) => d.bind(this.element))

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
  }

  async _prepareContext() {
    const conditionsByActor = this.actors.reduce((acc, actor) => {
      const grouped = actor.items
        .filter((i) => i.type === 'condition')
        .reduce((group, item) => {
          const key = item.name
          if (!group[key]) {
            group[key] = {
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

    return {
      activeOnly: this.activeOnly,
      actors: this.actors,
      newActorData: this.newActorData,
      conditionsByActor,
      groupXp: this.groupXp,
      groupCaps: this.groupCaps,
      groupXpmodifier: this.groupXpmodifier
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
