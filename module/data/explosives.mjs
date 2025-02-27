import { FalloutZeroWeapon } from './_module.mjs'

export default class FalloutZeroExplosives extends FalloutZeroWeapon {
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
    schema.abilityMod = new fields.StringField({ initial: 'per' })
    schema.skillBonus = new fields.StringField({ initial: 'explosives' })

    return schema
  }

  prepareDerivedData() {}
}
