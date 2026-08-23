export default class AttackRoll extends FormApplication {
  constructor(actor, weapon, options = {}, callback = () => { }) {
    super(actor, options)

    this.weapon = weapon
    this.actor = actor
    const hasKarmaCapAvailable = this.actor.hasKarmaCapAvailable()
    const properMaintenance = this.actor.items.find((i) => i.name == 'Proper Maintenance')
    const properMaintenanceWW = properMaintenance?.system?.wildWasteland
    const hasFanTheHammer = this.actor.items.find((i) => i.name == 'Fan the Hammer')
      && typeof weapon.system.description === 'string'
      && weapon.system.description.includes("Revolver")
    let decayValue = this.weapon.getDecayValue()
    let gunCondition = this.weapon.system.decay

    gunCondition == 0 ||
      properMaintenance && gunCondition <= 2 ||
      properMaintenance && properMaintenanceWW && gunCondition <= 5
      ? ui.notifications.warn(`${this.weapon.name} has decayed too much and is broken`) : ''

    // Sturdy and Proper Maintenance ignores the first levels of decay penalty
    if (properMaintenance && !properMaintenanceWW) {
      decayValue = Math.max(0, decayValue - 1)
    }
    if (this.hasSturdy() || properMaintenanceWW) {
      decayValue = Math.max(0, decayValue - 2)
    }

    const weaponUpgrades = Array.isArray(weapon.system.upgrades)
      ? weapon.system.upgrades
      : Object.values(weapon.system.upgrades ?? {})
    const hasOverclockedCapacitor = weaponUpgrades.some((u) => u.name === 'Overclocked Capacitor')
    const hasBoostedCapacitor = weaponUpgrades.some((u) => u.name === 'Boosted Capacitor')

    const hasAutomatic = typeof weapon.system.description === 'string' && weapon.system.description.includes('Automatic')

    this.formDataCache = {
      weaponType: weapon.type,
      automaticAttack: false,
      consumesAp: true,
      skillBonus: this.actor.getSkillBonus(this.weapon.system.skillBonus),
      attackBonus: this.actor.getAttackBonus(weapon),
      damageBonus: this.actor.getDamageBonus(weapon),
      abilityBonus: this.weapon.getAbilityBonus(),
      decayPenalty: weapon.type == "explosive" ? 0 : decayValue,
      actorLuck: this.actor.getAbilityMod(CONFIG.FALLOUTZERO.abilities.lck.id),
      actorPenalties: this.actor.system.penaltyTotal,
      totalBonus: this.actor.getSkillBonus(this.weapon.system.skillBonus) + this.actor.getAttackBonus() + this.weapon.getAbilityBonus() - decayValue - this.actor.system.penaltyTotal + this.actor.getAbilityMod(CONFIG.FALLOUTZERO.abilities.lck.id),
      bonus: 0,
      targeted: null,
      advantageMode: options.advantageMode ?? AttackRoll.ADV_MODE.NORMAL,
      apCost: this.weapon.system.apCost,
      totalApCost: this.weapon.system.totalApCost,
      adjustedApCost: 0,
      ammoCost: 1,
      totalAmmoCost: 1,
      adjustedAmmoCost: 0,

      critical: {
        dice: this.weapon.system.critical.dice,
        condition: this.weapon.system.critical.condition,
        formula: this.weapon.system.totalCriticalFormula,
        multiplier: this.weapon.system.totalCriticalMultiplier,
      },
      repeat: 1,
      fullAuto: false,
      hasOverclockedCapacitor,
      hasBoostedCapacitor,
      hasFanTheHammer,
      hasKarmaCapAvailable,
      hasAutomatic,
      overClocked: false,
      fanTheHammer: false,
      boosted: false,
      damages: this.weapon.system.damages.map((damage) => {
        return {
          ...damage,
          selectedDamageType: damage.type,
        }
      }),
    }

    this.onSubmitCallback = callback
  }

  static get defaultOptions() {
    const options = super.defaultOptions

    options.classes = ['falloutzero', 'dialog', 'attack-roll']
    options.title = 'V.A.T.S'
    options.template = 'systems/arcane-arcade-fallout/templates/actor/dialog/attack.hbs'
    options.width = 'auto'
    options.height = 'auto'
    options.submitOnChange = true
    options.closeOnSubmit = false
    options.resizable = true

    return options
  }

  /* -------------------------------------------- */

  /**
   * Advantage mode of a d20 roll
   * @enum {number}
   */
  static ADV_MODE = {
    NORMAL: 1,
    ADVANTAGE: 2,
    DISADVANTAGE: 3,
    HAILMARY: 4,
  }

  static TARGET_COST = {
    eyes: 5,
    head: 3,
    arm: 3,
    torso: 2,
    groin: 3,
    leg: 2,
    carried: 4,
  }

  async getData() {
    const data = {
      ...(await super.getData()),
      ...this.formDataCache,
    }
    data.damages = this.formDataCache.damages.map((damage) => ({
      ...damage,
      formula: this.getModifiedFormula(damage.formula),
    }))
    return data
  }

  getDice() {
    const advantageMode = Number(this.formDataCache.advantageMode)
    const diceCount = [AttackRoll.ADV_MODE.ADVANTAGE, AttackRoll.ADV_MODE.DISADVANTAGE].includes(
      advantageMode,
    )
      ? 2
      : 1
    const diceSuffix =
      AttackRoll.ADV_MODE.ADVANTAGE === advantageMode
        ? 'kh'
        : AttackRoll.ADV_MODE.DISADVANTAGE === advantageMode
          ? 'kl'
          : ''
    return `${diceCount}d20${diceSuffix}`
  }

  renderTargetedDialog() {
    const dlg = new Dialog(
      {
        title: `Choose target`,
        content: {},
        buttons: {
          close: {
            label: 'Close',
          },
        },
        render: (html) => {
          const buttons = html[0].querySelectorAll('button')
          buttons.forEach((button) => {
            button.addEventListener('click', (e) => {
              var audio = new Audio('systems/arcane-arcade-fallout/assets/sounds/vats/ui_vats_selecttargetpart.wav');
              audio.play();
              const targetedAp = this.getTargetedApCost(e.target.name)
              this.formDataCache.targeted = {
                target: e.target.name,
                cost: targetedAp,
              }
              this.formDataCache.totalApCost = this.weapon.system.totalApCost + targetedAp
              this.render()
              dlg.close()
            })
          })
        },
      },
      {
        template: 'systems/arcane-arcade-fallout/templates/actor/dialog/targeted-attack.hbs',
        width: 500,
        height: 500,
        resizable: true,
      },
    ).render(true)
  }

  activateListeners($html) {
    const form = $html[0]
    form.addEventListener('change', (e) => {
      Object.assign(this.formDataCache, this._getSubmitData())
      this.render()
    })

    form.querySelectorAll('[data-toggle-override]').forEach((toggleButton) => {
      toggleButton.addEventListener('click', (e) => {
        const { toggleOverride } = e.currentTarget.dataset
        if (toggleOverride === 'ap') {
          this.formDataCache.overrideAp = !this.formDataCache.overrideAp
        } else if (toggleOverride === 'ammo') {
          this.formDataCache.overrideAmmo = !this.formDataCache.overrideAmmo
        }
        this.render()
      })
    })

    form.addEventListener('change', (e) => {
      Object.assign(this.formDataCache, this._getSubmitData())
      this.render()
    })

    form.querySelectorAll('[data-override-ap]').forEach((overrideButton) => {
      overrideButton.addEventListener('click', (e) => {
        const { overrideAp } = e.currentTarget.dataset
        if (overrideAp === 'inc') {
          this.formDataCache.adjustedApCost++
        } else if (overrideAp === 'dec' && this.formDataCache.adjustedApCost > 0) {
          this.formDataCache.adjustedApCost--
        }
        this.render()
      })
    })
    form.querySelectorAll('[data-override-ammo]').forEach((overrideButton) => {
      overrideButton.addEventListener('click', (e) => {
        const { overrideAmmo } = e.currentTarget.dataset
        if (overrideAmmo === 'inc') {
          this.formDataCache.adjustedAmmoCost++
        } else if (overrideAmmo === 'dec' && this.formDataCache.adjustedAmmoCost > 0) {
          this.formDataCache.adjustedAmmoCost--
        }
        this.render()
      })
    })

    const addTarget = form.querySelector('[data-add-target]')
    addTarget?.addEventListener('click', () => this.renderTargetedDialog())

    const removeTarget = form.querySelector('[data-remove-target]')
    removeTarget?.addEventListener('click', () => {
      this.formDataCache.targeted = null
      this.formDataCache.totalApCost = this.weapon.system.totalApCost
      this.render()
    })

    const closeButton = form.querySelector('[data-close]')
    closeButton?.addEventListener('click', this.close())
  }

  getTargetedApCost(target) {
    let deadEye = this.actor.items.find((i) => i.name == 'deadEye')
    target == 'head' && deadEye ? attackBonus += 2 * deadEye.system.quantity : ''
    const isMelee = this.weapon.type === 'meleeWeapon'
    let apCost = AttackRoll.TARGET_COST?.[target] ?? 0
    const triggerDiscipline = this.actor.items.find((i) => i.name == 'Trigger Discipline')
    if (triggerDiscipline) {
      apCost -= 1
      triggerDiscipline.system.wildWasteland ? apCost -= 1 : ''
    }
    if (isMelee) {
      apCost -= 2
    }
    // VATS Matrix Overlay (Power Armor upgrade): reduces the extra AP cost
    // of a targeted (called shot) attack by 1/2/2 per tier (rank 3 adds no
    // further reduction). Tier is recorded on the actor by
    // data/actorBase.mjs#applyPowerArmorUpgrades.
    const vatsMatrixOverlayTier = this.actor.system.vatsMatrixOverlayTier ?? 0
    if (vatsMatrixOverlayTier >= 1) {
      apCost -= [0, 1, 2, 2][vatsMatrixOverlayTier]
    }
    return apCost > 0 ? apCost : 1
  }

  getTargetedDamage(formula) {
    let newDice
    const [diceCount, ...rest] = formula
    switch (this.formDataCache.targeted?.target) {
      case 'head':
        return `${Number(diceCount) + 1}${rest.join('')}`
      case 'arm':
      case 'leg':
        newDice = Number(diceCount) - 1
        newDice < 1 ? newDice = 1 : ''
        return `${newDice}${rest.join('')}`
      case 'carried':
        return 0
      default:
        return formula
    }
  }



 
 //Returns true if `text` appears in either the weapon's description or its bonusProperties field.
   hasProperty(text) {
    const { description, bonusProperties } = this.weapon.system
    const inDescription = typeof description === 'string' && description.includes(text)
    const inBonusProperties = typeof bonusProperties === 'string' && bonusProperties.includes(text)
    return inDescription || inBonusProperties
  }

  hasBonusProperty(text) {
    const { bonusProperties } = this.weapon.system
    return typeof bonusProperties === 'string' && bonusProperties.includes(text)
  }

  hasDestructive() {
    return this.hasProperty('Destructive')
  }

  hasWeighted() {
    return this.hasProperty('Weighted')
  }

  hasSturdy() {
    return this.hasProperty('Sturdy')
  }

  hasUpgraded() {
    return this.hasProperty('Upgraded')
  }


  applyDestructive(formula) {
    const qualifies = this.hasDestructive() || this.hasWeighted()
    if (!qualifies || !formula) return formula
    return formula.replace(/(\d+)d(\d+)(?!min)/gi, (match, diceCount, dieSize) => `${diceCount}d${dieSize}min2`)
  }

  getModifiedFormula(formula) {
    let result = formula
    if (this.hasBonusProperty('DMG Dice Up')) result = this.stepFormula(result, 1)
    if (this.hasBonusProperty('DMG Die Down')) result = this.stepFormula(result, -1)
    return this.applyDestructive(result)
  }


  getFlavor(target) {
    let flavor = ''
    if (this.weapon.type === 'explosive') {
      return `
        GET DOWN! ${this.weapon.name} thrown! this will detonate _____ <hr>
        1: In hand <br>
        2: Halfway to target <br>
        3 - 14: Start of your next turn. <br>
        15+: End of your turn.
      `
    } else {
      flavor = `BOOM! Attack with ${this.weapon.name}`
    }

    if (!target) {
      return flavor
    }

    if (target === 'carried') {
      flavor += ` aiming for the carried item`
    } else {
      flavor += ` aiming for the ${target}`
    }
  }

  getFinalApCost() {
    this.formDataCache.automaticAttack ? this.formDataCache.totalApCost = 0 : ''
    if (this.formDataCache.overrideAp) {
      return this.formDataCache.adjustedApCost
    }
     
    return this.formDataCache.totalApCost
  }

  getFinalAmmoCost() {
    if (this.formDataCache.overrideAmmo) {
      return this.formDataCache.adjustedAmmoCost
    }
    return this.formDataCache.overClocked ? 3 : this.formDataCache.boosted ? 2 : 1
  }

  /**
   * Combine all damage formulas and targeted adjustment
   */
  getCombinedDamageFormula() {
    return this.weapon.system.damages.reduce((total, damage, index) => {
      const formula = this.getModifiedFormula(damage.formula)
      if (index === 0) {
        total += this.getTargetedDamage(formula)
      } else {
        total += `+ ${this.getTargetedDamage(formula)}`
      }
      return total
    }, '')
  }

  getFinalCritical() {
    const baseCritFormula = this.weapon.system.totalCriticalFormula
    const baseCritMultiplier = this.weapon.system.totalCriticalMultiplier
    const bonusProperties = this.weapon.system.bonusProperties

    let finalCritFormula = baseCritFormula
    let finalCritMultiplier = baseCritMultiplier

    if (this.actor.type != "npc") {
      const finesse = this.actor.items.find((i) => i.name == 'Finesse')
      if (finesse) {
        const critBonus = finesse.system.wildWasteland ? 2 : 1
        if (baseCritFormula) {
          const [diceCount, diceSize] = baseCritFormula.split('d')
          finalCritFormula = `${Number(diceCount) + critBonus}d${diceSize}`
        }
        if (baseCritMultiplier > 1) {
          finalCritMultiplier = baseCritMultiplier + critBonus
        }
      }
      if (bonusProperties.includes("Double Crit DMG")) {
        finalCritMultiplier *= 2
      }
    }

    finalCritFormula = this.applyDestructive(finalCritFormula)

    return { formula: finalCritFormula, multiplier: finalCritMultiplier }
  }

  async performRoll() {
    if (this.formDataCache.consumesAp) {
      const canAfford = await this.actor.applyApCost(this.getFinalApCost())
      if (!canAfford) return
    }

    if (this.weapon.system.ammo.assigned) {
      const canAfford = this.weapon.applyAmmoCost(this.getFinalAmmoCost())
      if (!canAfford) return
    }

    if (this.weapon.type == "explosive") {
      let Qty = this.weapon.system.quantity
      Qty = Qty - 1
      await this.weapon.update({ 'system.quantity': Qty })
    }

    let {
      automaticAttack,
      skillBonus,
      attackBonus,
      damageBonus,
      abilityBonus,
      decayPenalty,
      actorLuck,
      actorPenalties,
      bonus,
      bonusdamage,
      fullAuto,
      overClocked,
      boosted,
    } = this.formDataCache

    if (overClocked) damageBonus += 4
    if (boosted) damageBonus += 2

    /**
     * Generate damage rolls
     */
    automaticAttack ? abilityBonus = 0 : ''
    const damageRolls = this.formDataCache.damages.map((damage) => {
      const baseFormula = this.getModifiedFormula(damage.formula)
      return {
        type: damage.selectedDamageType,
        weapon: this.weaponType,
        formula: this.formDataCache.targeted
          ? this.getTargetedDamage(baseFormula + ` + ${damageBonus} + ${bonusdamage || ''}`)
          : baseFormula + `+ ${damageBonus || ''} + ${bonusdamage || ''}`,
      }
    })

    /**
     * Determine this roll's final critical formula/multiplier
     * (weapon totals + Finesse), without mutating the weapon
     */
    const finalCritical = this.getFinalCritical()

    /**
     * Weapons that always hit skip the d20 roll entirely � post a
     * flavor-only card carrying the damage flags, then immediately
     * fire the same damage-roll path the "Roll damage" button uses.
     */
    if (this.weapon.system.autoHit) {
      const message = await getDocumentClass('ChatMessage').create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `${this.weapon.name} hits automatically!`,
        rollMode: game.settings.get('core', 'rollMode'),
        'flags.falloutzero': {
          type: 'attack',
          itemId: this.weapon.id,
          targeted: this.formDataCache.targeted,
          damage: {
            rolls: damageRolls,
            damageBonus,
            isCritical: false,
            criticalCondition: this.weapon.system.critical.condition,
            critical: `(${this.getCombinedDamageFormula()} + ${finalCritical.formula || ''} + ${abilityBonus}) * ${finalCritical.multiplier || ''}`,
          },
        },
      })

      await message._onRollDamage()
      return message
    }

    /**
     * Roll to hit
     */
    const rollBonusTotal = Number(skillBonus + attackBonus + abilityBonus + actorLuck + Number(bonus) - actorPenalties - decayPenalty)

    const roll = new Roll(
      `${this.getDice()} + ${rollBonusTotal}`,
      this.actor.getRollData(),
    )

    await roll.evaluate()

    const attackTooltip = `
    <div>
      <div>Skill bonus: ${skillBonus}</div>
      <div>Perks bonus: ${attackBonus}</div>
      <div>Ability bonus: ${abilityBonus}</div>
      <div>Luck bonus: ${actorLuck}</div>
      ${bonus ? `<div>Other bonus: ${bonus}</div>` : ''}
      <div>Penalties total: ${actorPenalties}</div>
      <div>Weapon decay: ${decayPenalty}</div>
      <hr />
      <div>Bonus Total: ${rollBonusTotal}</div>
    </div>
  `

    /**
     * Display roll to hit chat message
     */
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: this.getFlavor(this.formDataCache.targeted?.target),
      rollMode: game.settings.get('core', 'rollMode'),
      'flags.falloutzero': {
        type: 'attack',
        itemId: this.weapon.id,
        tooltip: attackTooltip,
        abilityBonus,
        targeted: this.formDataCache.targeted,
        damage: {
          rolls: damageRolls,
          damageBonus,
          isCritical: roll.dice[0].total >= this.weapon.system.critical.dice,
          criticalCondition: this.weapon.system.critical.condition,
          critical: `(${this.getCombinedDamageFormula()} + ${finalCritical.formula || ''} + ${abilityBonus}) * ${finalCritical.multiplier || ''}`,
        },
      },
    })
    return roll
  }

  async _updateObject(event, formData) {
    Object.assign(this.formDataCache, formData)

    if (event.type !== 'submit') {
      this.render()
      return
    }

    if (this.formDataCache.fanTheHammer) {
      if (!this.actor.hasKarmaCapAvailable()) {
        ui.notifications.warn('No Karma Caps available to Fan The Hammer!')
        this.formDataCache.fanTheHammer = false
        this.render()
        return
      }
      if (this.actor.system.actionPoints.value < 10) {
        ui.notifications.warn('Not enough AP to Fan The Hammer!')
        this.formDataCache.fanTheHammer = false
        this.render()
        return
      }
      this.actor.flipLastKarmaCap()
      this.formDataCache.fullAuto = true
      this.formDataCache.overrideAp = true
      this.formDataCache.adjustedApCost = 10
    }

    let repeat = this.formDataCache.repeat || 1
    this.formDataCache.fullAuto ? repeat = 20 : ''

    for (let i = 0; i < repeat; i++) {
      let actionPoints = this.actor.system.actionPoints.value
      let APCost = this.getFinalApCost()
      let ammoAvailable = this.weapon.system.ammo.capacity.value
      let fireStatus = true

      if (actionPoints < APCost) {
        ui.notifications.notify("AP Depleted")
        fireStatus = false
        i = 999
      }
      if (ammoAvailable < 1 && this.weapon.type == "rangedWeapon") {
        ui.notifications.notify("Ammo Depleted")
        fireStatus = false
        i = 999
      }
      if (fireStatus == true) {
        await this.performRoll()
      }

      if (this.formDataCache.fanTheHammer && i === 0) {
        this.formDataCache.adjustedApCost = 0
      }
    }

    let blocking = this.actor.items.find((i) => i.name == "Blocking")
    blocking ? blocking.delete() : ''
    this.onSubmitCallback()
    this.close()
  }
}
