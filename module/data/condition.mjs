import { FalloutZeroItemBase,FalloutZeroItem } from './_module.mjs'

export default class FalloutZeroCondition extends FalloutZeroItemBase {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = super.defineSchema()

    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 })
    schema.load = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 })
    schema.raceReq = new fields.StringField({initial: "Organics only"})
    schema.cost = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 })
    schema.notes = new fields.StringField({initial: ""})
    schema.apCost = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 })
    schema.range = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 })
    schema.armDC = new fields.StringField({})
    schema.aoeRadius = new fields.StringField({})
    schema.damage1 = new fields.StringField({})
    schema.damageType1 = new fields.StringField({})
    schema.damage2 = new fields.StringField({})
    schema.damageType2 = new fields.StringField({})
    schema.loaddefault = new fields.NumberField({})
    schema.wornload = new fields.NumberField({})
    schema.full = new fields.NumberField({})
    schema.worn = new fields.BooleanField({})
    schema.filled = new fields.BooleanField({})
    schema.abilityMod = new fields.StringField({ initial: 'per' })
    schema.skillBonus = new fields.StringField({ initial: 'explosives' })

    schema.modifiers = new fields.SchemaField({
      path1: new fields.StringField({initial: ""}),
      modType1: new fields.StringField({initial: ""}),
      value1: new fields.StringField({initial: ""}),
      path2: new fields.StringField({initial: ""}),
      modType2: new fields.StringField({initial: ""}),
      value2: new fields.StringField({initial: ""}),
      path3: new fields.StringField({initial: ""}),
      modType3: new fields.StringField({initial: ""}),
      value3: new fields.StringField({initial: ""}),
      path4: new fields.StringField({initial: ""}),
      modType4: new fields.StringField({initial: ""}),
      value4: new fields.StringField({initial: ""}),
    })
    schema.checks = new fields.SchemaField ({
      check1: new fields.StringField({initial: ""}),
      dc1: new fields.StringField({initial: ""}),
      condition1 : new fields.StringField({initial: ""}),
      check2: new fields.StringField({initial: ""}),
      dc2: new fields.StringField({initial: ""}),
      condition2 : new fields.StringField({initial: ""}),
      check3: new fields.StringField({initial: ""}),
      dc3: new fields.StringField({initial: ""}),
      condition3 : new fields.StringField({initial: ""}),
    })
    schema.img = new fields.StringField({
      initial: 'systems/arcane-arcade-fallout/assets/vaultboy/perk-icons/chemresistant.png',
    })
    schema.damage = new fields.SchemaField({
      type: new fields.StringField({ initial: 'piercing' }),
      formula: new fields.StringField({ initial: '2d4' }),
    })
    schema.damages = new fields.ArrayField(
      new fields.SchemaField({
        type: new fields.StringField({ initial: 'piercing' }),
        altType: new fields.StringField({ initial: null, nullable: true }),
        formula: new fields.StringField({ initial: '1d4' }),
      }),
      { initial: [{ type: 'piercing', formula: '1d4' }] },
    )
    // schema.roll = new fields.SchemaField({
    //     diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
    //     diceSize: new fields.StringField({ initial: "d20" }),
    //     diceBonus: new fields.StringField({ initial: "+@str.mod+ceil(@lvl / 2)" })
    // })
    schema.range = new fields.SchemaField({
      short: new fields.NumberField({ initial: 0, min: 0 }),
      long: new fields.NumberField({ initial: 10, blank: true }),
      thrown: new fields.NumberField({ initial: 0 }),
    })
    schema.critical = new fields.SchemaField({
      dice: new fields.NumberField({ initial: 20, blank: true }),
      multiplier: new fields.NumberField({ initial: 1, nullable: false }),
      formula: new fields.StringField({ initial: null, nullable: true }),
      condition: new fields.StringField({ initial: null, nullable: true }),
    })
    schema.ammo = new fields.SchemaField({
      type: new fields.StringField({ initial: '' }),
      assigned: new fields.StringField({}),
      capacity: new fields.SchemaField({
        value: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
        }),
        min: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
        }),
        max: new fields.NumberField({
          ...requiredInteger,
          initial: 6,
        }),
      }),
      consumes: new fields.SchemaField({
        type: new fields.ArrayField(new fields.StringField()),
        target: new fields.StringField(),
        amount: new fields.NumberField({ initial: 1 }),
      }),
    })
    schema.range = new fields.SchemaField({
      short: new fields.NumberField({ initial: 1, min: 0, nullable: false }),
      long: new fields.NumberField({ initial: 1, min: 0, nullable: false }),
      // flat: new fields.NumberField({ initial: null, min: 1})
    })
    return schema
  }
}
