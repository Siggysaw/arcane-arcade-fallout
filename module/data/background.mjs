export default class FalloutZeroBackground extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = {}

    schema.grants = new fields.ArrayField(
      new fields.SchemaField({
        _id: new fields.DocumentIdField({ initial: () => foundry.utils.randomID() }),
        key: new fields.StringField({ initial: undefined }),
        type: new fields.StringField(),
        name: new fields.StringField(),
      }),
    )

    return schema
  }
}
