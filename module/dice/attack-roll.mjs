export default class AttackRoll extends FormApplication {
  constructor(actor, weapon, options = {}, callback = () => {}) {
    super(actor, options)

    this.weapon = weapon
    this.actor = actor

    this.formDataCache = {
      consumesAp: true,
      skillBonus: this.weapon.getSkillBonus(),
      abilityBonus: this.weapon.getAbilityBonus(),
      decayPenalty: this.weapon.getDecayValue(),
      actorLuck: this.weapon.getActorLuck(),
      actorPenalties: this.weapon.getActorPenalties(),
      bonus: '',
      targeted: null,
      advantageMode: options.advantageMode ?? AttackRoll.ADV_MODE.NORMAL,
      apCost: this.weapon.system.apCost,
      totalApCost: this.weapon.system.apCost,
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
   * Advantage mode of a 5e d20 roll
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
    const html = $html[0]

    const addTarget = html.querySelector('[data-add-target]')
    addTarget?.addEventListener('click', () => this.renderTargetedDialog())

    const removeTarget = html.querySelector('[data-remove-target]')
    removeTarget?.addEventListener('click', () => {
      this.formDataCache.targeted = null
      this.formDataCache.totalApCost = this.formDataCache.apCost
      this.render()
    })

    const closeButton = html.querySelector('[data-close]')
    closeButton?.addEventListener('click', this.close())
  }

  getTargetedApCost(target) {
    const isMelee = this.weapon.type === 'meleeWeapon'
    let apCost = AttackRoll.TARGET_COST?.[target] ?? 0
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
    let flavor = 'BOOM! Attack with ${this.weapon.name}'
    if (!target) {
      return flavor
    }

    if (target === 'carried') {
      flavor += ` aiming for the carried item`
    } else {
      flavor += ` aiming for the ${target}`
    }
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
      const canAfford = this.actor.applyApCost(this.formDataCache.totalApCost)
      if (!canAfford) return
    }
    /**
     * Apply ammo consumption
     */
    if (this.weapon.system.consumesAmmo) {
      const canAfford = this.weapon.applyAmmoCost()
      if (!canAfford) return
    }

    /**
     * Deconstruct dialog form
     */
    const { skillBonus, abilityBonus, decayPenalty, actorLuck, actorPenalties, bonus } =
      this.formDataCache

    /**
     * Roll to hit
     */
    const roll = new Roll(
      `${this.getDice()} + ${skillBonus} + ${abilityBonus} + ${actorLuck} + ${bonus || 0} - ${actorPenalties} - ${decayPenalty}`,
      this.actor.getRollData(),
    )

    await roll.evaluate()

    const attackTooltip = `
      <div>
        <div>Die roll: ${roll.result.split(' ')[0]}</div>
        <div>Skill bonus: ${skillBonus}</div>
        <div>Ability bonus: ${abilityBonus}</div>
        <div>Luck bonus: ${actorLuck}</div>
        ${bonus && `<div>Other bonus: ${bonus || 0}</div>`}
        <div>Penalties total: ${actorPenalties}</div>
        <div>Weapon decay: ${decayPenalty}</div>
      </div>
    `

    /**
     * Generate damage rolls
     */
    const damageRolls = this.formDataCache.damages.map((damage) => {
      return {
        type: damage.selectedDamageType,
        formula: this.formDataCache.targeted
          ? this.getTargetedDamage(damage.formula)
          : damage.formula,
      }
    })

    /**
     * Display roll to hit chat message
     */
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: this.getFlavor(this.formDataCache.targeted.target),
      rollMode: game.settings.get('core', 'rollMode'),
      'flags.falloutzero': {
        type: 'attack',
        tooltip: attackTooltip,
        abilityBonus,
        targeted: this.formDataCache.targeted,
        damage: {
          rolls: damageRolls,
          critical: `(${this.getCombinedDamageFormula()} + ${this.weapon.system.critical.formula || 0} + ${abilityBonus}) * ${this.weapon.system.critical.multiplier}`,
        },
      },
    })

    this.onSubmitCallback()
    this.close()
  }
}
