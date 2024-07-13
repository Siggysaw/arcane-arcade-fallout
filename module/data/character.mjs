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
        })
        return obj
      }, {}),
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
    schema.xp = new fields.NumberField({ initial: 0 })
    schema.healingRate = new fields.NumberField({ initial: 0 })
    schema.groupSneak = new fields.NumberField({ initial: 0 })
    schema.combatSequence = new fields.NumberField({ initial: 0 })
    schema.partyNerve = new fields.NumberField({ initial: 0 })
    schema.irradiated = new fields.NumberField({ initial: 0, min: 0 })
    schema.combatActionsexpanded = new fields.BooleanField({ initial: false })
    schema.passiveSense = new fields.NumberField({...requiredInteger,   initial: 0,
    })
    schema.penaltyTotal = new fields.NumberField({ initial: 0, min: 0 })
    schema.properties = new fields.HTMLField()
    schema.conditions = new fields.SchemaField({
      Blinded: new fields.BooleanField({ initial: false }),
      Bleeding: new fields.BooleanField({ initial: false }),
      BleedingLvls: new fields.NumberField({ initial: 0 }),
      Burning: new fields.BooleanField({ initial: false }),
      Buzzed: new fields.BooleanField({ initial: false }),
      Corroded: new fields.BooleanField({ initial: false }),
      Dazed: new fields.BooleanField({ initial: false }),
      Deafened: new fields.BooleanField({ initial: false }),
      Drunk: new fields.BooleanField({ initial: false }),
      Frightened: new fields.BooleanField({ initial: false }),
      Grappled: new fields.BooleanField({ initial: false }),
      Hammered: new fields.BooleanField({ initial: false }),
      Heavily_Encumbered: new fields.BooleanField({ initial: false }),
      Invisible: new fields.BooleanField({ initial: false }),
      Poisoned: new fields.BooleanField({ initial: false }),
      Prone: new fields.BooleanField({ initial: false }),
      Restrained: new fields.BooleanField({ initial: false }),
      Shadowed: new fields.BooleanField({ initial: false }),
      Shock: new fields.BooleanField({ initial: false }),
      Slowed: new fields.BooleanField({ initial: false }),
      Unconscious: new fields.BooleanField({ initial: false }),
      Wasted: new fields.BooleanField({ initial: false }),
    })

    return schema
  }

  prepareBaseData() {
    super.prepareBaseData()
    for (const key in this.penalties) {
      this.penalties[key].label = FALLOUTZERO.penalties[key]
    }
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


    this.radiationDC.base = 12 - this.abilities['end'].mod
    this.radiationDC.value = this.radiationDC.base + this.radiationDC.modifiers
    this.healingRate = Math.floor((this.level + this.abilities['end'].value) / 2)
    this.penaltyTotal =
      this.penalties.hunger.value +
      this.penalties.dehydration.value +
      this.penalties.exhaustion.value +
      this.penalties.radiation.value +
      this.penalties.fatigue.value
    this.passiveSense = 12 + this.abilities['per'].mod
    this.carryLoad.baseMax = this.abilities['str'].value * 10
    this.carryLoad.max = this.carryLoad.baseMax + this.carryLoad.modifiersMax

    this.luckmod = Math.floor(this.abilities['lck'].mod / 2)
    if (this.luckmod < 0) {
      this.luckmod = -1
    }
  }
}
