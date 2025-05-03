import { FalloutZeroWeapon } from './_module.mjs'

export default class FalloutZeroMeleeWeapon extends FalloutZeroWeapon {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = super.defineSchema()
    const requiredInteger = { required: true, nullable: false, integer: true }
    schema.abilityMod = new fields.StringField({ initial: 'str' })
    schema.skillBonus = new fields.StringField({ initial: 'melee_weapons' })
    schema.decay = new fields.NumberField({ initial: 10, min: 0, max: 10 })
    schema.consumesAmmo = new fields.BooleanField({ initial: false })
    schema.hideItem = new fields.BooleanField({ initial: false })
    schema.junk = new fields.SchemaField({
      qtyReq : new fields.NumberField({...requiredInteger, initial: 1, min: 1 }),
      quantity1 : new fields.NumberField({initial:3, min: 0,}),
      quantity2 : new fields.NumberField({initial:0, min: 0,}),
      quantity3 : new fields.NumberField({initial:0, min: 0,}),
      type1 : new fields.StringField({initial:"Steel"}),
      type2 : new fields.StringField({initial:""}),
      type3 : new fields.StringField({initial:""}),
      qtyReq : new fields.NumberField({...requiredInteger, initial: 1, min: 1 }),
    })
    return schema
  }

  prepareDerivedData() {
    super.prepareDerivedData()
  }
}
