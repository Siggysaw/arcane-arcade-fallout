import { FalloutZeroWeapon } from './_module.mjs'

export default class FalloutZeroRangedWeapon extends FalloutZeroWeapon {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = super.defineSchema()

    schema.abilityMod = new fields.StringField({ initial: 'agi' })
    schema.skillBonus = new fields.StringField({ initial: 'guns' })
    schema.quantity = new fields.StringField({ initial: '1' })
    schema.consumesAmmo = new fields.BooleanField({ initial: true })
    schema.decay = new fields.NumberField({ initial: 10, min: 0, max: 10 })

    return schema
  }

  prepareDerivedData() {
    super.prepareDerivedData()
  }
}
