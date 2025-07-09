import { FalloutZeroItemBase,FalloutZeroItem } from './_module.mjs'

export default class FalloutZeroPowerArmor extends FalloutZeroItemBase {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = super.defineSchema()
    schema.baseCost = new fields.SchemaField({
      value: new fields.NumberField({
        initial: 0,
      }),
      base: new fields.NumberField({
        initial: 0,
      }),
    })
    schema.cost = new fields.NumberField({initial: 0})
    schema.itemEquipped = new fields.BooleanField({initial: false})
    schema.decay = new fields.NumberField({ initial: 10, min: 0, max: 10 })
    schema.junk = new fields.SchemaField({
      quantity1 : new fields.NumberField({initial:1, min: 0,}),
      quantity2 : new fields.NumberField({initial:0, min: 0,}),
      quantity3 : new fields.NumberField({initial:0, min: 0,}),
      type1 : new fields.StringField({initial:"Power Armor Chassis"}),
      type2 : new fields.StringField({initial:""}),
      type3 : new fields.StringField({initial:""}),
      qtyReq : new fields.NumberField({...requiredInteger, initial: 1, min: 1 }),
    })
    schema.img = new fields.StringField({
      initial: 'systems/arcane-arcade-fallout/assets/vaultboy/perk-icons/thickplating.png',
    })
    schema.armorClass = new fields.SchemaField({
      value: new fields.NumberField({
        initial: 14,
      }),
    })
    schema.repairDC = new fields.SchemaField({
      value: new fields.NumberField({
        initial: 16,
      }),
    })
    schema.allotedTime = new fields.SchemaField({
      value: new fields.StringField({
        initial: "4 hours",
      }),
    })
    schema.strengthMod = new fields.SchemaField({
      value: new fields.NumberField({
        initial: 10,
      }),
    })

      schema.defensePoint = new fields.SchemaField({
          value: new fields.NumberField({
              initial: 0,
          }),
          base: new fields.NumberField({
              initial: 0,
          }),
      })
      schema.armorHP = new fields.SchemaField({
          value: new fields.NumberField({
              initial: 0,
          }),
          max: new fields.NumberField({
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
    schema.operation = new fields.SchemaField({
      value: new fields.NumberField({
        initial: 6,
      }),
      base: new fields.NumberField({
        initial: 6,
      }),
    })	
    schema.load = new fields.NumberField({ initial:100, min:0}),
    schema.baseLoad = new fields.NumberField({ initial:100, min:0}),
    schema.upgrades = new fields.SchemaField({
      upgrade1 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade2 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade3 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade4 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade5 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade6 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade7 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade8 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade9 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade10 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade11 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade12 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
    }),
      schema.armorType = new fields.StringField({ initial: 'power' }),
      schema.upgrade = new fields.SchemaField({
        slotCount: new fields.NumberField({ initial: 6, min: 0 }),
        slots: new fields.ArrayField(
          new fields.SchemaField({
            name: new fields.StringField(),
            uuid: new fields.StringField(),
            img: new fields.StringField(),
            type: new fields.StringField(),
            description: new fields.HTMLField()
          })
        )
      })
    return schema
  }

    prepareDerivedData() { 

  }
}
