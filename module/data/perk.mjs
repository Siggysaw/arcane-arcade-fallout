import FalloutZeroItemBase from './itemBase.mjs'

export default class FalloutZeroPerk extends FalloutZeroItemBase {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = super.defineSchema()

    schema.name = new fields.StringField({ initial: 'perk' })
    schema.lvlReq = new fields.NumberField({ initial: 1, min: 1 })
    schema.specialReq = new fields.SchemaField({
      special: new fields.StringField({ initial: 'None' }),
      value: new fields.NumberField({ min: 1, max: 10, initial: 1 }),
    }),
    schema.raceReq = new fields.ArrayField(
      new fields.SchemaField({
        id: new fields.StringField(),
        label: new fields.StringField()
      }), { initial: [] }
    )
    schema.grants = new fields.ArrayField(
      new fields.SchemaField({
        _id: new fields.DocumentIdField({ initial: () => foundry.utils.randomID() }),
        uuid: new fields.StringField({ initial: undefined }),
        type: new fields.StringField(),
        name: new fields.StringField(),
        quantity: new fields.NumberField({ initial: 1, min: 1 }),
      }), { initial: [] }
    )
    schema.repeat = new fields.SchemaField({
      canRepeat: new fields.BooleanField({ initial: false }),
      times: new fields.NumberField({ initial: 2 }),
      requirement: new fields.StringField({ initial: ''})
    })

    return schema
  }

  prepareDerivedData() {}
}
