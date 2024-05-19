import { FalloutZeroWeapon } from './_module.mjs'

export default class FalloutZeroRangedWeapon extends FalloutZeroWeapon {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = super.defineSchema()

    schema.abilityMod = new fields.StringField({ initial: 'agi' })
    schema.skillBonus = new fields.StringField({ initial: 'guns' })

    schema
    return schema
  }

  prepareDerivedData() {}
}
