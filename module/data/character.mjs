import FalloutZeroActorBase from './actorBase.mjs'
import { FALLOUTZERO } from '../config.mjs'

export default class FalloutZeroCharacter extends FalloutZeroActorBase {
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

    schema.carryLoad = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
		total: 0,
      }),
      min: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      max: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.background = new fields.StringField({ initial: '', blank: true })
    schema.race = new fields.StringField({ initial: '', blank: true })
    schema.karmaCapflipped = new fields.BooleanField({})
    schema.xp = new fields.NumberField({ initial: 0, min: 0 })
    schema.healingRate = new fields.NumberField({ initial: 0, min: 0 })
    schema.groupSneak = new fields.NumberField({ initial: 0, min: 0 })
    schema.combatSequence = new fields.NumberField({ initial: 0, min: 0 })
    schema.partyNerve = new fields.NumberField({ initial: 0, min: 0 })
    schema.passiveSense = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    })
    schema.penaltyTotal = new fields.NumberField({ initial: 0, min: 0 })

    return schema
  }

  prepareBaseData() {
    super.prepareBaseData()
    for (const key in this.penalties) {
      this.penalties[key].label = FALLOUTZERO.penalties[key]
    }
    this.penalties.radDC.value = 12 - this.abilities['end'].mod
    //players need the ability to increase their max carry load manually.
    //this.carryLoad.max = this.abilities['str'].value * 10
    this.healingRate = Math.floor((this.level + this.abilities['end'].value) / 2)
    this.penaltyTotal =
      this.penalties.hunger.value +
      this.penalties.dehydration.value +
      this.penalties.exhaustion.value +
      this.penalties.radiation.value +
      this.penalties.fatigue.value
	  this.passiveSense = 12 + this.abilities['per'].mod

  }
}
