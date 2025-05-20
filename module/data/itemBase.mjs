export default class FalloutZeroItemBase extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = {}
    schema.description = new fields.HTMLField()
    schema.hideItem = new fields.BooleanField({ initial: false })
    schema.itemEquipped = new fields.BooleanField({ initial: false })
    schema.wildWasteland = new fields.BooleanField()
    schema.abilityMod = new fields.StringField({ initial: '' })
    schema.skillBonus = new fields.StringField({ initial: '' })
    schema.itemOpen = new fields.BooleanField()
    schema.quantity = new fields.NumberField({ initial: 1 })
    schema.cost = new fields.NumberField({ initial: 0, required: true, nullable: false, integer: true })
    schema.load = new fields.NumberField({ initial: 0.1, required: true, nullable: false, integer: false })

    schema.crafting = new fields.SchemaField({
      craftable: new fields.BooleanField({ initial: false }),
      quantity: new fields.NumberField({ initial: 1, min: 1 }),
      type: new fields.StringField({ initial: undefined }),
      mainRequirements: new fields.ArrayField(
        new fields.SchemaField({
          key: new fields.StringField(),
          dc: new fields.NumberField(),
        }), {
        initial: [{
          key: CONFIG.FALLOUTZERO.skills.crafting.id,
          dc: 5,
        }]
      }
      ),
      additionalRequirements: new fields.ArrayField(
        new fields.SchemaField({
          key: new fields.StringField(),
          dc: new fields.NumberField(),
        })
      ),
      time: new fields.SchemaField({
        value: new fields.NumberField({ initial: 1, min: 1 }),
        unit: new fields.StringField({ initial: 'hour' }),
      }),
      materials: new fields.ArrayField(
        new fields.SchemaField({
          uuid: new fields.StringField(),
          name: new fields.StringField(),
          quantity: new fields.NumberField({
            initial: 1,
            min: 1
          }),
        })
      )
    })
    return schema
  }
  prepareDerivedData() {
    super.prepareDerivedData()
  }
}
