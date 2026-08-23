import { FALLOUTZERO } from '../config.mjs'

export default class FalloutZeroActor extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = {}
    schema.biography = new fields.HTMLField()
    schema.skillPool = new fields.NumberField({ initial: 0 })
    schema.showEquipped = new fields.BooleanField({ initial: false })
    schema.perkPoints = new fields.NumberField({ initial: 0 })
    schema.startingSkillpoints = new fields.NumberField({ initial: 6 })
    schema.totalSkillpoints = new fields.NumberField({ initial: 0 })
    schema.explosiveMastery = new fields.NumberField({ initial: 0 })
    schema.boostDice = new fields.NumberField({ initial: 0, min: 0 })
    schema.health = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
        min: 0
      }),
      modifiers: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      min: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      max: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
      }),
      maxModifiers: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      temp: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      tooltip: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      boostMax: new fields.NumberField({
        initial: 0,
      }),
      manualMax: new fields.NumberField({
        initial: 0,
      }),
    })
    schema.stamina = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        min: 0,
        initial: 10,
      }),
      modifiers: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      min: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      max: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
      }),
      temp: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      tooltip: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      boostMax: new fields.NumberField({
        initial: 0,
      }),
      manualMax: new fields.NumberField({
        initial: 0,
      }),
    })
    schema.actionPoints = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
        min:0
      }),
      min: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      max: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
      }),
      temp: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      boostMax: new fields.NumberField({
        initial: 0,
      }),
      recover: new fields.StringField({
        initial: 'half',
      }),
      dazed: new fields.NumberField({
        initial: 0,
      }),
      tooltip: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      manualMax: new fields.NumberField({
        initial: 0,
      }),
    })
    schema.karmaCaps = new fields.ArrayField(new fields.BooleanField(), { initial: [true] })

    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField(
      Object.keys(FALLOUTZERO.abilities).reduce((obj, ability) => {
        obj[ability] = new fields.SchemaField({
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 5,
          }),
          mod: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          base: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          modifiers: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          label: new fields.StringField({
            initial: FALLOUTZERO.abilities[ability].label,
          }),
          penalties: new fields.BooleanField({
            initial: FALLOUTZERO.abilities[ability].penalties,
          }),
          abbr: new fields.StringField({
            initial: FALLOUTZERO.abilities[ability].id,
          }),
          advantage: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
        })
        return obj
      }, {}),
    )

    schema.skills = new fields.SchemaField(
      Object.keys(FALLOUTZERO.skills).reduce((obj, skill) => {
        obj[skill] = new fields.SchemaField({
          ability: new fields.ArrayField(new fields.StringField({ required: true })),
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          base: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          modifiers: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          label: new fields.StringField({
            initial: FALLOUTZERO.skills[skill].label,
          }),
          id: new fields.StringField({
            initial: FALLOUTZERO.skills[skill].id,
          }),
          advantage: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          defaultAbility: new fields.StringField({
            initial: "",
          }),
        })
        return obj
      }, {}),
    )
    schema.irradiated = new fields.NumberField({ initial: 0, min: 0 })
    schema.armorClass = new fields.SchemaField({
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
        initial: 0
      }),
      armor: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
      }),
    })
    schema.bonuses = new fields.SchemaField({
      allDamage: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })

    schema.damageThreshold = new fields.SchemaField({
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
        min: 0
      }),
      armor: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })

    schema.radiationDC = new fields.SchemaField({
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
      }),
    })

    schema.caps = new fields.NumberField({
      initial: 0,
      min: 0,
    })

    schema.dv = new fields.ArrayField(new fields.StringField(), { initial: [] })
    schema.dr = new fields.ArrayField(new fields.StringField(), { initial: [] })

    return schema
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

    if (this.type == "npc") {
      this.health.effectiveMax = this.health.max + (this.health.temp ?? 0)
      this.health.damage = this.health.max - this.health.value
      this.stamina.effectiveMax = this.stamina.max + (this.stamina.temp ?? 0)
      this.stamina.damage = this.stamina.max - this.stamina.value
    }
    this.caps = Math.floor(this.caps)
    this.xp = Math.floor(this.xp)
    this.partyNerve.value = this.partyNerve.base + this.partyNerve.modifiers

    this.applyArmorUpgrades()
    this.applyPowerArmorUpgrades()
  }

  applyArmorUpgrades() {
    const equippedArmor = this.parent?.items?.find(
      (i) => i.type === 'armor' && i.system.itemEquipped === true,
    )
    const slots = equippedArmor?.system?.upgrade?.slots ?? []

    const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    const tierOfUpgrade = (baseName) => {
      const pattern = new RegExp(`^${escapeRegExp(baseName)}\\s+(?:Rank\\s+)?(\\d+)$`, 'i')
      return slots.reduce((highest, slot) => {
        const normalized = (slot?.name ?? '').replace(/\s+/g, ' ').trim()
        const match = pattern.exec(normalized)
        return match ? Math.max(highest, Number(match[1])) : highest
      }, 0)
    }

    const fittedTier = tierOfUpgrade('Fitted')
    this.fittedTier = fittedTier
    if (fittedTier >= 2) {
      this.stamina.boostMax += this.level ?? 0
    }
    const hardenedTier = tierOfUpgrade('Hardened')
    if (hardenedTier >= 1) {
      this.armorClass.modifiers += [0, 1, 2, 3][hardenedTier]
    }

    const reinforcedTier = tierOfUpgrade('Reinforced')
    if (reinforcedTier >= 1) {
      this.damageThreshold.modifiers += [0, 1, 2, 4][reinforcedTier]
    }

    const leadLinedTier = tierOfUpgrade('Lead Lined')
    if (leadLinedTier >= 1) {
      this.radiationDC.modifiers -= [0, 2, 4, 6][leadLinedTier]
    }

    const pocketedTier = tierOfUpgrade('Pocketed')
    if (pocketedTier >= 1 && this.carryLoad) {
      this.carryLoad.modifiersMax += [0, 10, 25, 50][pocketedTier]
    }

    const camouflageTier = tierOfUpgrade('Camouflage')
    if (camouflageTier >= 1 && this.skills?.sneak) {
      this.skills.sneak.advantage += 1
    }

    const lightTier = tierOfUpgrade('Light')
    if (lightTier >= 1) {
      this.damageThreshold.modifiers -= 1
      if (equippedArmor) {
        const sourceLoad = equippedArmor._source.system.load
        const totalLoadReduction = lightTier >= 2 ? 15 : 5
        const actualLoadReduction = Math.min(totalLoadReduction, Math.max(0, sourceLoad - 3))
        equippedArmor.system.load = sourceLoad - actualLoadReduction

        const sourceStrReq = equippedArmor._source.system.strReq.value
        equippedArmor.system.strReq.value = Math.max(0, sourceStrReq - 1)
      }
    }

    this.insulatedTier = tierOfUpgrade('Insulated')
    this.sturdyIgnoredDecayLevels = [0, 2, 4, 4][tierOfUpgrade('Sturdy')]
    this.strengthenedTier = tierOfUpgrade('Strengthened')
  }

  applyPowerArmorUpgrades() {
    const equippedPowerArmor = this.parent?.items?.find(
      (i) => i.type === 'powerArmor' && i.system.itemEquipped === true,
    )
    const paSlots = equippedPowerArmor?.system?.upgrade?.slots ?? []

    const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const tierOfPowerArmorUpgrade = (baseName) => {
      const pattern = new RegExp(`^${escapeRegExp(baseName)}\\s+(?:Rank\\s+)?(\\d+)$`, 'i')
      return paSlots.reduce((highest, slot) => {
        const normalized = (slot?.name ?? '').replace(/\s+/g, ' ').trim()
        const match = pattern.exec(normalized)
        return match ? Math.max(highest, Number(match[1])) : highest
      }, 0)
    }

    const sensorArrayTier = tierOfPowerArmorUpgrade('Sensor Array')
    if (sensorArrayTier >= 1 && this.passiveSense) {
      this.passiveSense.modifiers += [0, 5, 10, 20][sensorArrayTier]
    }

    const calibratedShocksTier = tierOfPowerArmorUpgrade('Calibrated Shocks')
    if (calibratedShocksTier >= 1 && this.carryLoad) {
      this.carryLoad.modifiersMax += [0, 15, 30, 50][calibratedShocksTier]
    }

    this.prismShieldingTier = tierOfPowerArmorUpgrade('Prism Shielding')
    this.explosiveShieldingTier = tierOfPowerArmorUpgrade('Explosive Shielding')
    this.vatsMatrixOverlayTier = tierOfPowerArmorUpgrade('Vats Matrix Overlay')
    this.emergencyProtocolsTier = tierOfPowerArmorUpgrade('Emergency Protocols')
  }

  finalizeArmorUpgrades() {
    if ((this.insulatedTier ?? 0) === 1 && this.actionPoints) {
      this.actionPoints.max = Math.max(6, this.actionPoints.max - 1)
    }
  }

  finalizeCombatSequence() {
    if (!this.combatSequence) return

    if ((this.fittedTier ?? 0) >= 3) {
      if (this.combatSequence.advantage > 0) {
        this.combatSequence.modifiers += 5
      } else {
        this.combatSequence.advantage += 1
      }
    }

    this.combatSequence.advantage > 0 ? this.combatSequence.formula = "2d20kh" :
      this.combatSequence.advantage < 0 ? this.combatSequence.formula = "2d20kl" : ''
  }
}
