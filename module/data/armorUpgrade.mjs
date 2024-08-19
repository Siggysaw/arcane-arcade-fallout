import FalloutZeroItemBase from './itemBase.mjs'

export default class FalloutZeroArmorUpgrade extends FalloutZeroItemBase {

  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = super.defineSchema()
    schema.short = new fields.StringField({required: true, nullable: false, initial: ''})
    schema.baseCost = new fields.NumberField({ initial:0, min:0})
    schema.requirement = new fields.StringField({ initial: 'None'})
    schema.armorClass = new fields.NumberField({ initial:0})
    schema.damageThreshold = new fields.NumberField({ initial:0})
    schema.rank = new fields.NumberField({ ...requiredInteger, initial: 1, min:1, max: 3})
    schema.load = new fields.NumberField({ initial:0})
    schema.slots = new fields.NumberField({ initial:-1})
    schema.strReq = new fields.NumberField({ initial:0})
    schema.craftingTime = new fields.StringField({ initial: '1 hour'})
    schema.craftingDC = new fields.StringField({ initial: '+0'})
    schema.upgradeType = new fields.StringField({ initial: 'armor'})
    schema.img = new fields.StringField({
      initial: this.img,
    })
    schema.matsReq1 = new fields.SchemaField({
      mat: new fields.StringField({initial:""}),
      qty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.matsReq2 = new fields.SchemaField({
      mat: new fields.StringField({initial:""}),
      qty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.matsReq3 = new fields.SchemaField({
      mat: new fields.StringField({initial:""}),
      qty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.matsReq4 = new fields.SchemaField({
      mat: new fields.StringField({initial:""}),
      qty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.matsReq5 = new fields.SchemaField({
      mat: new fields.StringField({initial:""}),
      qty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.matsReq6 = new fields.SchemaField({
      mat: new fields.StringField({initial:""}),
      qty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.matsReq7 = new fields.SchemaField({
      mat: new fields.StringField({initial:""}),
      qty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.matsReq8 = new fields.SchemaField({
      mat: new fields.StringField({initial:""}),
      qty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })

    return schema
  }

  prepareDerivedData() {}
}
