import FalloutZeroItemBase from './itemBase.mjs'

export default class FalloutZeroWeaponUpgrade extends FalloutZeroItemBase {

  
  
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = super.defineSchema()
    schema.img = new fields.StringField({
      initial: 'systems/arcane-arcade-fallout/assets/vaultboy/perk-icons/systems/arcane-arcade-fallout/assets/NPC-Attacks/arm-blade.png',
    })
    schema.name = new fields.StringField({ initial: 'Camouflage'})
    schema.baseCost = new fields.StringField({ initial:'90%'})
    schema.equipTime = new fields.StringField({ initial:'15 minutes'})
    schema.craftingTime = new fields.StringField({ initial: '1 hour'})
    schema.equipWeapons = new fields.StringField({ initial: 'Any weapon'})
    schema.slots = new fields.NumberField({ initial:-1})
    schema.craftingTime = new fields.StringField({ initial: '1 hour'})
    schema.craftingDC = new fields.StringField({ initial: '+0'})
    schema.upgradeType = new fields.StringField({ initial: 'melee'})
    schema.matsReq1 = new fields.SchemaField({
      mat: new fields.StringField({}),
      qty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.matsReq2 = new fields.SchemaField({
      mat: new fields.StringField({}),
      qty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.matsReq3 = new fields.SchemaField({
      mat: new fields.StringField({}),
      qty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.matsReq4 = new fields.SchemaField({
      mat: new fields.StringField({}),
      qty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.matsReq5 = new fields.SchemaField({
      mat: new fields.StringField({}),
      qty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.matsReq6 = new fields.SchemaField({
      mat: new fields.StringField({}),
      qty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.matsReq7 = new fields.SchemaField({
      mat: new fields.StringField({}),
      qty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.matsReq8 = new fields.SchemaField({
      mat: new fields.StringField({}),
      qty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    return schema
  }

  prepareDerivedData() {}
}
