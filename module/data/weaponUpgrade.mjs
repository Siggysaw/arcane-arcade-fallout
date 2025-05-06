import FalloutZeroItemBase from './itemBase.mjs'

export default class FalloutZeroWeaponUpgrade extends FalloutZeroItemBase {

  static defineSchema() {
    const fields = foundry.data.fields
    const schema = super.defineSchema()
    schema.name = new fields.StringField({ initial: 'Camouflage' })
    schema.baseCost = new fields.StringField({ initial: '90%' })
    schema.equipTime = new fields.StringField({ initial: '15 minutes' })
    schema.equipWeapons = new fields.StringField({ initial: 'Any weapon' })
    schema.slots = new fields.NumberField({ initial: -1 })
    schema.upgradeType = new fields.StringField({ initial: 'melee' })

    return schema
  }

  prepareDerivedData() {
  }
}
