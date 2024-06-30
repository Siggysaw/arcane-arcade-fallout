import { FALLOUTZERO } from '../config.mjs'
export default class FalloutZeroBackground extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = {}

    function generateRaceSchema(id, label) {
      return new fields.SchemaField({
        id: new fields.StringField({
          initial: id,
        }),
        label: new fields.StringField({
          initial: label,
        }),
        grants: new fields.ArrayField(
          new fields.SchemaField({
            _id: new fields.DocumentIdField({ initial: () => foundry.utils.randomID() }),
            key: new fields.StringField({ initial: undefined }),
            type: new fields.StringField(),
            name: new fields.StringField(),
            quantity: new fields.NumberField({ initial: 1, min: 1 }),
          }),
        ),
      })
    }

    schema.races = new fields.SchemaField(
      Object.keys(FALLOUTZERO.races).reduce(
        (obj, race) => {
          obj[race] = generateRaceSchema(FALLOUTZERO.races[race].id, FALLOUTZERO.races[race].label)
          return obj
        },
        {
          allRaces: generateRaceSchema('allRaces', 'All Races'),
        },
      ),
    )

    schema.grantedItems = new fields.ArrayField(new fields.StringField())

    return schema
  }
}
