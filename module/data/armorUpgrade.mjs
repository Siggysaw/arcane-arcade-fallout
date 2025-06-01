import FalloutZeroItemBase from './itemBase.mjs'

export default class FalloutZeroArmorUpgrade extends FalloutZeroItemBase {

  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = super.defineSchema()
    schema.rank = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1, max: 3 })
    schema.equipped = new fields.BooleanField({ initial: false })
    schema.type = new fields.StringField({ initial: 'cloth' })
    schema.img = new fields.StringField({
      initial: this.img,
    })

    return schema
  }

  prepareDerivedData() {
  }
}
