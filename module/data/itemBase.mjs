export default class FalloutZeroItemBase extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = {}

    schema.description = new fields.HTMLField()
    schema.itemEquipped = new fields.BooleanField()	

    return schema
  }
}
