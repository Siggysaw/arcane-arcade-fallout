import { FALLOUTZERO } from '../config.mjs'
export default class FalloutZeroBackground extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = {}

    schema.races = new fields.SchemaField(
      Object.keys(FALLOUTZERO.races).reduce((obj, race) => {
        obj[race] = new fields.SchemaField({
          id: new fields.StringField({
            initial: FALLOUTZERO.races[race].id,
          }),
          label: new fields.StringField({
            initial: FALLOUTZERO.races[race].label,
          }),
          grants: new fields.ArrayField(
            new fields.SchemaField({
              _id: new fields.DocumentIdField({ initial: () => foundry.utils.randomID() }),
              key: new fields.StringField({ initial: undefined }),
              type: new fields.StringField(),
              name: new fields.StringField(),
            }),
          ),
        })
        return obj
      }, {}),
    )

    schema.grantedItems = new fields.ArrayField(new fields.StringField())

    return schema
  }
}
