import { FalloutZeroItemBase,FalloutZeroItem } from './_module.mjs'

export default class FalloutZeroJunkItem extends FalloutZeroItemBase {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = super.defineSchema()
    schema.load = new fields.NumberField({integer: false, initial:0.2, min: 0 })
    schema.cost = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 })
    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 })
    schema.junk = new fields.SchemaField({
      quantity1 : new fields.NumberField({initial:0}),
      quantity2 : new fields.NumberField({initial:0}),
      quantity3 : new fields.NumberField({initial:0}),
      type1 : new fields.StringField({initial:""}),
      type2 : new fields.StringField({initial:""}),
      type3 : new fields.StringField({initial:""}),
    })
    schema.img = new fields.StringField({
      initial: 'systems/arcane-arcade-fallout/assets/vaultboy/perk-icons/expertengineer.png',
    })

    return schema
  }
}
