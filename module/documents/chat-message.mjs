import { getTableFromPack } from '../helpers/tables.mjs'

export default class FalloutZeroChatMessage extends ChatMessage {
  /** @inheritDoc */
  _initialize(options = {}) {
    super._initialize(options)
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /**
   * The currently highlighted token for attack roll evaluation.
   * @type {Token5e|null}
   */
  _highlighted = null

  /* -------------------------------------------- */

  /**
   * Should the apply damage options appear?
   * @type {boolean}
   */
  get canApplyDamage() {
    return true
  }

  /* -------------------------------------------- */

  get actor() {
    const { scene: sceneId, token: tokenId, actor: actorId } = this.speaker
    return game.scenes.get(sceneId)?.tokens.get(tokenId)?.actor ?? game.actors.get(actorId)
  }

  get damage() {
    return this.flags?.falloutzero?.damage ?? null
  }

  get targeted() {
    return this.flags?.falloutzero?.targeted ?? null
  }

  get abilityBonus() {
    return this.flags?.falloutzero?.abilityBonus ?? null
  }

  get tooltip() {
    return this.flags?.falloutzero?.tooltip ?? null
  }

  get cardType() {
    return this.flags?.falloutzero?.type ?? null
  }

  get undoDamage() {
    return this.flags?.falloutzero?.undoDamage ?? null
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async renderHTML(...args) {

    // add ids for automated animations if chat was made by item
    if (this.flags.falloutzero?.itemId) {
      this.flags.itemId = this.flags.falloutzero.itemId
    }

    const html = await super.renderHTML()

    this._displayChatActionButtons(html)

    this._enrichChatCard(html)
    this._collapseTrays(html)

    return html
  }

  /* -------------------------------------------- */

  /**
   * Handle collapsing or expanding trays depending on user settings.
   * @param {HTMLElement} html  Rendered contents of the message.
   */
  _collapseTrays(html) {
    let collapse = true
    for (const tray of html.querySelectorAll('.card-tray, .effects-tray')) {
      tray.classList.toggle('collapsed', collapse)
    }
    for (const element of html.querySelectorAll('damage-application')) {
      element.toggleAttribute('open', !collapse)
    }
  }

  /* -------------------------------------------- */

  /**
   * Optionally hide the display of chat card action buttons which cannot be performed by the user
   * @param {jQuery} html     Rendered contents of the message.
   * @protected
   */
  _displayChatActionButtons(html) {
    const chatCard = html.querySelectorAll('.falloutzero.chat-card')
    if (chatCard.length > 0) {
      const flavor = html.querySelector('.flavor-text')
      if (flavor.text() === html.querySelector('.item-name').text()) flavor.remove()

      // Conceal effects that the user cannot apply.
      chatCard.find('.effects-tray .effect').each((i, el) => {
        if (
          !game.user.isGM &&
          (el.dataset.transferred === 'false' || this.author.id !== game.user.id)
        )
          el.remove()
      })

      // If the user is the message author or the actor owner, proceed
      let actor = game.actors.get(this.speaker.actor)
      if (game.user.isGM || actor?.isOwner || this.author.id === game.user.id) {
        const optionallyHide = (selector, hide) => {
          const element = chatCard[0].querySelector(selector)
          if (element && hide) element.style.display = 'none'
        }
        optionallyHide('button[data-action="summon"]', !SummonsData.canSummon)
        optionallyHide('button[data-action="placeTemplate"]', !game.user.can('TEMPLATE_CREATE'))
        optionallyHide(
          'button[data-action="consumeUsage"]',
          this.getFlag('falloutzero', 'use.consumedUsage'),
        )
        optionallyHide(
          'button[data-action="consumeResource"]',
          this.getFlag('falloutzero', 'use.consumedResource'),
        )
        return
      }

      // Otherwise conceal action buttons except for saving throw
      const buttons = chatCard.find('button[data-action]:not(.apply-effect)')
      buttons.each((i, btn) => {
        if (['save', 'rollRequest', 'concentration'].includes(btn.dataset.action)) return
        btn.style.display = 'none'
      })
    }
  }

  /* -------------------------------------------- */

  /**
   * Augment the chat card markup for additional styling.
   * @param {HTMLElement} html  The chat card markup.
   * @protected
   */
  _enrichChatCard(html) {
    // Header matter
    const { scene: sceneId, token: tokenId, actor: actorId } = this.speaker
    const actor = game.scenes.get(sceneId)?.tokens.get(tokenId)?.actor ?? game.actors.get(actorId)

    let img
    let nameText
    if (this.isContentVisible) {
      img = actor?.img ?? this.author.avatar
      nameText = this.alias
    } else {
      img = this.author.avatar
      nameText = this.author.name
    }

    const avatar = document.createElement('a')
    avatar.classList.add('avatar')
    if (actor) avatar.dataset.uuid = actor.uuid
    avatar.innerHTML = `<img src="${img}" alt="${nameText}">`

    const name = document.createElement('span')
    name.classList.add('name-stacked')
    name.innerHTML = `<span class="title">${nameText}</span>`

    const subtitle = document.createElement('span')
    subtitle.classList.add('subtitle')
    if (this.whisper.length) subtitle.innerText = html.querySelector('.whisper-to')?.innerText ?? ''
    if (nameText !== this.author?.name && !subtitle.innerText.length)
      subtitle.innerText = this.author?.name ?? ''

    name.appendChild(subtitle)

    const sender = html.querySelector('.message-sender')
    sender?.replaceChildren(avatar, name)
    html.querySelector('.whisper-to')?.remove()

    // Add reroll button
    this._addReRollButton(html)

    // Remove max formula text
    this._cleanFormula(html)

    // add formula tooltip
    this._addTooltip(html)

    // Add damage buttons
    this._addDamageButtons(html)

    // Add undo button
    this._addUndoButton(html)

    // Add apply damage buttons
    this._addApplyDamageButtons(html)

    html.querySelectorAll('.card-buttons [data-roll-damage]').forEach((button) => {
      button.addEventListener('click', this._onRollDamage.bind(this))
    })
    html.querySelectorAll('.card-buttons [data-roll-critical]').forEach((button) => {
      button.addEventListener('click', this._onRollCriticalDamage.bind(this))
    })
    html
      .querySelector('.card-buttons [data-roll-condition]')
      ?.addEventListener('click', this._onRollCondition.bind(this))
    avatar.addEventListener('click', this._onTargetMouseDown.bind(this))
    avatar.addEventListener('pointerover', this._onTargetHoverIn.bind(this))
    avatar.addEventListener('pointerout', this._onTargetHoverOut.bind(this))
  }

  _addDamageButtons(html) {
    if (!this.damage) return
    const messageContent = html.querySelector('.message-content')
    const buttonContainer = document.createElement('div')
    buttonContainer.classList.add('card-buttons')

    // regular damage button
    if (this.damage.rolls) {
      const button = document.createElement('button')
      button.innerHTML = '<span>Roll damage</span> <i class="fa-light fa-dice-d20">'
      button.dataset.rollDamage = ''
      buttonContainer.appendChild(button)
    }

    // critical multiplier damage button
    if (this.damage.critical) {
      const button = document.createElement('button')
      button.innerHTML = '<span>Roll critical damage</span> <i class="fa-light fa-dice-d20">'
      button.dataset.rollCritical = this.critical
      buttonContainer.appendChild(button)
    }

    // add targeted condition roll
    if (this.targeted) {
      const button = document.createElement('button')
      button.innerHTML =
        '<span>Roll targeted attack condition</span> <i class="fa-light fa-dice-d4">'
      button.dataset.rollCondition = ''
      buttonContainer.appendChild(button)
    }

    messageContent.appendChild(buttonContainer)
  }

  _addUndoButton(html) {
    if (!this.undoDamage || !game.user.isGM) return
    const metadata = html.querySelector('.message-metadata')
    const undoButton = document.createElement('div')
    undoButton.innerHTML =
      '<a data-tooltip="Undo"><i class="fa-solid fa-rotate-left"></i><a>'
    undoButton.addEventListener('click', this._undoApplyDamage.bind(this, html))
    metadata.appendChild(undoButton)
  }

  _cleanFormula(html) {
    const formula = html.querySelector('.dice-roll .dice-result .dice-formula')
    if (formula?.textContent?.startsWith('max(')) {
      formula.textContent = formula.textContent.substring(6, formula.textContent.length - 1)
    }
  }

  _addReRollButton(html) {
    if (!this.rolls?.length || this.rolls.length < 1) return
    const metadata = html.querySelector('.message-metadata')
    const rerollButton = document.createElement('div')
    rerollButton.innerHTML =
      '<a data-reroll data-tooltip="Reroll dice"><i class="fas fa-dice-d20 fa-fw"></i><a>'
    metadata.appendChild(rerollButton)
    metadata.querySelector('[data-reroll]').addEventListener('click', this._reRollDialog.bind(this))
  }

  _addTooltip(html) {
    if (!this.tooltip) return
    const formula = html.querySelector('.dice-roll .dice-result .dice-formula')
    formula.dataset.tooltip = this.tooltip
  }

  _addApplyDamageButtons(html) {
    if (this.cardType !== 'damage') return
    if (!game.user.isGM && this.author !== game.user) return

    const damageTypes = this.flags?.falloutzero.damageTypes
    const damageApplication = document.createElement('damage-application')
    damageApplication.classList.add('falloutzero')
    damageApplication.damages = this.rolls.map((roll, index) => ({
      value: roll.total,
      type: damageTypes[index],
      properties: new Set(roll.options.properties ?? []),
    }))
    html.querySelector('.message-content').appendChild(damageApplication)
  }

  _undoApplyDamage(cardHtml) {
    const actor = fromUuidSync(this.undoDamage.actorUuid)
    const { deltaTempSp, deltaSP, deltaTempHp, deltaHP } = this.undoDamage.changes
    actor.update({
      'system.stamina.temp': actor.system.stamina.temp + deltaTempSp,
      'system.stamina.value': actor.system.stamina.value + deltaSP,
      'system.health.temp': actor.system.health.temp + deltaTempHp,
      'system.health.value': actor.system.health.value + deltaHP,
    })
    cardHtml.remove()
    this.delete()
  }

  _reRollDialog() {
    return new Dialog({
      title: `Reroll dice`,
      content: 'Consume karma cap?',
      buttons: {
        close: {
          icon: '<i class="fas fa-times"></i>',
          label: 'No',
          callback: () => this._reRoll(false),
        },
        continue: {
          icon: '<i class="fas fa-chevron-right"></i>',
          label: 'Yes',
          callback: () => this._reRoll(true),
        },
      },
      default: 'close',
    }).render(true)
  }

  async _reRoll(consumeKarmaCap) {
    if (consumeKarmaCap) {
      try {
        this.actor.flipLastKarmaCap()
      } catch {
        ui.notifications.warn(`You don't have any karma caps available!`)
        return
      }
    }
    const newRoll = await this.rolls[0].reroll()
    newRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: this.flavor,
      rollMode: game.settings.get('core', 'rollMode'),
      'flags.falloutzero': {
        ...this.flags.falloutzero,
      },
    })
  }

  /* -------------------------------------------- */

  /* -------------------------------------------- */
  /*  Event Handlers                              */
  /* -------------------------------------------- */

  async _onRollCondition() {
    const table = await getTableFromPack(
      'arcane-arcade-fallout.targeted-attacks',
      this.targeted.target,
    )

    if (!table) {
      ui.notifications.warn(`Failed to get roll table for target condition ${this.targeted.target}`)
      return false
    }

    const conditionRoll = await table.roll()

    return conditionRoll.roll.toMessage({
      flavor: conditionRoll.results[0].text,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      rollMode: game.settings.get('core', 'rollMode'),
    })
  }

  /**
   * Handle damage button click.
   * @param {Event} event   The triggering event.
   * @returns {Promise}     A promise that resolves once roll message sent
   * @protected
   */
  async _onRollDamage() {
    try {
      const abilityBonus = this.abilityBonus || 0
      const damageTypes = this.damage.rolls.map((damage) => damage.type)
      const damageRolls = this.damage.rolls.map((damage) => damage.formula).join('+ ')

      return this._rollDamage(`${damageRolls} + ${abilityBonus}`, damageTypes)
    } catch (error) {
      console.error('Error rolling damage', error)
    }
  }

  /**
   * Handle damage button click.
   * @param {Event} event   The triggering event.
   * @returns {Promise}     A promise that resolves once roll message sent
   * @protected
   */
  async _onRollCriticalDamage() {
    try {
      const damageTypes = this.damage.rolls.map((damage) => damage.type)

      return this._rollDamage(this.damage.critical, damageTypes, true)
    } catch (error) {
      console.error('Error rolling critical damage', error)
    }
  }

  async _rollDamage(formula, types, isCritical = false) {
    let flavor = `KAPOW! ${types.join(' and ')} damage`
    if (this.targeted?.target) {
      const target =
        this.targeted.target === 'carried' ? `${this.targeted.target} item` : this.targeted.target
      flavor += ` to the ${target}!`
    } else {
      flavor += '!'
    }
    const minDamage = this.actor.type === 'character' ? 1 : 0
    if (isCritical && this.damage.criticalCondition) {
      flavor += ` And applies condition ${this.damage.criticalCondition}`
    }
    const roll = new Roll(
      this.targeted?.target === 'eyes' ? `max(${minDamage}, floor((${formula}) / 2))` : `max(${minDamage}, ${formula})`,
      this.actor.getRollData(),
    )

    return roll.toMessage({
      flavor,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      rollMode: game.settings.get('core', 'rollMode'),
      'flags.falloutzero': {
        type: 'damage',
        damageTypes: types,
      },
    })
  }

  /**
   * Handle target selection and panning.
   * @param {Event} event   The triggering event.
   * @returns {Promise}     A promise that resolves once the canvas pan has completed.
   * @protected
   */
  async _onTargetMouseDown(event) {
    const uuid = event.currentTarget.dataset.uuid
    const actor = fromUuidSync(uuid)
    const token = actor?.token?.object ?? actor?.getActiveTokens()[0]
    if (!token || !actor.testUserPermission(game.user, 'OBSERVER')) return
    const releaseOthers = !event.shiftKey
    if (token.controlled) token.release()
    else {
      token.control({ releaseOthers })
      return canvas.animatePan(token.center)
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle hovering over a target in an attack roll message.
   * @param {Event} event     Initiating hover event.
   * @protected
   */
  _onTargetHoverIn(event) {
    const uuid = event.currentTarget.dataset.uuid
    const actor = fromUuidSync(uuid)
    const token = actor?.token?.object ?? actor?.getActiveTokens()[0]
    if (token && token.isVisible) {
      if (!token.controlled) token._onHoverIn(event, { hoverOutOthers: true })
      this._highlighted = token
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle hovering out of a target in an attack roll message.
   * @param {Event} event     Initiating hover event.
   * @protected
   */
  _onTargetHoverOut(event) {
    if (this._highlighted) this._highlighted._onHoverOut(event)
    this._highlighted = null
  }
}
