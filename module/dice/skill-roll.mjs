export default class SkillRoll extends FormApplication {
  constructor(actor, skillKey, options = {}, callback = () => { }) {
    super(actor, options)

    this.actor = actor
    this.skill = actor.system.skills[skillKey]
    const abilities = this.skill.ability.map((key) => this.actor.system.abilities[key])

    this.formDataCache = {
      abilities,
      selectedAbility: abilities[0].abbr,
      selectedAbilityBonus: this.actor.getAbilityMod(abilities[0].abbr),
      skillBonus: this.actor.getSkillBonus(skillKey),
      actorLuck: this.actor.getAbilityMod(CONFIG.FALLOUTZERO.abilities.lck.id),
      actorPenalties: this.actor.system.penaltyTotal,
      actorBoost: this.actor.system.boostDice,
      bonus: '',
      advantageMode:
        this.skill.advantage === 0
          ? SkillRoll.ADV_MODE.NORMAL
          : this.skill.advantage > 0
            ? SkillRoll.ADV_MODE.ADVANTAGE
            : SkillRoll.ADV_MODE.DISADVANTAGE,
    }

    this.onSubmitCallback = callback
  }

  static get defaultOptions() {
    const options = super.defaultOptions

    options.classes = ['falloutzero', 'dialog', 'skill-roll']
    options.title = 'Skill roll'
    options.template = 'systems/arcane-arcade-fallout/templates/actor/dialog/skill.hbs'
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
  }

  async getData() {
    return {
      ...(await super.getData()),
      ...this.formDataCache,
      abilities: CONFIG.FALLOUTZERO.abilities,
    }
  }

  getDice() {
    const advantageMode = Number(this.formDataCache.advantageMode)
    const diceCount = [SkillRoll.ADV_MODE.ADVANTAGE, SkillRoll.ADV_MODE.DISADVANTAGE].includes(
      advantageMode,
    )
      ? 2
      : 1
    const diceSuffix =
      SkillRoll.ADV_MODE.ADVANTAGE === advantageMode
        ? 'kh'
        : SkillRoll.ADV_MODE.DISADVANTAGE === advantageMode
          ? 'kl'
          : ''
    return `${diceCount}d20${diceSuffix}`
  }

  activateListeners($html) {
    const form = $html[0]
    form.addEventListener('change', () => {
      const submitData = this._getSubmitData()
      Object.assign(this.formDataCache, {
        ...submitData,
        selectedAbilityBonus: this.actor.getAbilityMod(submitData.selectedAbility),
      })
      this.render()
    })

    const closeButton = form.querySelector('[data-close]')
    closeButton?.addEventListener('click', this.close())
  }

  getFlavor() {
    return `Performed a ${this.skill.label} roll using ${this.actor.system.abilities[this.formDataCache.selectedAbility].label}`
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
     * Deconstruct dialog form
     */
    let { skillBonus, selectedAbility, actorLuck, actorPenalties,actorBoost, bonus } = this.formDataCache
    let abilityBonus = this.actor.getAbilityMod(selectedAbility)
    /**
     * Roll to hit
     */
    const roll = new Roll(
      `${this.getDice()} + ${abilityBonus} + ${bonus || 0} + ${actorBoost || 0} - ${actorPenalties}`,
      this.actor.getRollData(),
    )

    await roll.evaluate()

    const skillTooltip = `
        <div>
          <div>Die roll: ${roll.result.split(' ')[0]}</div>
          <div>Skill bonus: ${skillBonus}</div>
          <div>Ability bonus: ${abilityBonus}</div>
          <div>Luck bonus: ${actorLuck}</div>
          ${bonus && `<div>Other bonus: ${bonus || 0}</div>`}
          <div>Penalties total: ${actorPenalties}</div>
        </div>
      `

    /**
     * Display roll to hit chat message
     */
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: this.getFlavor(),
      rollMode: game.settings.get('core', 'rollMode'),
      'flags.falloutzero': {
        type: 'skill',
        tooltip: skillTooltip,
      },
    })

    this.onSubmitCallback()
    this.close()
  }
}
