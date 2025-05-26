import { FalloutZeroItemBase } from './_module.mjs'
import FalloutZeroItem from '../documents/item.mjs'
import FalloutZeroActor from '../documents/actor.mjs'

export default class FalloutZeroArmor extends FalloutZeroItemBase {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = super.defineSchema()
    const requiredInteger = { required: true, nullable: false, integer: true }
    schema.baseCost = new fields.SchemaField({
      value: new fields.NumberField({
        initial: 0,
      }),
      base: new fields.NumberField({
        initial: 0,
      }),
    })
    schema.cost = new fields.NumberField({ initial: 0 })
    schema.itemEquipped = new fields.BooleanField({ initial: false })
    schema.decay = new fields.NumberField({ initial: 10, min: 0, max: 10 })
    schema.junk = new fields.SchemaField({
      quantity1: new fields.NumberField({ initial: 5, min: 0, }),
      quantity2: new fields.NumberField({ initial: 0, min: 0, }),
      quantity3: new fields.NumberField({ initial: 0, min: 0, }),
      type1: new fields.StringField({ initial: "Cloth" }),
      type2: new fields.StringField({ initial: "" }),
      type3: new fields.StringField({ initial: "" }),
      qtyReq: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
    })
    schema.img = new fields.StringField({
      initial: 'systems/arcane-arcade-fallout/assets/vaultboy/armor-icon.png',
    })
    schema.armorClass = new fields.SchemaField({
      value: new fields.NumberField({
        initial: 0,
      }),
      base: new fields.NumberField({
        initial: 0,
      }),
    })
    schema.damageThreshold = new fields.SchemaField({
      value: new fields.NumberField({
        initial: 0,
      }),
      base: new fields.NumberField({
        initial: 0,
      }),
    })
    schema.slots = new fields.SchemaField({
      value: new fields.NumberField({
        initial: 0,
      }),
      base: new fields.NumberField({
        initial: 0,
      }),
    })
    schema.strReq = new fields.SchemaField({
      value: new fields.NumberField({
        initial: 0,
      }),
      base: new fields.NumberField({
        initial: 0,
      }),
    })
    schema.load = new fields.NumberField({ initial: 0, min: 0 })
    schema.baseLoad = new fields.NumberField({ initial: 0, min: 0 })
    schema.upgrade = new fields.SchemaField({
      slotCount: new fields.NumberField({ initial: 0, min: 0 }),
      slots: new fields.SchemaField({
        name: new fields.StringField({ initial: '', }),
        uuid: new fields.StringField({ initial: '', }),
        img: new fields.StringField({ initial: '', })
      })
    })
    return schema
  }

  prepareDerivedData() {

  }
}
