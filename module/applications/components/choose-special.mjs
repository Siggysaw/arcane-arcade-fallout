import { FALLOUTZERO } from "../../config.mjs";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
export default class ChooseSpecial extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor() {
        super()
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
        special: ChooseSpecial.onSpecialChoice,
        cancel: ChooseSpecial.onCancel,
      },
      window: {
        resizable: true
      }
    };

    static PARTS = {
        main: {
            template: 'systems/arcane-arcade-fallout/templates/level-up/dialog/choose-special.hbs',
            scrollable: [""]
        },
    }
  
    static #onSubmit(choice) {
      this.choice = choice
    }
  
    static async create() {
      const app = new this(); 
      const { promise, resolve } = Promise.withResolvers();
      app.addEventListener("close", () => resolve(this.choice), { once: true });
      app.render({ force: true });
      return promise;
    }

    async _prepareContext() {
        return {
            specials: FALLOUTZERO.abilities
        }
    }


    static onSpecialChoice (e, target) {
        const { specialId } = target.dataset
        const choice = FALLOUTZERO.abilities[specialId]
        ChooseSpecial.#onSubmit(choice)
        this.close()
    }

    static onCancel () {
        ChooseSpecial.#onSubmit(null)
        this.close()
    }
  }