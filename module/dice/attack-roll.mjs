export default class AttackRoll extends FormApplication {
  constructor(actor, weapon, options = {}, callback = () => {}) {
    super(actor, options)

    this.weapon = weapon
    this.actor = actor

    this.formDataCache = {
      skillBonus: this.weapon.getSkillBonus(),
      abilityBonus: this.weapon.getAbilityBonus(),
      decayPenalty: this.weapon.getDecayValue(),
      actorLuck: this.weapon.getActorLuck(),
      actorPenalties: this.weapon.getActorPenalties(),
      bonus: '',
      targeted: false,
      advantageMode: options.advantageMode ?? AttackRoll.ADV_MODE.NORMAL,
    }

    this.onSubmitCallback = callback
  }

  static get defaultOptions() {
    const options = super.defaultOptions

    options.classes = ['falloutzero', 'dialog', 'attack-roll']
    options.title = 'title'
    options.template = 'systems/arcane-arcade-fallout/templates/actor/dialog/attack.hbs'
    options.width = 'auto'
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
              this.formDataCache.targeted = e.target.name
              this.render()
              dlg.close()
            })
          })
        },
      },
      {
        template: 'systems/arcane-arcade-fallout/templates/actor/dialog/targeted-attack.hbs',
        width: 400,
        height: 600,
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
      this.formDataCache.targeted = false
      this.render()
    })
  }

  async _updateObject(event, formData) {
    Object.assign(this.formDataCache, formData)

    if (event.type !== 'submit') {
      this.render()
      return
    }

    const roll = new Roll(
      `${this.getDice()} + ${this.weaponRoll} + ${this.formDataCache.bonus || 0}`,
      this.actor.getRollData(),
    )
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `BOOM! Attack with ${this.weapon.name}`,
      rollMode: game.settings.get('core', 'rollMode'),
    })

    this.onSubmitCallback()
    this.close()
  }
}