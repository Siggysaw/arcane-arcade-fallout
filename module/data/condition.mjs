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

    return schema
  }
}
