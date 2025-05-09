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
    // const type = this.flags?.falloutzero?.roll?.type
    // if (type && type !== 'damage') return false
    // return this.isRoll && this.isContentVisible && !!canvas.tokens?.controlled.length
    return true
  }

  /* -------------------------------------------- */

  /**
   * Should the select targets options appear?
   * @type {boolean}
   */
  get canSelectTargets() {
    // if (this.flags?.aafo?.roll?.type !== 'attack') return false
    // return this.isRoll && this.isContentVisible
    return false
  }

  /* -------------------------------------------- */

  /**
   * Should roll DCs and other challenge details be displayed on this card?
   * @type {boolean}
   */
  get shouldDisplayChallenge() {
    if (game.user.isGM || this.author === game.user) return true
    switch (game.settings.get('falloutzero', 'challengeVisibility')) {
      case 'all':
        return true
      case 'player':
        return !this.author.isGM
      default:
        return false
    }
  }

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
  async getHTML(...args) {
    const html = await super.getHTML()

    this._displayChatActionButtons(html)
    this._highlightCriticalSuccessFailure(html)
    // if (game.settings.get('falloutzero', 'autoCollapseItemCards')) {
    //   html.find('.description.collapsible').each((i, el) => el.classList.add('collapsed'))
    // }

    this._enrichChatCard(html[0])
    this._collapseTrays(html[0])

    /**
     * A hook event that fires after aafo-specific chat message modifications have completed.
     * @function aafo.renderChatMessage
     * @memberof hookEvents
     * @param {ChatMessage5e} message  Chat message being rendered.
     * @param {HTMLElement} html       HTML contents of the message.
     */
    // Hooks.callAll('aafo.renderChatMessage', this, html[0])

    return html
  }

  /* -------------------------------------------- */

  /**
   * Handle collapsing or expanding trays depending on user settings.
   * @param {HTMLElement} html  Rendered contents of the message.
   */
  _collapseTrays(html) {
    let collapse = true
    // switch (game.settings.get('falloutzero', 'autoCollapseChatTrays')) {
    //   case 'always':
    //     collapse = true
    //     break
    //   case 'never':
    //     collapse = false
    //     break
    //   // Collapse chat message trays older than 5 minutes
    //   case 'older':
    //     collapse = this.timestamp < Date.now() - 5 * 60 * 1000
    //     break
    // }
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
    const chatCard = html.find('.falloutzero.chat-card')
    if (chatCard.length > 0) {
      const flavor = html.find('.flavor-text')
      if (flavor.text() === html.find('.item-name').text()) flavor.remove()

      if (this.shouldDisplayChallenge) chatCard[0].dataset.displayChallenge = ''

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
   * Highlight critical success or failure on d20 rolls.
   * @param {jQuery} html     Rendered contents of the message.
   * @protected
   */
  _highlightCriticalSuccessFailure(html) {
    // if (!this.isContentVisible || !this.rolls.length) return
    // const originatingMessage = this
    // const displayChallenge = originatingMessage?.shouldDisplayChallenge
    // // Highlight rolls where the first part is a d20 roll
    // for (let [index, d20Roll] of this.rolls.entries()) {
    //   const d0 = d20Roll.dice[0]
    //   if (d0?.faces !== 20 || d0?.values.length !== 1) continue
    //   d20Roll = aafo.dice.D20Roll.fromRoll(d20Roll)
    //   const d = d20Roll.dice[0]
    //   const isModifiedRoll =
    //     'success' in d.results[0] || d.options.marginSuccess || d.options.marginFailure
    //   if (isModifiedRoll) continue
    //   // Highlight successes and failures
    //   const total = html.find('.dice-total')[index]
    //   if (!total) continue
    //   if (d20Roll.isCritical) total.classList.add('critical')
    //   else if (d20Roll.isFumble) total.classList.add('fumble')
    //   else if (d.options.target && displayChallenge) {
    //     if (d20Roll.total >= d.options.target) total.classList.add('success')
    //     else total.classList.add('failure')
    //   }
    // }
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

    // SVG icons
    // html.querySelectorAll('i.aafo-icon').forEach((el) => {
    //   const icon = document.createElement('aafo-icon')
    //   icon.src = el.dataset.src
    //   el.replaceWith(icon)
    // })

    // Enriched roll flavor
    // const roll = this.getFlag('falloutzero', 'roll')
    // const item = fromUuidSync(roll?.itemUuid)
    // if (this.isContentVisible && item) {
    //   const isCritical = roll.type === 'damage' && this.rolls[0]?.options?.critical
    //   const subtitle =
    //     roll.type === 'damage'
    //       ? isCritical
    //         ? game.i18n.localize('AAFO.CriticalHit')
    //         : game.i18n.localize('AAFO.DamageRoll')
    //       : roll.type === 'attack'
    //         ? game.i18n.localize(`AAFO.Action${item.system.actionType.toUpperCase()}`)
    //         : item.system.type?.label ?? game.i18n.localize(CONFIG.Item.typeLabels[item.type])
    // const flavor = document.createElement('div')
    // flavor.classList.add('falloutzero', 'chat-card')
    // flavor.innerHTML = `
    //   <section class="card-header description ${isCritical ? 'critical' : ''}">
    //     <header class="summary">
    //       <img class="gold-icon" src="${item.img}" alt="${item.name}">
    //       <div class="name-stacked">
    //         <span class="title">${item.name}</span>
    //         <span class="subtitle">${subtitle}</span>
    //       </div>
    //     </header>
    //   </section>
    // `
    // html.querySelector('.message-header .flavor-text').remove()
    // html.querySelector('.message-content').insertAdjacentElement('afterbegin', flavor)
    // }

    // Attack targets
    // this._enrichAttackTargets(html)

    // Dice rolls
    // if (this.isContentVisible) {
    //   html.querySelectorAll('.dice-tooltip').forEach((el, i) => {
    //     if (!(roll instanceof DamageRoll)) this._enrichRollTooltip(this.rolls[i], el)
    //   })
    //   this._enrichDamageTooltip(
    //     this.rolls.filter((r) => r instanceof DamageRoll),
    //     html,
    //   )
    //   this._enrichEnchantmentTooltip(html)
    //   html
    //     .querySelectorAll('.dice-roll')
    //     .forEach((el) => el.addEventListener('click', this._onClickDiceRoll.bind(this)))
    // } else {
    //   html.querySelectorAll('.dice-roll').forEach((el) => el.classList.add('secret-roll'))
    // }

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

  /**
   * Augment roll tooltips with some additional information and styling.
   * @param {Roll} roll            The roll instance.
   * @param {HTMLDivElement} html  The roll tooltip markup.
   */
  _enrichRollTooltip(roll, html) {
    // const constant = Number(simplifyRollFormula(roll._formula, { deterministic: true }))
    // if (!constant) return
    // const sign = constant < 0 ? '-' : '+'
    // const part = document.createElement('section')
    // part.classList.add('tooltip-part', 'constant')
    // part.innerHTML = `
    //   <div class="dice">
    //     <ol class="dice-rolls"></ol>
    //     <div class="total">
    //       <span class="value"><span class="sign">${sign}</span>${Math.abs(constant)}</span>
    //     </div>
    //   </div>
    // `
    // html.appendChild(part)
  }

  /* -------------------------------------------- */

  /**
   * Augment attack cards with additional information.
   * @param {HTMLLIElement} html   The chat card.
   * @protected
   */
  _enrichAttackTargets(html) {
    // const attackRoll = this.rolls[0]
    // const targets = this.getFlag('falloutzero', 'targets')
    // if (!game.user.isGM || !(attackRoll instanceof aafo.dice.D20Roll) || !targets?.length) return
    // const evaluation = document.createElement('ul')
    // evaluation.classList.add('aafo2', 'evaluation')
    // evaluation.innerHTML = targets
    //   .map(({ name, img, ac, uuid }) => {
    //     const isMiss = !attackRoll.isCritical && (attackRoll.total < ac || attackRoll.isFumble)
    //     return [
    //       `
    //     <li data-uuid="${uuid}" class="target ${isMiss ? 'miss' : 'hit'}">
    //       <img src="${img}" alt="${name}">
    //       <div class="name-stacked">
    //         <span class="title">
    //           ${name}
    //           <i class="fas ${isMiss ? 'fa-times' : 'fa-check'}"></i>
    //         </span>
    //       </div>
    //       <div class="ac">
    //         <i class="fas fa-shield-halved"></i>
    //         <span>${ac}</span>
    //       </div>
    //     </li>
    //   `,
    //       isMiss,
    //     ]
    //   })
    //   .sort((a, b) => (a[1] === b[1] ? 0 : a[1] ? 1 : -1))
    //   .reduce((str, [li]) => str + li, '')
    // evaluation.querySelectorAll('li.target').forEach((target) => {
    //   target.addEventListener('click', this._onTargetMouseDown.bind(this))
    //   target.addEventListener('pointerover', this._onTargetHoverIn.bind(this))
    //   target.addEventListener('pointerout', this._onTargetHoverOut.bind(this))
    // })
    // html.querySelector('.message-content')?.appendChild(evaluation)
  }

  /* -------------------------------------------- */

  /**
   * Coalesce damage rolls into a single breakdown.
   * @param {DamageRoll[]} rolls  The damage rolls.
   * @param {HTMLElement} html    The chat card markup.
   * @protected
   */
  _enrichDamageTooltip(rolls, html) {
    // if (!rolls.length) return
    // let { formula, total, breakdown } = aggregateDamageRolls(rolls).reduce(
    //   (obj, r) => {
    //     obj.formula.push(r.formula)
    //     obj.total += r.total
    //     this._aggregateDamageRoll(r, obj.breakdown)
    //     return obj
    //   },
    //   { formula: [], total: 0, breakdown: {} },
    // )
    // formula = formula.join('').replace(/^ \+ /, '')
    // html.querySelectorAll('.dice-roll').forEach((el) => el.remove())
    // const roll = document.createElement('div')
    // roll.classList.add('dice-roll')
    // const tooltipContents = Object.entries(breakdown).reduce(
    //   (str, [type, { total, constant, dice }]) => {
    //     const config = CONFIG.AAFO.damageTypes[type] ?? CONFIG.AAFO.healingTypes[type]
    //     return `${str}
    //     <section class="tooltip-part">
    //       <div class="dice">
    //         <ol class="dice-rolls">
    //           ${dice.reduce(
    //             (str, { result, classes }) => `
    //             ${str}<li class="roll ${classes}">${result}</li>
    //           `,
    //             '',
    //           )}
    //           ${
    //             constant
    //               ? `
    //           <li class="constant"><span class="sign">${constant < 0 ? '-' : '+'}</span>${Math.abs(constant)}</li>
    //           `
    //               : ''
    //           }
    //         </ol>
    //         <div class="total">
    //           ${config ? `<img src="${config.icon}" alt="${config.label}">` : ''}
    //           <span class="label">${config?.label ?? ''}</span>
    //           <span class="value">${total}</span>
    //         </div>
    //       </div>
    //     </section>
    //   `
    //   },
    //   '',
    // )
    // roll.innerHTML = `
    //   <div class="dice-result">
    //     <div class="dice-formula">${formula}</div>
    //     <div class="dice-tooltip-collapser">
    //       <div class="dice-tooltip">
    //         ${tooltipContents}
    //       </div>
    //     </div>
    //     <h4 class="dice-total">${total}</h4>
    //   </div>
    // `
    // html.querySelector('.message-content').appendChild(roll)
    // if (game.user.isGM) {
    //   const damageApplication = document.createElement('damage-application')
    //   damageApplication.classList.add('aafo2')
    //   damageApplication.damages = aggregateDamageRolls(rolls, { respectProperties: true }).map(
    //     (roll) => ({
    //       value: roll.total,
    //       type: roll.options.type,
    //       properties: new Set(roll.options.properties ?? []),
    //     }),
    //   )
    //   html.querySelector('.message-content').appendChild(damageApplication)
    // }
  }

  /* -------------------------------------------- */

  /**
   * Aggregate damage roll information by damage type.
   * @param {DamageRoll} roll  The damage roll.
   * @param {Record<string, {total: number, constant: number, dice: {result: string, classes: string}[]}>} breakdown
   * @protected
   */
  _aggregateDamageRoll(roll, breakdown) {
    // const aggregate = (breakdown[roll.options.type] ??= {
    //   total: roll.total,
    //   constant: 0,
    //   dice: [],
    // })
    // for (let i = roll.terms.length - 1; i >= 0; ) {
    //   const term = roll.terms[i--]
    //   if (!(term instanceof NumericTerm) && !(term instanceof DiceTerm)) continue
    //   const value = term.total
    //   if (term instanceof DiceTerm)
    //     aggregate.dice.push(
    //       ...term.results.map((r) => ({
    //         result: term.getResultLabel(r),
    //         classes: term.getResultCSS(r).filterJoin(' '),
    //       })),
    //     )
    //   let multiplier = 1
    //   let operator = roll.terms[i]
    //   while (operator instanceof OperatorTerm) {
    //     if (operator.operator === '-') multiplier *= -1
    //     operator = roll.terms[--i]
    //   }
    //   if (term instanceof NumericTerm) aggregate.constant += value * multiplier
    // }
  }

  /* -------------------------------------------- */

  /* -------------------------------------------- */
  /*  Event Handlers                              */
  /* -------------------------------------------- */

  /**
   * This function is used to hook into the Chat Log context menu to add additional options to each message
   * These options make it easy to conveniently apply damage to controlled tokens based on the value of a Roll
   *
   * @param {HTMLElement} html    The Chat Message being rendered
   * @param {object[]} options    The Array of Context Menu options
   *
   * @returns {object[]}          The extended options Array including new context choices
   */
  static addChatMessageContextOptions(html, options) {
    const canApply = ([li]) => game.messages.get(li.dataset.messageId)?.canApplyDamage
    const canTarget = ([li]) => game.messages.get(li.dataset.messageId)?.canSelectTargets
    options.push(
      {
        name: 'ChatContextDamage',
        icon: '<i class="fas fa-user-minus"></i>',
        condition: canApply,
        callback: (li) => game.messages.get(li.data('messageId'))?.applyChatCardDamage(li, 1),
        group: 'damage',
      },
      {
        name: 'ChatContextHealing',
        icon: '<i class="fas fa-user-plus"></i>',
        condition: canApply,
        callback: (li) => game.messages.get(li.data('messageId'))?.applyChatCardDamage(li, -1),
        group: 'damage',
      },
      {
        name: 'ChatContextTempHP',
        icon: '<i class="fas fa-user-clock"></i>',
        condition: canApply,
        callback: (li) => game.messages.get(li.data('messageId'))?.applyChatCardTemp(li),
        group: 'damage',
      },
      {
        name: 'ChatContextDoubleDamage',
        icon: '<i class="fas fa-user-injured"></i>',
        condition: canApply,
        callback: (li) => game.messages.get(li.data('messageId'))?.applyChatCardDamage(li, 2),
        group: 'damage',
      },
      {
        name: 'ChatContextHalfDamage',
        icon: '<i class="fas fa-user-shield"></i>',
        condition: canApply,
        callback: (li) => game.messages.get(li.data('messageId'))?.applyChatCardDamage(li, 0.5),
        group: 'damage',
      },
      {
        name: 'ChatContextSelectHit',
        icon: '<i class="fas fa-bullseye"></i>',
        condition: canTarget,
        callback: ([li]) => game.messages.get(li.dataset.messageId)?.selectTargets(li, 'hit'),
        group: 'attack',
      },
      {
        name: 'ChatContextSelectMiss',
        icon: '<i class="fas fa-bullseye"></i>',
        condition: canTarget,
        callback: ([li]) => game.messages.get(li.dataset.messageId)?.selectTargets(li, 'miss'),
        group: 'attack',
      },
    )
    return options
  }

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
    if (isCritical && this.damage.criticalCondition){
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

  /* -------------------------------------------- */

  /**
   * Apply rolled dice damage to the token or tokens which are currently controlled.
   * This allows for damage to be scaled by a multiplier to account for healing, critical hits, or resistance
   *
   * @param {HTMLElement} li      The chat entry which contains the roll data
   * @param {number} multiplier   A damage multiplier to apply to the rolled damage.
   * @returns {Promise}
   */
  applyChatCardDamage(li, multiplier) {
    // const damages = aggregateDamageRolls(this.rolls, { respectProperties: true }).map((roll) => ({
    //   value: roll.total,
    //   type: roll.options.type,
    //   properties: new Set(roll.options.properties ?? []),
    // }))
    // return Promise.all(
    //   canvas.tokens.controlled.map((t) => {
    //     return t.actor?.applyDamage(damages, { multiplier, invertHealing: false, ignore: true })
    //   }),
    // )
  }

  /* -------------------------------------------- */

  /**
   * Select the hit or missed targets.
   * @param {HTMLElement} li    The chat entry which contains the roll data.
   * @param {string} type       The type of selection ('hit' or 'miss').
   */
  selectTargets(li, type) {
    // if (!canvas?.ready) return
    // const lis = li.closest('[data-message-id]').querySelectorAll(`.evaluation li.target.${type}`)
    // const uuids = new Set(Array.from(lis).map((n) => n.dataset.uuid))
    // canvas.tokens.releaseAll()
    // uuids.forEach((uuid) => {
    //   const actor = fromUuidSync(uuid)
    //   if (!actor) return
    //   const tokens = actor.isToken ? [actor.token?.object] : actor.getActiveTokens()
    //   for (const token of tokens) {
    //     if (token?.isVisible && actor.testUserPermission(game.user, 'OWNER')) {
    //       token.control({ releaseOthers: false })
    //     }
    //   }
    // })
  }

  /* -------------------------------------------- */

  /**
   * Apply rolled dice as temporary hit points to the controlled token(s).
   * @param {HTMLElement} li  The chat entry which contains the roll data
   * @returns {Promise}
   */
  applyChatCardTemp(li) {
    // const total = this.rolls.reduce((acc, roll) => acc + roll.total, 0)
    // return Promise.all(
    //   canvas.tokens.controlled.map((t) => {
    //     return t.actor?.applyTempHP(total)
    //   }),
    // )
  }

  /* -------------------------------------------- */

  /**
   * Handle dice roll expansion.
   * @param {PointerEvent} event  The triggering event.
   * @protected
   */
  _onClickDiceRoll(event) {
    // event.stopPropagation()
    // const target = event.currentTarget
    // target.classList.toggle('expanded')
  }

  /* -------------------------------------------- */

  /**
   * Handle rendering a chat popout.
   * @param {ChatPopout} app  The ChatPopout Application instance.
   * @param {jQuery} html     The rendered Application HTML.
   */
  static onRenderChatPopout(app, [html]) {
    // const close = html.querySelector('.header-button.close')
    // close.innerHTML = '<i class="fas fa-times"></i>'
    // close.dataset.tooltip = 'Close'
    // close.setAttribute('aria-label', close.dataset.tooltip)
    // html.querySelector('.message-metadata [data-context-menu]')?.remove()
  }

  /* -------------------------------------------- */

  /**
   * Wait to apply appropriate element heights until after the chat log has completed its initial batch render.
   * @param {jQuery} html  The chat log HTML.
   */
  static onRenderChatLog([html]) {}

  /* -------------------------------------------- */
  /*  Helpers                                     */
  /* -------------------------------------------- */

  /**
   * Get the Actor which is the author of a chat card.
   * @returns {Actor|void}
   */
  getAssociatedActor() {
    // if (this.speaker.scene && this.speaker.token) {
    //   const scene = game.scenes.get(this.speaker.scene)
    //   const token = scene?.tokens.get(this.speaker.token)
    //   if (token) return token.actor
    // }
    // return game.actors.get(this.speaker.actor)
  }

  /* -------------------------------------------- */

  /**
   * Get the item associated with this chat card.
   * @returns {Item5e|void}
   */
  getAssociatedItem() {
    // const actor = this.getAssociatedActor()
    // if (!actor) return
    // const storedData = this.getFlag('falloutzero', 'itemData')
    // return storedData
    //   ? new Item.implementation(storedData, { parent: actor })
    //   : actor.items.get(this.getFlag('falloutzero', 'use.itemId'))
  }
}
