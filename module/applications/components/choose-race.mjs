const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
export default class ChooseRace extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(races) {
        super()
        this.races = races
    }

    #choice = null
    get choice() {
        return this.#choice
    }

    static DEFAULT_OPTIONS = {
      form: {
        submitOnChange: false,
        closeOnSubmit: true,
      },
      actions: {
        race: ChooseRace.onRaceChoice,
        cancel: ChooseRace.onCancel,
      },
      classes: ['pipboy-dialog'],
      position: { width: 640 },
      window: {
        title: 'Choose your Race!',
        resizable: true
      }
    };

    static PARTS = {
        main: {
            template: 'systems/arcane-arcade-fallout/templates/level-up/dialog/choose-race.hbs',
            scrollable: [""]
        },
    }

    static #onSubmit(choice) {
      this.choice = choice
    }

    static async create() {
      const racePack = game.packs.find((p) => p.collection === 'arcane-arcade-fallout.race')
      const allRaces = await racePack.getDocuments()
      const races = allRaces.sort((a, b) => a.name.localeCompare(b.name))

      this.app = new this(races);

      const { promise, resolve } = Promise.withResolvers();
      this.app.addEventListener("close", () => resolve(this.choice), { once: true });
      this.app.render({ force: true });
      return promise;
    }

    async _prepareContext() {
        return {
            races: this.races,
        }
    }

    static onRaceChoice(e, target) {
        const { itemId } = target.dataset
        const choice = this.races.find((race) => race.id === itemId)
        ChooseRace.#onSubmit(choice)
        this.close()
    }

    static onCancel() {
        ChooseRace.#onSubmit(null)
        this.close()
    }
  }
