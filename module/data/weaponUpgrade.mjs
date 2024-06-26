import FalloutZeroItemBase from './itemBase.mjs'

export default class FalloutZeroWeaponUpgrade extends FalloutZeroItemBase {

  
  
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = super.defineSchema()
    //To be determined
    schema.name = new fields.StringField({ initial: 'Camouflage'})
    schema.short = new fields.StringField({ initial: 'Camo'})
    schema.cost = new fields.NumberField({ initial:0, min:0})
    schema.craftingTime = new fields.StringField({ initial: '1 hour'})
    schema.armorClass = new fields.NumberField({ initial:0})
    schema.damageThreshold = new fields.NumberField({ initial:0})
    schema.rank = new fields.NumberField({ ...requiredInteger, initial: 1, min:1, max: 3})
    schema.strReq = new fields.NumberField({ initial:0, min:0, max: 3})

    return schema
  }

  prepareDerivedData() {}
}
