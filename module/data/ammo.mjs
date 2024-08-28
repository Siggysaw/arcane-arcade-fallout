import FalloutZeroItemBase from './itemBase.mjs'

export default class FalloutZeroItemAmmo extends FalloutZeroItemBase {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = super.defineSchema()

    schema.img = new fields.StringField({
      initial: 'systems/arcane-arcade-fallout/assets/vaultboy/ranged-weapon-icon.webp',
    })
    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 })
    schema.load = new fields.NumberField({ required: true, nullable: false, initial: 0.1, min: 0 })
    schema.cost = new fields.NumberField({ required: true, nullable: false, initial: 1, min: 0 })
    schema.type = new fields.StringField({ initial: '9mm' })
    schema.junk = new fields.SchemaField({
      quantity1 : new fields.NumberField({initial:2}),
      quantity2 : new fields.NumberField({initial:0}),
      quantity3 : new fields.NumberField({initial:0}),
      type1 : new fields.StringField({initial:"Lead"}),
      type2 : new fields.StringField({initial:""}),
      type3 : new fields.StringField({initial:""}),
      qtyReq : new fields.NumberField({...requiredInteger, initial: 5, min: 1 }),
    })
    return schema
  }

  prepareDerivedData() {}
}
