import FalloutZeroItemBase from './itemBase.mjs'

export default class FalloutZeroItemWeapon extends FalloutZeroItemBase {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = super.defineSchema()

    schema.load = new fields.NumberField({ required: true, nullable: false, initial: 0.1, min: 0 })
    schema.cost = new fields.NumberField({ required: true, nullable: false, initial: 1, min: 0 })
    schema.apCost = new fields.NumberField({ required: true, nullable: false, initial: 1, min: 0 })
    schema.decay = new fields.NumberField({ initial: 10, min: 0, max: 10 })
    schema.reloadDecay = new fields.NumberField({ initial: 0, min: 0, max: 10 })
    schema.itemOpen = new fields.BooleanField()	
    schema.energyWeapon = new fields.BooleanField()	
    schema.properties = new fields.HTMLField()
    schema.strengthRequirement = new fields.NumberField({ initial: 0 })	
    schema.damage = new fields.SchemaField({
      type: new fields.StringField({ initial: 'piercing' }),
      formula: new fields.StringField({ initial: '2d4' }),
    })
    // schema.roll = new fields.SchemaField({
    //     diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
    //     diceSize: new fields.StringField({ initial: "d20" }),
    //     diceBonus: new fields.StringField({ initial: "+@str.mod+ceil(@lvl / 2)" })
    // })
    schema.range = new fields.SchemaField({
      short: new fields.NumberField({ initial: 1 }),
      long: new fields.NumberField({ initial: 10, blank: true }),
    })
    schema.critical = new fields.SchemaField({
      dice: new fields.NumberField({ initial: 20, blank: true }),
      bonus: new fields.StringField({ initial: '2d4' }),
      multiplier: new fields.NumberField({ initial: 1 }),
      roll: new fields.SchemaField({
        diceNum: new fields.NumberField({ initial: 1, min: 1 }),
        diceSize: new fields.StringField({ initial: 'd4' }),
      }),
    })
    schema.ammo = new fields.SchemaField({
      type: new fields.StringField({ initial: '9mm' }),
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
      short: new fields.NumberField({ initial: 1, min: 1, nullable: false }),
      long: new fields.NumberField({ initial: 1, min: 1, nullable: false }),
      // flat: new fields.NumberField({ initial: null, min: 1})
    })

    return schema
  }

  get capacityAtMax() {
    return this.ammo.capacity.value === this.ammo.capacity.max
  }
}
