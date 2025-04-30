export default class FalloutZeroItemBase extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = {}
    const requiredInteger = { required: true, nullable: false, integer: true }
    schema.description = new fields.HTMLField()
    schema.itemEquipped = new fields.BooleanField({ initial: false })
    schema.vaulttec = new fields.BooleanField({ initial: false })
    schema.wildWasteland = new fields.BooleanField()
    schema.abilityMod = new fields.StringField({ initial: '' })
    schema.skillBonus = new fields.StringField({ initial: '' })
    schema.itemOpen = new fields.BooleanField()
    schema.quantity = new fields.NumberField({ initial: 1 })
    schema.cost = new fields.NumberField({ initial: 0 , required: true, nullable: false, integer: true })
    schema.load = new fields.NumberField({ initial: 0.1 , required: true, nullable: false, integer: false })
    schema.crafting = new fields.SchemaField({
      craftingDC : new fields.StringField({initial:"+0"}),
      craftingTime : new fields.StringField({initial:"1 hour"}),
      multiple : new fields.SchemaField({
        qty : new fields.NumberField({
          min : 1,
          initial : 1,
          ...requiredInteger,
        })
      }),
      matsReq1 : new fields.SchemaField({
        mat: new fields.StringField({initial:""}),
        qty: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: 0,
        }),
      }),
      matsReq2 : new fields.SchemaField({
        mat: new fields.StringField({initial:""}),
        qty: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: 0,
        }),
      }),
      matsReq3 : new fields.SchemaField({
        mat: new fields.StringField({initial:""}),
        qty: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: 0,
        }),
      }),
      matsReq4 : new fields.SchemaField({
        mat: new fields.StringField({initial:""}),
        qty: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: 0,
        }),
      }),
      matsReq5 : new fields.SchemaField({
        mat: new fields.StringField({initial:""}),
        qty: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: 0,
        }),
      }),
      matsReq6 : new fields.SchemaField({
        mat: new fields.StringField({initial:""}),
        qty: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: 0,
        }),
      }),
      matsReq7 : new fields.SchemaField({
        mat: new fields.StringField({initial:""}),
        qty: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: 0,
        }),
      }),
      matsReq8 : new fields.SchemaField({
        mat: new fields.StringField({initial:""}),
        qty: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: 0,
        }),
      }),
      matsReq9 : new fields.SchemaField({
        mat: new fields.StringField({initial:""}),
        qty: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: 0,
        }),
      }),
      matsReq10 : new fields.SchemaField({
        mat: new fields.StringField({initial:""}),
        qty: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: 0,
        }),
      }),
      matsReq11 : new fields.SchemaField({
        mat: new fields.StringField({initial:""}),
        qty: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: 0,
        }),
      }),
      matsReq12 : new fields.SchemaField({
        mat: new fields.StringField({initial:""}),
        qty: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: 0,
        }),
      }),
  })
    return schema
  }
  prepareDerivedData() {
    super.prepareDerivedData()
    this.vaulttec = game.settings.get('core', 'VaultTec')
  }
}
