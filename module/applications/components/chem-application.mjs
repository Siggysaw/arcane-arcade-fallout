
const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
export default class ChemApplication extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(entities, options = {}) {
        super(options);
        this.actors = entities
        this.chosenCharacter = ''
        this.newActorData = this.actors.reduce((acc, actor) => {
            acc[actor.id] = {
            }
            return acc
        }, {})
    }

    static DEFAULT_OPTIONS = {
        tag: "form",
        form: {
            handler: ChemApplication.myFormHandler,
            submitOnChange: false,
            closeOnSubmit: true,
        },
        actions: {
            divideGroup: ChemApplication.onDivideGroup,
            cancel: ChemApplication.onCancel,
        },
        window: {
            title: 'Use This Chem On:',
            resizable: true
        }
    }

    static PARTS = {
        main: {
            template: 'systems/arcane-arcade-fallout/templates/dialog/chem-application.hbs',
        },
    }

  async _prepareContext() {
    return {
      activeOnly: this.activeOnly,
      actors: this.actors,
      newActorData: this.newActorData,
      chosenCharacter: this.chosenCharacter
    }
  }
  static async myFormHandler() {
      console.log(this.chosenCharacter)
    }

  _onRender() {
    this.element.querySelector('[data-character-select]')?.addEventListener('change', (event) => {
      this.chosenCharacter = event.target.value
      awaitestingMessage(chosenCharacter)
    })
  }

  static onDivideGroup(e) {
    Object.keys(this.newActorData).forEach((actorId) => {
      
    })
    this.render(true)
  }
    static onCancel (e) {
        e.preventDefault()
        this.close()
    }
}
