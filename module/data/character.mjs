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
        min: 0,
      }),
      max: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.background = new fields.StringField({ initial: '', blank: true })
    schema.race = new fields.StringField({ initial: '', blank: true })
    schema.xp = new fields.NumberField({ initial: 0 })
    schema.healingRate = new fields.NumberField({ initial: 0 })
    schema.groupSneak = new fields.NumberField({ initial: 0 })
    schema.combatSequence = new fields.NumberField({ initial: 0 })
    schema.partyNerve = new fields.NumberField({ initial: 0 })
    schema.irradiated = new fields.NumberField({ initial: 0, min: 0 })
    schema.passiveSense = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    })
    schema.penaltyTotal = new fields.NumberField({ initial: 0, min: 0 })
    schema.properties = new fields.HTMLField()
    schema.conditions = new fields.SchemaField({
      Blinded: new fields.BooleanField({ initial: false, }),
      Bleeding: new fields.BooleanField({ initial: false, }),
      Burning: new fields.BooleanField({ initial: false, }),
      Buzzed: new fields.BooleanField({ initial: false, }),
      Corroded: new fields.BooleanField({ initial: false, }),
      Dazed: new fields.BooleanField({ initial: false, }),
      Deafened: new fields.BooleanField({ initial: false, }),
      Drunk: new fields.BooleanField({ initial: false, }),
      Frightened: new fields.BooleanField({ initial: false, }),
      Grappled: new fields.BooleanField({ initial: false, }),
      Hammered: new fields.BooleanField({ initial: false, }),
      Heavily_Encumbered: new fields.BooleanField({ initial: false, }),
      Invisible: new fields.BooleanField({ initial: false, }),
      Poisoned: new fields.BooleanField({ initial: false, }),
      Prone: new fields.BooleanField({ initial: false, }),
      Restrained: new fields.BooleanField({ initial: false, }),
      Shadowed: new fields.BooleanField({ initial: false, }),
      Shock: new fields.BooleanField({ initial: false, }),
      Slowed: new fields.BooleanField({ initial: false, }),
      Unconscious: new fields.BooleanField({ initial: false, }),
      Wasted: new fields.BooleanField({ initial: false, }),
    })

    return schema
  }

  prepareBaseData() {
    super.prepareBaseData()
    for (const key in this.penalties) {
      this.penalties[key].label = FALLOUTZERO.penalties[key]
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
    this.carryLoad.max = this.abilities['str'].value * 10

    this.luckmod = Math.floor(this.abilities['lck'].mod / 2)
    if (this.luckmod < 0) {
      this.luckmod = -1
    }
  }
}
