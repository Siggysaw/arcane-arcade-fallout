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
    schema.apModifiers = new fields.NumberField({ initial: 0 })
    schema.totalApCost = new fields.NumberField({ initial: 0 })
    schema.decay = new fields.NumberField({ initial: 10, min: 0, max: 10 })
    schema.reloadDecay = new fields.NumberField({ initial: 0, min: 0, max: 10 })
    schema.itemOpen = new fields.BooleanField()
    schema.slots = new fields.NumberField({ initial: 6, min: 0 })
    schema.energyWeapon = new fields.BooleanField()
    schema.properties = new fields.HTMLField()
    schema.bonusProperties = new fields.HTMLField()
    schema.strengthRequirement = new fields.NumberField({ initial: 0 })
    schema.strengthModifier = new fields.NumberField({ initial: 0 })
    schema.autoHit = new fields.BooleanField({ initial: false })
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
    schema.critical = new fields.SchemaField({
      dice: new fields.NumberField({ initial: 20, blank: true }),
      diceModifier: new fields.NumberField({ initial: 0, blank: true }),
      diceFinal: new fields.NumberField({ initial: 0, blank: true }),
      multiplier: new fields.NumberField({ initial: 1, nullable: false }),
      multiplierBonus: new fields.NumberField({ initial: 0, min: 0 }),
      formula: new fields.StringField({ initial: null, nullable: true }),
      formulaBonus: new fields.NumberField({ initial: 0, blank: true }),
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
        maxModifier: new fields.NumberField({
          initial: 0,
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
      shortModifiers: new fields.NumberField({ initial: 0 }),
      long: new fields.NumberField({ initial: 1, min: 0, nullable: false }),
      longModifiers: new fields.NumberField({ initial: 0 }),
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
    const actorData = this.parent?.actor?.system
    const hasUpgrade = (search) => upgradeList.some((i) => i.name === search)

    const generateProperty = (propertyName, UUID, pack) => {
      const ID = UUID.split(".")
      pack == null || pack == undefined ? pack = "properties" : pack
      const fullUuid = `Compendium.arcane-arcade-fallout.${pack}.Item.${UUID}`

      const linkedItem = fromUuidSync?.(fullUuid) ?? null
      const rawDesc = linkedItem?.system?.description ?? ''
      const plainDesc = rawDesc.replace(/<[^>]*>/g, '').trim()
      const tooltip = (plainDesc || 'Click for details.').replace(/"/g, '&quot;')

      const newLink = `<a class="content-link" 
            draggable="true" data-link="" 
            data-uuid="${fullUuid}"
            data-id="${ID[ID.length - 1]}" 
            data-type="Item" 
            data-pack="arcane-arcade-fallout.${pack}"
            data-tooltip="${tooltip}"
            >
            ${propertyName}
            </a>`
      return newLink
    }

    this.critical.formulaBonus = 0
    this.critical.multiplierBonus = 0

    // Ranged Weapon Upgrades

    // AP Cost Modifiers
    const apCost = this.apCost
    let apModifiers = 0

    if (hasUpgrade('Double Action') && apCost - 1 > 0) {
      apModifiers -= 1
    }
    if (hasUpgrade('Heavy') && apCost + apModifiers < 6) {
      apModifiers += 1
    }
    if (hasUpgrade('Light Build (Melee)') && apCost + apModifiers > 3) {
      apModifiers -= 1
    }

    this.apModifiers = apModifiers
    this.totalApCost = apCost - (this.APSubtraction ?? 0) + apModifiers

    this.critical.diceFinal = Number(this.critical.dice ?? 0) + Number(this.critical.diceModifier ?? 0)

    if (hasUpgrade('Ergonomic Grip')) {
      if (this.critical.formula) {
        this.critical.formulaBonus += 1
      }
      if (this.critical.multiplier > 1) {
        this.critical.multiplierBonus += 1
      }
    }
    if (hasUpgrade('Hardened Receiver')) {
      this.description.includes("Destructive") ?
        this.bonusProperties += generateProperty("DMG Dice Up", "WmPmTZjUNE8K4Xs7", "upgrades") :
        this.bonusProperties += generateProperty("Destructive", "VS5Qupltlip5f4fM")

      !this.description.includes("Powerful") ?
        this.bonusProperties += generateProperty("Powerful", "UeqnxXvKP9r7fIW8") : bonusProperties

    }
    if (hasUpgrade('Laser Sight')) {
      this.description.includes("Accurate") ?
        this.bonusProperties += generateProperty("Double Crit DMG", "Ctfj04LE1XMn1fyI", "upgrades") :
        this.bonusProperties += generateProperty("Accurate", "R3px8IQgzrBwuwvp")
    }
    if (hasUpgrade('Light Build (Ranged)') || hasUpgrade('Light Build (Melee)')) {
      if (this.parent?.actor) {
        actorData.modifiers -= Number(Math.floor(this.load / 2))
      }
      this.bonusProperties += generateProperty("Breakable", "aZu6vMCsdRPyLGd6")
      this.strengthModifier += -1
    }
    if (hasUpgrade('Longer Barrel')) {
      this.range.shortModifiers -= 2
      this.range.longModifiers += 10
    }
    if (hasUpgrade('Lucky Charm')) {
      this.critical.diceModifier -= 1
    }
    if (hasUpgrade('Muzzle Brake')) {
      this.bonusProperties += generateProperty("+1 to Hit", "756DSaka24uWUIIy", "upgrades")
      this.strengthModifier += -1
    }
    if (hasUpgrade('Semi-Automatic')) {
      this.bonusProperties += generateProperty("Semi-Automatic", "uQDlAFMmZXtuC8wt")
    }
    if (hasUpgrade('Silencer')) {
      this.bonusProperties += generateProperty("DMG Die Down", "ZhmtAwX2JbA7uymH", "upgrades")
    }
    if (hasUpgrade('Stock')) {
      this.bonusProperties += generateProperty("+1 to Hit", "MXOPfP5qpmWOYKLL", "upgrades")
    }
    if (hasUpgrade('Strengthen (Ranged)')) {
      this.bonusProperties += generateProperty("Sturdy", "nsBOdZwmwSwRxGjo")
    }

    // Melee Weapon Upgrades
    if (hasUpgrade('Double Sided')) {
      this.bonusProperties += generateProperty("Defensive", "AZLp9sBiapzsqIBV",)
      this.bonusProperties += generateProperty("Two Handed", "2VByRivQCzqtj5af")
      this.strengthModifier += 1
      actorData.carryLoad.modifiers += this.load
    }
    if (hasUpgrade('Ergonomic')) {
      this.bonusProperties += generateProperty("Defensive", "AZLp9sBiapzsqIBV",)
      this.critical.diceModifier -= 1
    }
    if (hasUpgrade('Heavy')) {
      this.bonusProperties += generateProperty("Weighted", "pWdqTFu2HQntRMBW",)
      this.critical.formula ? this.critical.formulaBonus += 1 : this.critical.formula
      this.critical.multiplier > 1 ? this.critical.multiplierBonus += 1 : this.critical.multiplierBonus
      this.strengthModifier += 1
      actorData.carryLoad.modifiers += Math.floor(this.load/2)
    }
    if (hasUpgrade('Sharpened')) {
      this.bonusProperties += generateProperty("Mangle", "zr8O7JwRX63efKzC",)
    }
    if (hasUpgrade('Strengthen (Melee)')) {
      this.bonusProperties += generateProperty("Durable", "UnKVhbAQoVPFYOfP",)
    }


    this.critical.diceFinal = Number(this.critical.dice ?? 0) + Number(this.critical.diceModifier ?? 0)
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
