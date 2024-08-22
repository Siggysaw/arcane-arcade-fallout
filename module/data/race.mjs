import FalloutZeroItemBase from './itemBase.mjs'

export default class FalloutZeroRace extends FalloutZeroItemBase {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = super.defineSchema()

    schema.type = new fields.StringField({ initial: 'human' })
    schema.type = new fields.NumberField({ initial: '0' })

    return schema
  }

  prepareDerivedData() {}
}
