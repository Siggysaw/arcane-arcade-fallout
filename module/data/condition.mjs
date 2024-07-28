import { FalloutZeroItemBase,FalloutZeroItem } from './_module.mjs'

export default class FalloutZeroCondition extends FalloutZeroItemBase {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = super.defineSchema()

    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 })
    schema.load = new fields.NumberField({ required: true, nullable: false, initial: 1, min: 0 })
    schema.cost = new fields.NumberField({ required: true, nullable: false, initial: 1, min: 0 })
    schema.modifiers = new fields.SchemaField({
      path1: new fields.StringField({initial: ""}),
      modType1: new fields.StringField({initial: ""}),
      value1: new fields.StringField({initial: ""}),
      path2: new fields.StringField({initial: ""}),
      modType2: new fields.StringField({initial: ""}),
      value2: new fields.StringField({initial: ""}),
      path3: new fields.StringField({initial: ""}),
      modType3: new fields.StringField({initial: ""}),
      value3: new fields.StringField({initial: ""}),
      path4: new fields.StringField({initial: ""}),
      modType4: new fields.StringField({initial: ""}),
      value4: new fields.StringField({initial: ""}),
    })
    schema.img = new fields.StringField({
      initial: 'systems/arcane-arcade-fallout/assets/vaultboy/perk-icons/chemresistant.png',
    })

    return schema
  }
}
