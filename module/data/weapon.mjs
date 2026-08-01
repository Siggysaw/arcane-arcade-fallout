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
    schema.bonusProperties = new fields.HTMLField()
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
    schema.range = new fields.SchemaField({
      short: new fields.NumberField({ initial: 1, min: 0 }),
      long: new fields.NumberField({ initial: 10, blank: true }),
      thrown: new fields.NumberField({ initial: 0 }),
    })
    schema.critical = new fields.SchemaField({
      dice: new fields.NumberField({ initial: 20, blank: true }),
      multiplier: new fields.NumberField({ initial: 1, nullable: false }),
      multiplierBonus: new fields.NumberField({ initial: 0, min: 0 }),
      formula: new fields.StringField({ initial: null, nullable: true }),
      formulaBonus : new fields.NumberField({ initial: 0, blank: true }),
      condition: new fields.StringField({ initial: null, nullable: true }),
    })
    schema.ammo = new fields.SchemaField({
      type: new fields.StringField({ initial: '' }),
      description: new fields.StringField({ initial: '' }),
      assigned: new fields.StringField({}),
      description: new fields.HTMLField(),
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

    const upgradeList = Object.values(this.upgrades)
    const hasUpgrade = (search) => upgradeList.some((i) => i.name === search)

    this.critical.formulaBonus = 0
    this.critical.multiplierBonus = 0

    if (hasUpgrade('Ergonomic Grip')) {
      if (this.critical.formula) {
        this.critical.formulaBonus += 1
      }
      if (this.critical.multiplier > 1) {
        this.critical.multiplierBonus += 1
      }
    }
    //hasUpgrade('Hardened Receiver') ? this.ystem.load += 2 : ''
  }

  get totalCriticalFormula() {
    const base = this.critical.formula
    if (!base) return base
    const [diceCount, diceSize] = base.split('d')
    return `${Number(diceCount) + this.critical.formulaBonus}d${diceSize}`
  }

  get totalCriticalMultiplier() {
    return this.critical.multiplier + this.critical.multiplierBonus
  }
  get capacityAtMax() {
    return this.ammo.capacity.value === this.ammo.capacity.max
  }
}
