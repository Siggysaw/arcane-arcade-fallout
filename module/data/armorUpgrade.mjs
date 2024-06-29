import FalloutZeroItemBase from './itemBase.mjs'

export default class FalloutZeroArmorUpgrade extends FalloutZeroItemBase {

  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = super.defineSchema()
    schema.img = new fields.StringField({
      initial: 'systems/arcane-arcade-fallout/assets/vaultboy/perk-icons/inshiningarmor.png',
    })
    schema.short = new fields.StringField({required: true, nullable: false, initial: ''})
    schema.cost = new fields.NumberField({ initial:0, min:0})
    schema.requirement = new fields.StringField({ initial: 'None'})
    schema.armorClass = new fields.NumberField({ initial:0})
    schema.damageThreshold = new fields.NumberField({ initial:0})
    schema.rank = new fields.NumberField({ ...requiredInteger, initial: 1, min:1, max: 3})
    schema.load = new fields.NumberField({ initial:0})	
    schema.strReq = new fields.NumberField({ initial:0})
    schema.craftingTime = new fields.StringField({ initial: '1 hour'})
    schema.craftingDC = new fields.StringField({ initial: '+0'})
    schema.matsReq1 = new fields.SchemaField({
      mat: new fields.StringField({}),
      qty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.matsReq2 = new fields.SchemaField({
      mat: new fields.StringField({}),
      qty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.matsReq3 = new fields.SchemaField({
      mat: new fields.StringField({}),
      qty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })

    return schema
  }

  prepareDerivedData() {}
}
