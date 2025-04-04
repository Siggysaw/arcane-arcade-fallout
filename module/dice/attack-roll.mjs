export default class AttackRoll extends FormApplication {
  constructor(actor, weapon, options = {}, callback = () => {}) {
    super(actor, options)

    this.weapon = weapon
    this.actor = actor
    this.formDataCache = {
      consumesAp: true,
      skillBonus: this.actor.getSkillBonus(this.weapon.system.skillBonus),
      attackBonus: this.actor.getAttackBonus(),
      damageBonus: this.actor.getDamageBonus(),
      abilityBonus: this.weapon.getAbilityBonus(),
      decayPenalty: weapon.type == "explosive" ?  0 : this.weapon.getDecayValue(),
      actorLuck: this.actor.system.luckmod,
      actorPenalties: this.actor.system.penaltyTotal,
      totalBonus: this.actor.getSkillBonus(this.weapon.system.skillBonus) + this.actor.getAttackBonus() + this.weapon.getAbilityBonus() - this.weapon.getDecayValue() - this.actor.system.penaltyTotal + this.actor.system.luckmod,
      bonus: 0,
      targeted: null,
      advantageMode: options.advantageMode ?? AttackRoll.ADV_MODE.NORMAL,
      apCost: this.weapon.system.apCost,
      totalApCost: this.weapon.system.apCost,
      adjustedApCost: 0,
      critical: this.weapon.system.critical,
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
    head: 4,
    arm: 3,
    torso: 2,
    groin: 3,
    leg: 2,
    carried: 3,
  }

  async getData() {
    return {
      ...(await super.getData()),
      ...this.formDataCache,
    }
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
              const targetedAp = this.getTargetedApCost(e.target.name)
              this.formDataCache.targeted = {
                target: e.target.name,
                cost: targetedAp,
              }
              this.formDataCache.totalApCost = this.formDataCache.apCost + targetedAp
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
      console.log(e)
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

    const addTarget = form.querySelector('[data-add-target]')
    addTarget?.addEventListener('click', () => this.renderTargetedDialog())

    const removeTarget = form.querySelector('[data-remove-target]')
    removeTarget?.addEventListener('click', () => {
      this.formDataCache.targeted = null
      this.formDataCache.totalApCost = this.formDataCache.apCost
      this.render()
    })

    const closeButton = form.querySelector('[data-close]')
    closeButton?.addEventListener('click', this.close())
  }

  getTargetedApCost(target) {
    const isMelee = this.weapon.type === 'meleeWeapon'
    let apCost = AttackRoll.TARGET_COST?.[target] ?? 0
    console.log(this.actor.items)
    const triggerDiscipline = this.actor.items.find((i) => i.name == 'Trigger Discipline')
    if (triggerDiscipline) {
      apCost -= 1
    }
    if (isMelee) {
      apCost -= 2
    }
    return apCost > 0 ? apCost : 1
  }

  getTargetedDamage(formula) {
    const [diceCount, ...rest] = formula
    switch (this.formDataCache.targeted?.target) {
      case 'head':
        return `${Number(diceCount) + 1}${rest.join('')}`
      case 'arm':
      case 'leg':
        return `${Number(diceCount) - 1}${rest.join('')}`
      case 'carried':
        return 0
      default:
        return formula
    }
  }

  getFlavor(target) {
    let flavor = ''
    this.weapon.type == "explosive" ? flavor = `GET DOWN! ${this.weapon.name} thrown! this will detonate _____ <hr>
    1: In hand <br>
    2: Halfway to target <br>
    3 - 14: Start of your next turn. <br>
    15+: End of your turn.` : flavor = `BOOM! Attack with ${this.weapon.name}`
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
    if (this.formDataCache.overrideAp) {
      return this.formDataCache.adjustedApCost
    }
    return this.formDataCache.totalApCost
  }

  /**
   * Combine all damage formulas and targeted adjustment
   */
  getCombinedDamageFormula() {
    return this.weapon.system.damages.reduce((total, damage, index) => {
      if (index === 0) {
        total += this.getTargetedDamage(damage.formula)
      } else {
        total += `+ ${this.getTargetedDamage(damage.formula)}`
      }
      return total
    }, '')
  }

  async _updateObject(event, formData) {
    Object.assign(this.formDataCache, formData)

    /**
     * Rerender form if update and not submitted
     */
    if (event.type !== 'submit') {
      this.render()
      return
    }

    /**
     * Apply AP consumption
     */
    if (this.formDataCache.consumesAp) {
      const canAfford = this.actor.applyApCost(this.getFinalApCost())
      if (!canAfford) return
    }

    /**
     * Apply ammo consumption
     */
    if (this.weapon.system.ammo.assigned) {
      const canAfford = this.weapon.applyAmmoCost()
      if (!canAfford) return
    }
    if (this.weapon.type == "explosive") {
      let Qty = this.weapon.system.quantity
      Qty = Qty - 1
      this.weapon.update({ 'system.quantity': Qty })
    }
    /**
     * Deconstruct dialog form
     */
    const {
      skillBonus,
      attackBonus,
      damageBonus,
      abilityBonus,
      decayPenalty,
      actorLuck,
      actorPenalties,
      bonus,
      bonusdamage
    } = this.formDataCache

    const rollBonusTotal = Number(skillBonus + attackBonus + abilityBonus + actorLuck + Number(bonus) - actorPenalties - decayPenalty)
    console.log(`${rollBonusTotal} = ${skillBonus} + ${attackBonus} + ${abilityBonus} + ${actorLuck} + ${bonus} - ${actorPenalties} - ${decayPenalty}`)

    /**
     * Roll to hit
     */
    const roll = new Roll(
      `${this.getDice()} + ${rollBonusTotal}`,
      this.actor.getRollData(),
    )

    await roll.evaluate()

    const attackTooltip = `
      <div>
        <div>Die roll: ${roll.result.split(' ')[0]}</div><br />
        <div>Skill bonus: ${skillBonus}</div>
        <div>Perks bonus: ${attackBonus}</div>
        <div>Ability bonus: ${abilityBonus}</div>
        <div>Luck bonus: ${actorLuck}</div>
        ${bonus && `<div>Other bonus: ${bonus || 0}</div>`}
        <div>Penalties total: ${actorPenalties}</div>
        <div>Weapon decay: ${decayPenalty}</div>
        <hr />
        <div>Bonus Total: ${rollBonusTotal}</div>
      </div>
    `
    const damageTooltip = `
      <div>
        <div>Die roll: ${roll.result.split(' ')[0]}</div>
        <div>Ability bonus: ${abilityBonus}</div>
       <div>Traits/Perks bonus: ${damageBonus}</div>`

    /**
     * Generate damage rolls
     */
    const damageRolls = this.formDataCache.damages.map((damage) => {
      return {
        type: damage.selectedDamageType,
        formula: this.formDataCache.targeted
          ? this.getTargetedDamage(damage.formula + ` + ${damageBonus} + ${bonusdamage || ''}`)
          : damage.formula + `+ ${damageBonus || ''} + ${bonusdamage || ''}`,
      }
    })

    /**
     * Display roll to hit chat message
     */
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: this.getFlavor(this.formDataCache.targeted?.target),
      rollMode: game.settings.get('core', 'rollMode'),
      'flags.falloutzero': {
        type: 'attack',
        tooltip: attackTooltip,
        abilityBonus,
        targeted: this.formDataCache.targeted,
        damage: {
          rolls: damageRolls,
          isCritical: roll.dice[0].total >= this.weapon.system.critical.dice,
          criticalCondition: this.weapon.system.critical.condition,
          critical: `(${this.getCombinedDamageFormula()} + ${this.weapon.system.critical.formula || ''} + ${abilityBonus || ''}) * ${this.weapon.system.critical.multiplier || ''}`,
        },
      },
    })

    this.onSubmitCallback()
    this.close()
  }
}
