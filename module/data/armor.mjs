import { FalloutZeroWeapon } from './_module.mjs'

export default class FalloutZeroRangedWeapon extends FalloutZeroWeapon {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = super.defineSchema()

    schema.abilityMod = new fields.StringField({ initial: 'agi' })
    schema.upgrades = new fields.HTMLField({})	
    schema.skillBonus = new fields.StringField({ initial: 'guns' })
    schema.consumesAmmo = new fields.BooleanField({ initial: true })
    schema.decay = new fields.NumberField({ initial:10, min:0, max:10})	
    schema.quantity = new fields.NumberField({ initial:1, min:0})		

	
    return schema
  }

  prepareDerivedData() {
  
  }
}
