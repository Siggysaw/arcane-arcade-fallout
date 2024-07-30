import FalloutZeroItemBase from './itemBase.mjs'

export default class FalloutZeroItemWeapon extends FalloutZeroItemBase {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = super.defineSchema()

    schema.load = new fields.NumberField({ required: true, nullable: false, initial: 0.1, min: 0 })
    schema.cost = new fields.NumberField({ required: true, nullable: false, initial: 1, min: 0 })
    schema.baseCost = new fields.NumberField({
      required: true,
      nullable: false,
      initial: 0,
      min: 0,
    })
    schema.apCost = new fields.NumberField({ required: true, nullable: false, initial: 1, min: 0 })
    schema.decay = new fields.NumberField({ initial: 10, min: 0, max: 10 })
    schema.reloadDecay = new fields.NumberField({ initial: 0, min: 0, max: 10 })
    schema.itemOpen = new fields.BooleanField()
    schema.slots = new fields.NumberField({ initial: 6, min: 0 })
    schema.energyWeapon = new fields.BooleanField()
    schema.properties = new fields.HTMLField()
    schema.strengthRequirement = new fields.NumberField({ initial: 0 })
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
      short: new fields.NumberField({ initial: 1 }),
      long: new fields.NumberField({ initial: 10, blank: true }),
    })
    schema.critical = new fields.SchemaField({
      dice: new fields.NumberField({ initial: 20, blank: true }),
      multiplier: new fields.NumberField({ initial: 1, nullable: false }),
      formula: new fields.StringField({ initial: null, nullable: true }),
      condition: new fields.StringField({ initial: null, nullable: true }),
    })
    schema.ammo = new fields.SchemaField({
      type: new fields.StringField({ initial: '9mm' }),
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
      short: new fields.NumberField({ initial: 1, min: 1, nullable: false }),
      long: new fields.NumberField({ initial: 1, min: 1, nullable: false }),
      // flat: new fields.NumberField({ initial: null, min: 1})
    })

    schema.upgrades = new fields.SchemaField({
      upgrade1: new fields.SchemaField({
        name: new fields.StringField({ initial: `` }),
        id: new fields.StringField({ initial: `` }),
        description: new fields.StringField({ initial: `` }),
        rank: new fields.NumberField({ initial: 1 }),
        img: new fields.StringField({ initial: `` }),
      }),
      upgrade2: new fields.SchemaField({
        name: new fields.StringField({ initial: `` }),
        id: new fields.StringField({ initial: `` }),
        description: new fields.StringField({ initial: `` }),
        rank: new fields.NumberField({ initial: 1 }),
        img: new fields.StringField({ initial: `` }),
      }),
      upgrade3: new fields.SchemaField({
        name: new fields.StringField({ initial: `` }),
        id: new fields.StringField({ initial: `` }),
        description: new fields.StringField({ initial: `` }),
        rank: new fields.NumberField({ initial: 1 }),
        img: new fields.StringField({ initial: `` }),
      }),
      upgrade4: new fields.SchemaField({
        name: new fields.StringField({ initial: `` }),
        id: new fields.StringField({ initial: `` }),
        description: new fields.StringField({ initial: `` }),
        rank: new fields.NumberField({ initial: 1 }),
        img: new fields.StringField({ initial: `` }),
      }),
      upgrade5: new fields.SchemaField({
        name: new fields.StringField({ initial: `` }),
        id: new fields.StringField({ initial: `` }),
        description: new fields.StringField({ initial: `` }),
        rank: new fields.NumberField({ initial: 1 }),
        img: new fields.StringField({ initial: `` }),
      }),
      upgrade6: new fields.SchemaField({
        name: new fields.StringField({ initial: `` }),
        id: new fields.StringField({ initial: `` }),
        description: new fields.StringField({ initial: `` }),
        rank: new fields.NumberField({ initial: 1 }),
        img: new fields.StringField({ initial: `` }),
      }),
      upgrade7: new fields.SchemaField({
        name: new fields.StringField({ initial: `` }),
        id: new fields.StringField({ initial: `` }),
        description: new fields.StringField({ initial: `` }),
        rank: new fields.NumberField({ initial: 1 }),
        img: new fields.StringField({ initial: `` }),
      }),
      upgrade8: new fields.SchemaField({
        name: new fields.StringField({ initial: `` }),
        id: new fields.StringField({ initial: `` }),
        description: new fields.StringField({ initial: `` }),
        rank: new fields.NumberField({ initial: 1 }),
        img: new fields.StringField({ initial: `` }),
      }),
      upgrade9: new fields.SchemaField({
        name: new fields.StringField({ initial: `` }),
        id: new fields.StringField({ initial: `` }),
        description: new fields.StringField({ initial: `` }),
        rank: new fields.NumberField({ initial: 1 }),
        img: new fields.StringField({ initial: `` }),
      }),
      upgrade10: new fields.SchemaField({
        name: new fields.StringField({ initial: `` }),
        id: new fields.StringField({ initial: `` }),
        description: new fields.StringField({ initial: `` }),
        rank: new fields.NumberField({ initial: 1 }),
        img: new fields.StringField({ initial: `` }),
      }),
      upgrade11: new fields.SchemaField({
        name: new fields.StringField({ initial: `` }),
        id: new fields.StringField({ initial: `` }),
        description: new fields.StringField({ initial: `` }),
        rank: new fields.NumberField({ initial: 1 }),
        img: new fields.StringField({ initial: `` }),
      }),
      upgrade12: new fields.SchemaField({
        name: new fields.StringField({ initial: `` }),
        id: new fields.StringField({ initial: `` }),
        description: new fields.StringField({ initial: `` }),
        rank: new fields.NumberField({ initial: 1 }),
        img: new fields.StringField({ initial: `` }),
      }),
    })

    return schema
  }

  prepareDerivedData() {
    super.prepareDerivedData()
  }

  get combinedDamageFormula() {
    return this.damages.reduce((total, damage, index) => {
      if (index === 0) {
        total += damage.formula
      } else {
        total += `+ ${damage.formula}`
      }
      return total
    }, '')
  }

  get capacityAtMax() {
    return this.ammo.capacity.value === this.ammo.capacity.max
  }
}
