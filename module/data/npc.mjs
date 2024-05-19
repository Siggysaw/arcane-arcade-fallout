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
    schema.xp = new fields.NumberField({ initial: 0, min: 0 })
    schema.combatSequence = new fields.NumberField({ initial: 0, min: 0 })
    schema.healingRate = new fields.NumberField({ initial: 0, min: 0 })
    schema.npcPassivesense = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    })
    schema.penaltyTotal = new fields.NumberField({ initial: 0, min: 0 })
    schema.properties = new fields.HTMLField()

    return schema
  }

  prepareBaseData() {
    super.prepareBaseData()
    for (const key in this.penalties) {
      this.penalties[key].label = FALLOUTZERO.penalties[key]
    }
    this.passiveSense = 12 + this.abilities['per'].mod
  }
}
