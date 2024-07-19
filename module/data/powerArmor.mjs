import { FalloutZeroItemBase,FalloutZeroItem } from './_module.mjs'

export default class FalloutZeroPowerArmor extends FalloutZeroItemBase {
  static defineSchema() {
    const fields = foundry.data.fields
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
    })
    return schema
  }

  prepareDerivedData() {    
  }
}
