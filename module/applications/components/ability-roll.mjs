export default class AbilityRoll extends FormApplication {
  constructor(actor, ability, options = {}, callback = () => { }) {
    super(actor, options)

    this.actor = actor
    const abilities = ability
    this.formDataCache = {
      abilities,
      selectedAbility: abilities.abbr,
      selectedAbilityBonus: abilities.mod,
      selectedAbilityDescription: abilities.description,
      selectedAbilityImage: abilities.img,
      actorPenalties: this.actor.system.penaltyTotal,
      actorBoost: this.actor.system.boostDice,
      bonus: '',
      advantageMode:
        abilities.advantage === 0
          ? AbilityRoll.ADV_MODE.NORMAL
          : abilities.advantage > 0
            ? AbilityRoll.ADV_MODE.ADVANTAGE
            : AbilityRoll.ADV_MODE.DISADVANTAGE,
    }

    this.onSubmitCallback = callback
  }

  static get defaultOptions() {
    const options = super.defaultOptions

    options.classes = ['falloutzero', 'dialog', 'ability-roll']
    options.title = "Ability Roll"
    options.template = 'systems/arcane-arcade-fallout/templates/actor/dialog/ability-roll.hbs'
    options.width = 'auto'
    options.height = '550'
    options.submitOnChange = true
    options.closeOnSubmit = false
    options.resizable = true

    return options
  }

  /* -------------------------------------------- */

  /**
   * Dynamic window title, e.g. "Strength Roll".
   * The default options.title is static (set before an actor/ability
   * exist), so it can't know which ability this instance is for -
   * override the instance getter instead.
   * @override
   */
  get title() {
    return `${this.formDataCache.abilities.label} Roll`
  }

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
    const diceCount = [AbilityRoll.ADV_MODE.ADVANTAGE, AbilityRoll.ADV_MODE.DISADVANTAGE].includes(
      advantageMode,
    )
      ? 2
      : 1
    const diceSuffix =
      AbilityRoll.ADV_MODE.ADVANTAGE === advantageMode
        ? 'kh'
        : AbilityRoll.ADV_MODE.DISADVANTAGE === advantageMode
          ? 'kl'
          : ''
    return `${diceCount}d20${diceSuffix}`
  }

  activateListeners($html) {
    const form = $html[0]
    form.addEventListener('change', () => {
      const submitData = this._getSubmitData()
      Object.assign(this.formDataCache, {
        ...submitData
      })
      this.render()
    })

    const closeButton = form.querySelector('[data-close]')
    closeButton?.addEventListener('click', this.close())
  }

  getFlavor() {
    const label = this.formDataCache.abilities.label
    return `Performed a ${label} roll`
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
    let { skillBonus, selectedAbility, actorLuck, actorPenalties, actorBoost, bonus } = this.formDataCache
    let abilityBonus = this.actor.system.abilities[selectedAbility].mod
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
          <div>Ability bonus: ${abilityBonus}</div>
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
