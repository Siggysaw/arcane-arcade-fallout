export default class FalloutZeroItemBase extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = {}

    schema.description = new fields.HTMLField()
    schema.itemEquipped = new fields.BooleanField({initial: false})
    schema.itemOpen = new fields.BooleanField()
    schema.quantity = new fields.NumberField({initial: 1})		

    return schema
  }
}
