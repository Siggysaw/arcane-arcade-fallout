import FalloutZeroActor from './actorBase.mjs'
import { FALLOUTZERO } from '../config.mjs'

export default class FalloutZeroCharacter extends FalloutZeroActor {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = super.defineSchema()

    schema.level = new fields.NumberField({
      ...requiredInteger,
      initial: 1,
      min: 1,
      max: 999,
    })

    schema.penalties = new fields.SchemaField(
      Object.keys(FALLOUTZERO.penalties).reduce((obj, penalty) => {
        obj[penalty] = new fields.SchemaField({
          label: new fields.StringField({ required: true }),
          value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
          base: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
          modifiers: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
          ignored: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
        })
        return obj
      }, {
        snack: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
        }),
      }),
    )


    schema.limbdamage = new fields.SchemaField(
      Object.keys(FALLOUTZERO.limbdamage).reduce((obj, damage) => {
        obj[damage] = new fields.SchemaField({
          label: new fields.StringField({ required: true }),
          description: new fields.StringField({}),
        })
        return obj
      }, {}),
    )

    schema.carryLoad = new fields.SchemaField({
      base: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      modifiers: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),
      baseMax: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      modifiersMax: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      max: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      manualMax: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.unflipped = new fields.NumberField({ initial: 0 })
    schema.totalKarma = new fields.NumberField({ initial: 0 })
    schema.luckmod = new fields.NumberField({ initial: 0 })
    schema.attackBonus = new fields.NumberField({ initial: 0 })
    schema.damageBonus = new fields.NumberField({ initial: 0 })
    schema.downed = new fields.BooleanField({ initial: false })
    schema.xp = new fields.NumberField({ initial: 0 })
    schema.healingRate = new fields.SchemaField({
      base: new fields.NumberField({ initial: 0 }),
      value: new fields.NumberField({ initial: 0 }),
      modifiers: new fields.NumberField({ initial: 0 })
    })
    schema.saveSuccesses = new fields.SchemaField({
      first: new fields.BooleanField({ initial: false }),
      second: new fields.BooleanField({ initial: false }),
      third: new fields.BooleanField({ initial: false })
    })
    schema.saveFailures = new fields.SchemaField({
      first: new fields.BooleanField({ initial: false }),
      second: new fields.BooleanField({ initial: false }),
      third: new fields.BooleanField({ initial: false })
    })
    schema.downedAP = new fields.SchemaField({
      base: new fields.NumberField({ initial: 4 }),
      value: new fields.NumberField({ initial: 0 }),
      modifiers: new fields.NumberField({ initial: 0 })
    })
    schema.combatSequence = new fields.SchemaField({
      base: new fields.NumberField({ initial: 0 }),
      value: new fields.NumberField({ initial: 0 }),
      modifiers: new fields.NumberField({ initial: 0 }),
      advantage: new fields.NumberField({ initial: 0 }),
      formula: new fields.StringField({ initial: "1d20" })
    })
    schema.partyNerve = new fields.SchemaField({
      base: new fields.NumberField({ initial: 0 }),
      value: new fields.NumberField({ initial: 0 }),
      modifiers: new fields.NumberField({ initial: 0 }),
      advantage: new fields.NumberField({ initial: 0 })
    })
    schema.groupSneak = new fields.SchemaField({
      base: new fields.NumberField({ initial: 0 }),
      value: new fields.NumberField({ initial: 0 }),
      modifiers: new fields.NumberField({ initial: 0 }),
      advantage: new fields.NumberField({ initial: 0 })
    })
    schema.irradiated = new fields.NumberField({ initial: 0, min: 0 })
    schema.combatActionsexpanded = new fields.BooleanField({ initial: false })
    schema.passiveSense = new fields.SchemaField({
      base: new fields.NumberField({ initial: 0 }),
      value: new fields.NumberField({ initial: 0 }),
      modifiers: new fields.NumberField({ initial: 0 })
    })
    schema.penaltyTotal = new fields.NumberField({ initial: 0, min: 0 })
    schema.boostDice = new fields.NumberField({ initial: 0, min: 0 })
    schema.properties = new fields.HTMLField()
    schema.activePartymember = new fields.BooleanField({ initial: true })
    schema.editToggle = new fields.BooleanField({ initial: true })
    schema.vaulttec = new fields.BooleanField({ initial: false })
    return schema
  }

  prepareBaseData() {
    super.prepareBaseData()
    for (const key in this.limbdamage) {
      this.limbdamage[key].description = FALLOUTZERO.limbdamage[key].description
      this.limbdamage[key].label = FALLOUTZERO.limbdamage[key].label
    }
  }

  /**
   * @override
   * Augment the actor source data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    super.prepareDerivedData()
    function searchItems(actor, search) {
      return actor.parent.items.find((i) => i.name == search)
    }

    const gifted = searchItems(this, "Gifted")
    let skillsLost = 0
    gifted ? skillsLost = 3 : ''
    gifted && gifted.system.wildWasteland ? skillsLost = 6 : ''

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.abilities) {
      // Calculate the modifier using d20 rules.
      if (this.abilities[key].base == 0) { this.abilities[key].base = this.abilities[key].value }
      this.abilities[key].value = this.abilities[key].base + this.abilities[key].modifiers
      this.abilities[key].mod = Math.floor(this.abilities[key].value - 5)
    }
    // Loop through skill scores, and add their modifiers to our sheet output.
    for (const key in this.skills) {

      this.skills[key].ability = FALLOUTZERO.skills[key].ability
      this.skills[key].value = this.skills[key].base + this.skills[key].modifiers - skillsLost
    }


    //========= PERK/TRAIT AUTOMATION
    const alertness = searchItems(this, "Alertness")
    const aliveandkickin = searchItems(this, "Alive and Kickin'")
    const packrat = searchItems(this, "Pack Rat")
    const dumbLuck = searchItems(this, "Dumb Luck")
    const evolution = searchItems(this, "Evolution")
    const actionHero = searchItems(this, "Action Hero")
    const brawny = searchItems(this, "Brawny")
    const smallFrame = searchItems(this, "Small Frame")
    const implantY7 = searchItems(this, "Implant Y-7")
    const cheaperParts = searchItems(this, "Cheaper Parts")
    const activatedActinides = searchItems(this, "Activated Actinides")
    const builttoDestroy = searchItems(this, "Built to Destroy")
    const denseCircuitry = searchItems(this, "Dense Circuitry")
    const fastMetabolism = searchItems(this, "Fast Metabolism")
    const hotBlooded = searchItems(this, "Hot Blooded")
    const longDays = searchItems(this, 'Long Days, Long Nights')
    const onerousRegeneration = searchItems(this, 'Onerous Regeneration')
    const triggerDiscipline = searchItems(this, 'Trigger Discipline')
    const vigilantWatch = searchItems(this, 'Vigilant Watch')
    const finesse = searchItems(this, 'Finesse')

    aliveandkickin ? this.penalties.exhaustion.ignored += 3 : this.penalties.exhaustion.ignored
    packrat ? this.carryLoad.modifiersMax += packrat.system.quantity * 10 : ''
    dumbLuck ? this.luckmod = this.abilities['lck'].mod : this.luckmod = Math.floor(this.abilities['lck'].mod / 2)
    dumbLuck && dumbLuck.system.quantity > 1 ? this.luckmod = this.abilities['lck'].mod + 2 : ''
    actionHero ? this.actionPoints.boostMax += 2 : ''
    actionHero && this.actionPoints.max > 15 ? this.actionPoints.max = 15 : ''
    activatedActinides && activatedActinides.system.wildWasteland ? this.healingRate.modifiers += 2 : ''
    builttoDestroy && builttoDestroy.system.wildWasteland ? this.damageBonus += 1 : ''
    hotBlooded ? this.attackBonus += -2 : ''
    hotBlooded && hotBlooded.system.wildWasteland && this.stamina.value == 0 ? this.damageBonus += 5 : ''
    longDays ? this.stamina.boostMax += Math.floor(this.level / 2) : ''
    longDays && longDays.system.wildWasteland ? this.stamina.boostMax += Math.floor(this.level / 2) : ''
    triggerDiscipline ? this.combatSequence.modifiers -= 2 : ''
    triggerDiscipline && triggerDiscipline.system.wildWasteland ? this.combatSequence.modifiers -= 3 : ''
    vigilantWatch ? this.combatSequence.modifiers -= 1 : ''

    if (vigilantWatch && vigilantWatch.system.wildWasteland) {
      this.combatSequence.modifiers -= 1
      this.combatSequence.formula = "2d20kl"
    }

    if (cheaperParts) {
      this.healingRate.modifiers += 2
      this.armorClass.modifiers += -1
      if (cheaperParts.system.wildWasteland) {
        this.healingRate.modifiers += this.level
        this.damageThreshold.modifiers += -2
      }
    }
    if (gifted) {
      this.carryLoad.modifiersMax += 10
      this.combatSequence.modifiers += 1
      this.partyNerve.modifiers += 1

      if (gifted.system.wildWasteland) {
        this.carryLoad.modifiersMax += 10
        this.combatSequence.modifiers += 1
        this.partyNerve.modifiers += 1
      }
    }
    if (onerousRegeneration) {
      this.healingRate.modifiers += 2
      onerousRegeneration.system.wildWasteland ? this.healingRate.modifiers += Number(this.level) : ''
    }
    if (denseCircuitry) {
      this.healingRate.modifiers += 2
      this.combatSequence.modifiers += -2
      if (denseCircuitry.system.wildWasteland) {
        this.healingRate.modifiers += this.level
        this.combatSequence.modifiers += -2
      }
    }

    if (fastMetabolism) {
      this.healingRate.modifiers += 2
      this.radiationDC.modifiers += 3
      if (fastMetabolism.system.wildWasteland) {
        this.healingRate.modifiers += this.level
        this.radiationDC.modifiers += 3
      }
    }
    if (implantY7) {
      this.health.boostMax += 2 * this.level
      this.healingRate.modifiers += 2
    }
    if (evolution) {
      this.health.boostMax += this.level
      this.stamina.boostMax += this.level
      this.armorClass.modifiers += 1
      this.damageThreshold.modifiers += 1
    }
    if (brawny) {
      this.health.boostMax += this.level
      this.stamina.boostMax -= this.level
      if (brawny.system.wildWasteland) {
        this.health.boostMax += this.level
        this.stamina.boostMax -= this.level
      }
    }
    if (smallFrame) {
      this.stamina.boostMax += this.level
      this.health.boostMax -= this.level
      if (smallFrame.system.wildWasteland) {
        this.stamina.boostMax += this.level
        this.health.boostMax -= this.level
      }
    }

    //========= Condition Automation
    const stimulant = searchItems(this, "Stimulant")
    const superstimulant = searchItems(this, "Superstimulant")
    const hyperstimulant = searchItems(this, "Hyperstimulant")
    const blocking = searchItems(this, "Blocking")
    const slowed = searchItems(this, "Slowed")
    let dtBoost = 0
    blocking && blocking.system.quantity > 1 ? dtBoost = 2 : ''
   


    //========= ARMOR AUTOMATION
    function searchArmor(actor) {
      const armorFound = actor.parent.items.find((i) => i.system.itemEquipped == true && i.type == "armor")
      if (armorFound !== undefined) {
        return armorFound
      }
    }

    const equippedArmor = searchArmor(this)

    equippedArmor ? this.armorClass.armor = equippedArmor.system.armorClass.value : this.armorClass.armor = 10
    equippedArmor ? this.damageThreshold.armor = equippedArmor.system.damageThreshold.value : this.damageThreshold.armor = 0


    // Base Character Stat Creation
    this.critMod = Math.floor(this.abilities['lck'].mod / 2)
    this.critMod < 0 ? this.critMod = 0 : ''
    blocking ? this.damageThreshold.modifiers += (2 + this.abilities.end.mod) + dtBoost : ''
    this.penalties.hunger.value = Math.max(this.penalties.hunger.base + this.penalties.hunger.modifiers, 0)
    this.passiveSense.value = 12 + this.passiveSense.base + this.abilities.per.mod + this.passiveSense.modifiers
    this.penalties.exhaustion.value = Math.max(this.penalties.exhaustion.base - this.penalties.exhaustion.ignored + this.penalties.exhaustion.modifiers, 0)
    this.penalties.dehydration.value = Math.max(this.penalties.dehydration.base + this.penalties.dehydration.modifiers, 0)
    this.penalties.radiation.value = Math.max(this.penalties.radiation.base + this.penalties.radiation.modifiers, 0)
    this.penalties.fatigue.value = Math.max(this.penalties.fatigue.base + this.penalties.fatigue.modifiers, 0)
    this.radiationDC.value = (12 - this.abilities['end'].mod) + this.radiationDC.base + this.radiationDC.modifiers
    this.penaltyTotal =
      this.penalties.hunger.value +
      this.penalties.dehydration.value +
      this.penalties.exhaustion.value +
      this.penalties.radiation.value +
      this.penalties.fatigue.value
    this.carryLoad.baseMax = this.abilities['str'].value * 10
    this.combatSequence.value = this.combatSequence.base + this.abilities.per.mod + this.combatSequence.modifiers
    this.healingRate.value = this.healingRate.base + Math.floor((this.level + this.abilities['end'].value) / 2) + this.healingRate.modifiers
    this.health.max = (1 + Math.ceil(this.level / 2)) * 5 + (Math.ceil(this.level / 2) * this.abilities['end'].mod) + this.health.boostMax
    this.stamina.max = (1 + Math.ceil(this.level / 2)) * 5 + (Math.ceil(this.level / 2) * this.abilities['agi'].mod) + this.stamina.boostMax
    this.actionPoints.max = this.abilities['agi'].mod + 10 + this.actionPoints.boostMax
    this.actionPoints.max > 15 ? this.actionPoints.max = 15 : ''
    slowed && this.actionPoints.max > 6 ? this.actionPoints.max = 6 : ''
    this.health.effectiveMax = this.health.max + (this.health.temp ?? 0)
    this.health.damage = this.health.max - this.health.value
    this.stamina.effectiveMax = this.stamina.max + (this.stamina.temp ?? 0)
    this.stamina.damage = this.stamina.max - this.stamina.value
    this.explosivesMastery = this.abilities['per'].mod + this.skills['explosives'].value
    this.unflipped = this.karmaCaps.filter(Boolean).length;
    this.totalKarma = this.karmaCaps.length;
    (superstimulant || hyperstimulant) && this.penalties.exhaustion.base == 0 ? this.boostDice += 2 : ''
    stimulant && this.penalties.exhaustion.base == 0 ? this.boostDice += 1 : ''
    alertness ? this.passiveSense.value += this.abilities.per.value + this.passiveSense.modifiers : ''
    this.armorClass.value = this.armorClass.base + this.armorClass.armor + this.armorClass.modifiers
    this.damageThreshold.value += this.damageThreshold.base + this.damageThreshold.armor + this.damageThreshold.modifiers
    this.damageThreshold.value < 1 ? this.damageThreshold.value = 0 : ''
  }
}



