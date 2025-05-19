
const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
export default class GMApplication extends HandlebarsApplicationMixin(ApplicationV2) {
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
    },
    window: {
      title: 'GM Screen',
      resizable: true
    }
  }

  static PARTS = {
    main: {
      template: 'systems/arcane-arcade-fallout/templates/dialog/gm-screen.hbs',
    },
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

  _onRender() {
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
      this.element.querySelector(`[data-actor-xp="${actor.id}]"`)?.addEventListener('input', (event) => {
        this.newActorData[actor.id].xp = parseInt(event.target.value)
      })
      this.element.querySelector(`[data-actor-caps="${actor.id}"]`)?.addEventListener('input', (event) => {
        this.newActorData[actor.id].caps = parseInt(event.target.value)
      })
    })
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
