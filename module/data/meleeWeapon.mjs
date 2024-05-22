import { FalloutZeroWeapon } from './_module.mjs'

export default class FalloutZeroMeleeWeapon extends FalloutZeroWeapon {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = super.defineSchema()

    schema.abilityMod = new fields.StringField({ initial: 'str' })
    schema.skillBonus = new fields.StringField({ initial: 'melee_weapons' })

    schema.consumesAmmo = new fields.BooleanField({ initial: false })
    return schema
  }

  prepareDerivedData() {}
}
