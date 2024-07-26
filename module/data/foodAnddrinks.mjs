export default class FalloutZeroItemBase extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = super.defineSchema()

    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 })
    schema.load = new fields.NumberField({ required: true, nullable: false, initial: 1, min: 0 })
    schema.cost = new fields.NumberField({ required: true, nullable: false, initial: 1, min: 0 })
    schema.modifiers = new fields.SchemaField({
      path1: new fields.StringField({initial: ""}),
      modType1: new fields.StringField({}),
      modType1: new fields.NumberField({}),
      path2: new fields.StringField({initial: ""}),
      modType2: new fields.StringField({}),
      modType2: new fields.NumberField({}),
      path3: new fields.StringField({initial: ""}),
      modType3: new fields.StringField({}),
      modType3: new fields.NumberField({}),
      path4: new fields.StringField({initial: ""}),
      modType4: new fields.StringField({}),
      modType4: new fields.NumberField({}),
    })
    schema.img = new fields.StringField({
      initial: 'systems/arcane-arcade-fallout/assets/vaultboy/wasteland camel.png',
    })

    return schema
  }
}
