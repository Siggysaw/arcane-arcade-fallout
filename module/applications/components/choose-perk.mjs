const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
export default class ChoosePerk extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(actor, perks) {
        super()
        this.actor = actor
        this.onlyAvailablePerks = true
        this.perks = perks
        this.filteredPerks = this.filterPerks()
        this.app = null
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
        filter: ChoosePerk.onFilter,
        perk: ChoosePerk.onPerkChoice,
        cancel: ChoosePerk.onCancel,
      },
      position: { width: 800 },
      window: {
        resizable: true
      }
    };

    static PARTS = {
        main: {
            template: 'systems/arcane-arcade-fallout/templates/level-up/dialog/choose-perk.hbs',
            scrollable: [""]
        },
    }

    get nextLevel() {
        return this.actor.system.level + 1
    }
  
    static #onSubmit(choice) {
      this.choice = choice
    }
  
    static async create(actor) {
      const perksPack = game.packs.find((p) => p.collection === 'arcane-arcade-fallout.perks')
      const allPerks = await perksPack.getDocuments()
      const perks = allPerks.sort((a, b) => {
        const nameA = a.name.toUpperCase()
        const nameB = b.name.toUpperCase()
        if (nameA < nameB) {
            return -1;
        }

        if (nameA > nameB) {
            return 1;
        }
        
          return 0;
      }).map((perk) => {
        if (
            perk.system.lvlReq > 1 ||
            perk.system.raceReq.length > 0 ||
            (perk.system.specialReq.special !== '' && perk.system.specialReq.special !== 'None')
        ) {
            perk.hasRequirements = true
        }
        return perk
      })

      this.app = new this(actor, perks);

      const { promise, resolve } = Promise.withResolvers();
      this.app.addEventListener("close", () => resolve(this.choice), { once: true });
      this.app.render({ force: true });
      return promise;
    }

    async _prepareContext() {
        return {
            perks: this.filteredPerks,
            onlyAvailablePerks: this.onlyAvailablePerks,
        }
    }

    filterPerks() {
        return this.perks.filter((perk) => {
            const raceIds = perk.system.raceReq.map((race) => race.id)
            const hasSpecialReq = (perk.system.specialReq.special && perk.system.specialReq.special !== 'None')
            if (
                (!perk.system.lvlReq || this.nextLevel >= perk.system.lvlReq) &&
                (!hasSpecialReq || this.actor.system.abilities[perk.system.specialReq.special].base >= perk.system.specialReq.value) &&
                (raceIds.length === 0 || raceIds.includes(this.actor.getRaceType()))
            ) {
                return perk
            }
        })
    }

    static onPerkChoice (e, target) {
        const { perkId } = target.dataset
        const choice = this.perks.find((perk) => perk.id === perkId)
        ChoosePerk.#onSubmit(choice)
        this.close()
    }

    static onFilter (e, target) {
        this.onlyAvailablePerks = target.checked
        if (this.onlyAvailablePerks) {
            this.filteredPerks = this.filterPerks()
        } else {
            this.filteredPerks = this.perks
        }
        this.render()
    }

    static onCancel () {
        ChoosePerk.#onSubmit(null)
        this.close()
    }
  }