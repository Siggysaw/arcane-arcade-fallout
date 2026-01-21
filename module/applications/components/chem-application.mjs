
const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
export default class ChemApplication extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(entities,item,startingActor, options = {}) {
        super(options);
        this.actors = entities
        this.itemID = item
        this.actor= startingActor
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
      startingActor: this.actor,
      activeOnly: this.activeOnly,
      actors: this.actors,
      newActorData: this.newActorData,
      chosenCharacter: this.chosenCharacter
    }
  }
  static async myFormHandler() {
    // Form Completed, Data sent in, grab the character chosen to administer aid to
    let giftedCharacter = game.actors.get(this.chosenCharacter)

    // What item did you specifically use on this character
    let giftedItem = this.actor.items.get(this.itemID)

    // Save the amount the gifting character has after giving the item to another
    let saveQty = giftedItem.system.quantity - 1

    // Set the item to 1 temporarily so that the receiving party doesn't get more than 1
    await giftedItem.update({ 'system.quantity': 1 })

    // Clone the item you used onto the chosen character
    await giftedCharacter.createEmbeddedDocuments('Item', [giftedItem])
    await giftedItem.update({ 'system.quantity': saveQty })

    // Locate the item on the gifted to character to get the ID of the created item
    let toLower = giftedCharacter.items.find((i) => i.name == giftedItem.name)
    let toLowerID = toLower._id

    // Send the data to the Chem handling function to get conditions/effects
    await this.actor.lowerInventory(toLowerID,giftedCharacter)
    }

  _onRender() {
    this.element.querySelector('[data-character-select]')?.addEventListener('change', (event) => {
      this.chosenCharacter = event.target.value
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
