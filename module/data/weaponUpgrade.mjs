import FalloutZeroItemBase from './itemBase.mjs'

export default class FalloutZeroWeaponUpgrade extends FalloutZeroItemBase {

  
  
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = super.defineSchema()
    schema.name = new fields.StringField({ initial: 'Camouflage'})
    schema.baseCost = new fields.StringField({ initial:'90%'})
    schema.equipTime = new fields.StringField({ initial:'15 minutes'})
    schema.craftingTime = new fields.StringField({ initial: '1 hour'})
    schema.equipWeapons = new fields.StringField({ initial: 'Any weapon'})
    schema.slots = new fields.NumberField({ initial:-1})
    schema.craftingDC = new fields.StringField({ initial: '+0'})
    schema.upgradeType = new fields.StringField({ initial: 'melee'})
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

  prepareDerivedData() {
  }
}
