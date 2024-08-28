import { FalloutZeroWeapon } from './_module.mjs'

export default class FalloutZeroRangedWeapon extends FalloutZeroWeapon {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = super.defineSchema()
    const requiredInteger = { required: true, nullable: false, integer: true }
    schema.abilityMod = new fields.StringField({ initial: 'agi' })
    schema.skillBonus = new fields.StringField({ initial: 'guns' })
    schema.quantity = new fields.StringField({ initial: '1' })
    schema.consumesAmmo = new fields.BooleanField({ initial: true })
    schema.decay = new fields.NumberField({ initial: 10, min: 0, max: 10 })
    schema.junk = new fields.SchemaField({
      quantity1 : new fields.NumberField({initial:3, min: 0,}),
      quantity2 : new fields.NumberField({initial:3, min: 0,}),
      quantity3 : new fields.NumberField({initial:0, min: 0,}),
      type1 : new fields.StringField({initial:"Screws"}),
      type2 : new fields.StringField({initial:"Steel"}),
      type3 : new fields.StringField({initial:""}),
      qtyReq : new fields.NumberField({...requiredInteger, initial: 1, min: 1 }),
    })
    return schema
  }

  prepareDerivedData() {
    super.prepareDerivedData()
  }
}
