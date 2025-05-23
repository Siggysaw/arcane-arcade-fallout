import FalloutZeroItemBase from './itemBase.mjs'

export default class FalloutZeroArmorUpgrade extends FalloutZeroItemBase {

  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = super.defineSchema()
    schema.short = new fields.StringField({ required: true, nullable: false, initial: '' })
    schema.baseCost = new fields.NumberField({ initial: 0, min: 0 })
    schema.requirement = new fields.StringField({ initial: 'None' })
    schema.armorClass = new fields.NumberField({ initial: 0 })
    schema.damageThreshold = new fields.NumberField({ initial: 0 })
    schema.rank = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1, max: 3 })
    schema.load = new fields.NumberField({ initial: 0 })
    schema.slots = new fields.NumberField({ initial: -1 })
    schema.strReq = new fields.NumberField({ initial: 0 })
    schema.upgradeType = new fields.StringField({ initial: 'armor' })
    schema.img = new fields.StringField({
      initial: this.img,
    })

    return schema
  }

  prepareDerivedData() {
    console.log(this)
  }
}
