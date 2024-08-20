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
    schema.junk = new fields.SchemaField({
      quantity1 : new fields.NumberField({initial:3}),
      quantity2 : new fields.NumberField({initial:3}),
      quantity3 : new fields.NumberField({initial:0}),
      type1 : new fields.StringField({initial:"Screws"}),
      type2 : new fields.StringField({initial:"Steel"}),
      type3 : new fields.StringField({initial:""}),
    })
    return schema
  }

  prepareDerivedData() {
    super.prepareDerivedData()
  }
}
