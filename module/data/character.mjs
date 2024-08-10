import FalloutZeroActor from './actorBase.mjs'
import { FALLOUTZERO } from '../config.mjs'

export default class FalloutZeroCharacter extends FalloutZeroActor {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = super.defineSchema()

    schema.level = new fields.NumberField({
      ...requiredInteger,
      initial: 1,
      min: 1,
      max: 30,
    })

    schema.penalties = new fields.SchemaField(
      Object.keys(FALLOUTZERO.penalties).reduce((obj, penalty) => {
        obj[penalty] = new fields.SchemaField({
          label: new fields.StringField({ required: true }),
          value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
          base : new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
          modifiers: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
          roll: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
        })
        return obj
      }, {snack : new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),}),
    )


    schema.limbdamage = new fields.SchemaField(
      Object.keys(FALLOUTZERO.limbdamage).reduce((obj, damage) => {
        obj[damage] = new fields.SchemaField({
          label: new fields.StringField({ required: true }),
          description: new fields.StringField({}),
        })
        return obj
      }, {}),
    )

    schema.carryLoad = new fields.SchemaField({
      base: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      modifiers: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),
      baseMax: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      modifiersMax: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      max: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.attackBonus = new fields.NumberField({ initial: 0 })
    schema.xp = new fields.NumberField({ initial: 0 })
    schema.healingRate = new fields.SchemaField({
      base: new fields.NumberField({ initial: 0 }),
      value: new fields.NumberField({ initial: 0 }),
      modifiers: new fields.NumberField({ initial: 0 })
    })
    schema.combatSequence = new fields.SchemaField({
      base : new fields.NumberField({ initial: 0 }),
      value : new fields.NumberField({ initial: 0 }),
      modifiers : new fields.NumberField({ initial: 0 }),
      advantage : new fields.NumberField({ initial: 0 })
    })
    schema.partyNerve = new fields.SchemaField({
      base: new fields.NumberField({ initial: 0 }),
      value: new fields.NumberField({ initial: 0 }),
      modifiers: new fields.NumberField({ initial: 0 }),
      advantage: new fields.NumberField({ initial: 0 })
    })
    schema.groupSneak = new fields.SchemaField({
      base: new fields.NumberField({ initial: 0 }),
      value: new fields.NumberField({ initial: 0 }),
      modifiers: new fields.NumberField({ initial: 0 }),
      advantage: new fields.NumberField({ initial: 0 })
    })
    schema.irradiated = new fields.NumberField({ initial: 0, min: 0 })
    schema.combatActionsexpanded = new fields.BooleanField({ initial: false })
    schema.passiveSense = new fields.SchemaField({
      base : new fields.NumberField({ initial: 0 }),
      value : new fields.NumberField({ initial: 0 }),
      modifiers : new fields.NumberField({ initial: 0 })
    })
    schema.penaltyTotal = new fields.NumberField({ initial: 0, min: 0 })
    schema.properties = new fields.HTMLField()
    schema.activePartymember = new fields.BooleanField({ initial: true })
    return schema
  }

  prepareBaseData() {
    super.prepareBaseData()
    /*for (const key in this.penalties) {
      this.penalties[key].label = FALLOUTZERO.penalties[key].label
    }*/
    for (const key in this.limbdamage) {
      this.limbdamage[key].description = FALLOUTZERO.limbdamage[key].description
      this.limbdamage[key].label = FALLOUTZERO.limbdamage[key].label
    }
  }

  /**
   * @override
   * Augment the actor source data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    super.prepareDerivedData()
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.abilities) {
      // Calculate the modifier using d20 rules.
      this.abilities[key].mod = Math.floor(this.abilities[key].value - 5)
    }
    // Loop through skill scores, and add their modifiers to our sheet output.
    for (const key in this.skills) {
      this.skills[key].ability = FALLOUTZERO.skills[key].ability
      this.skills[key].value = this.skills[key].base + this.skills[key].modifiers
    }
    // Base Character Stat Creation
    this.armorClass.value = this.armorClass.base + this.armorClass.armor + this.armorClass.modifiers
    this.damageThreshold.value = this.damageThreshold.base + this.damageThreshold.armor + this.damageThreshold.modifiers
    this.penalties.hunger.value = Math.max(this.penalties.hunger.base + this.penalties.hunger.modifiers, 0)
    this.passiveSense.value = 12 + this.passiveSense.base + this.abilities.per.mod + this.passiveSense.modifiers
    this.penalties.exhaustion.value = Math.max(this.penalties.exhaustion.base + this.penalties.exhaustion.modifiers, 0)
    this.penalties.dehydration.value = Math.max(this.penalties.dehydration.base + this.penalties.dehydration.modifiers,0)
    this.penalties.radiation.value = Math.max(this.penalties.radiation.base + this.penalties.radiation.modifiers,0)
    this.penalties.fatigue.value = Math.max(this.penalties.fatigue.base + this.penalties.fatigue.modifiers,0)
    this.radiationDC.base = 12 - this.abilities['end'].mod
    this.radiationDC.value = this.radiationDC.base + this.radiationDC.modifiers
    this.penaltyTotal =
      this.penalties.hunger.value +
      this.penalties.dehydration.value +
      this.penalties.exhaustion.value +
      this.penalties.radiation.value +
      this.penalties.fatigue.value
    this.carryLoad.baseMax = this.abilities['str'].value * 10
    this.carryLoad.max = this.carryLoad.baseMax + this.carryLoad.modifiersMax
    this.combatSequence.value = this.combatSequence.base + this.abilities.per.mod + this.combatSequence.modifiers
    this.healingRate.value = this.healingRate.base + Math.floor((this.level + this.abilities['end'].value) / 2) + this.healingRate.modifiers


    // Perk Automation
    function searchItems(actor, search) {
      return actor.parent.items.find((i) => i.name == search)
    }
    function searchAllActiveItems(actor, search) {
      const activeCharacterList = characterList.filter((FalloutZeroActor) => FalloutZeroActor.system.activePartymember === true)
      return activeCharacterList.items.find((i) => i.name == search)
    }

    const dumbLuck = searchItems(this, "Dumb Luck")
    const backtoback = searchItems(this, "Back to Back")
    const alertness = searchItems(this, "Alertness")
    const aliveandkickin = searchItems(this, "Alive and Kickin'")

    alertness ? this.passiveSense.value = 12 + this.passiveSense.base + (this.abilities.per.mod * 2) + this.passiveSense.modifiers : this.passiveSense.value
    dumbLuck ? this.luckmod = Math.floor(this.abilities['lck'].mod) : this.luckmod = Math.floor(this.abilities['lck'].mod / 2)
    this.luckmod < 0 ? this.luckmod = -1 : this.luckmod
    aliveandkickin ? this.penalties.exhaustion.roll += - 3 : this.penalties.exhaustion.roll

  }
}
