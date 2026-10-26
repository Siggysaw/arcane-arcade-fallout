import { getTableFromPack } from '../helpers/tables.mjs'

export default class FalloutZeroChatMessage extends ChatMessage {
  /** @inheritDoc */
  _initialize(options = {}) {
    super._initialize(options)
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /** The currently highlighted token for attack roll evaluation. */
  _highlighted = null

  /* -------------------------------------------- */

  /** Should the apply damage options appear? */
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

  /** Whether this attack roll beat a targeted token's AC, or null if nothing was targeted. */
  get hit() {
    return this.flags?.falloutzero?.hit ?? null
  }

  get cardType() {
    return this.flags?.falloutzero?.type ?? null
  }

  get undoDamage() {
    return this.flags?.falloutzero?.undoDamage ?? null
  }
  get damageBonus() {
    return this.damage?.damageBonus ?? 0
  }

  /** This damage message's rolls as DamageDescription[], shared by the apply-damage tray and attack roll. */
  get applicationDamages() {
    if (this.cardType !== 'damage') return null
    const damageTypes = this.flags?.falloutzero.damageTypes
    const isAreaEffect = this.flags?.falloutzero.isAreaEffect
    const isCritical = this.flags?.falloutzero.isCritical
    const isMeleeAttack = this.flags?.falloutzero.isMeleeAttack
    return this.rolls.map((roll, index) => ({
      value: roll.total,
      type: damageTypes[index],
      properties: new Set([
        ...(roll.options.properties ?? []),
        ...(isAreaEffect ? ['areaOfEffect'] : []),
        ...(isCritical ? ['criticalHit'] : []),
        ...(isMeleeAttack ? ['meleeAttack'] : []),
      ]),
    }))
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

  /** Handles collapsing or expanding trays depending on user settings. */
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

  /** Hides chat card action buttons the current user cannot perform. */
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

  /** Augments the chat card markup for additional styling. */
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

    // Color the to-hit roll's dice red when it beat AC
    this._addHitStyling(html)

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
    // A multi-damage-type roll (see _rollDamage) shows one dice-roll block per
    // type, so every block needs cleaning, not just the first.
    html.querySelectorAll('.dice-roll .dice-result .dice-formula').forEach((formula) => {
      if (formula?.textContent?.startsWith('max(')) {
        formula.textContent = formula.textContent.substring(6, formula.textContent.length - 1)
      }
    })
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

  /** Marks the dice-roll block as a hit so css/chat.css colors the dice red. */
  _addHitStyling(html) {
    if (this.cardType !== 'attack') return
    if (this.hit !== true) return
    html.querySelector('.dice-roll')?.classList.add('attack-hit')
  }

  _addApplyDamageButtons(html) {
    if (this.cardType !== 'damage') return
    if (!game.user.isGM) return

    const damageApplication = document.createElement('damage-application')
    damageApplication.classList.add('falloutzero')
    damageApplication.damages = this.applicationDamages
    html.querySelector('.message-content').appendChild(damageApplication)
  }

  async _undoApplyDamage(cardHtml) {
    const actor = fromUuidSync(this.undoDamage.actorUuid)
    const { deltaTempSp, deltaSP, deltaTempHp, deltaHP, powerArmor } = this.undoDamage.changes
    await actor.update({
      'system.stamina.temp': actor.system.stamina.temp + deltaTempSp,
      'system.stamina.value': actor.system.stamina.value + deltaSP,
      'system.health.temp': actor.system.health.temp + deltaTempHp,
      'system.health.value': actor.system.health.value + deltaHP,
    })

    // Restores any Power Armor HP/decay this damage application consumed.
    if (powerArmor) {
      const armorItem = fromUuidSync(powerArmor.itemUuid)
      if (armorItem) {
        await armorItem.update({
          'system.armorHP.value': armorItem.system.armorHP.value + powerArmor.deltaArmorHP,
          'system.decay': armorItem.system.decay + powerArmor.deltaDecay,
        })
      }
    }

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
    let rollFormula = this.rolls[0]._formula
    const persistant = this.actor.items.find((i) => i.name == "Persistent")
    const rollType = this.flags?.falloutzero?.type
    // Persistent grants advantage on reroll for skill checks; Wild Wasteland extends it to attacks.
    const persistentApplies = !!persistant && consumeKarmaCap && (
      rollType === 'skill' ||
      (rollType === 'attack' && persistant.system.wildWasteland)
    )
    if (persistentApplies) {
      ui.notifications.notify("Persistent Perk Activated! Advantage Gained!")

      let newRollFormula = rollFormula
      rollFormula.includes("1d20") ? newRollFormula = rollFormula.replace("1d20", "2d20kh") : 
      rollFormula.includes("2d20kl") ? newRollFormula = rollFormula.replace("2d20kl", "1d20") : 
      rollFormula.includes("2d20kh") ? newRollFormula = rollFormula.replace("2d20kh", "3d20kh") : ''

      this.rolls[0]._formula = newRollFormula
    }

    let newRoll = await this.rolls[0].reroll()
    
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

  /** Handles the damage button click. */
  async _onRollDamage() {
    try {
      const abilityBonus = this.abilityBonus || 0
      // One component per damage type - each gets rolled as its OWN Roll (see
      // _rollDamage) so immune/resisted/vulnerable types can be told apart
      // later. Joining every type into a single combined formula (the old
      // behavior) produced one Roll whose total got tagged with only the
      // FIRST damage type, so system.di immunity could never catch damage
      // from the other types - this is the bug where a target immune to,
      // say, Acid and Radiation still took full damage from a Piercing +
      // Acid + Radiation attack, because the whole total read as "piercing".
      const components = this.damage.rolls.map((damage, index) => ({
        type: damage.type,
        // The flat ability bonus applies once to the attack, not once per
        // damage type - attach it to a single component so it isn't added
        // N times for an N-damage-type weapon.
        formula: index === 0 ? `${damage.formula} + ${abilityBonus}` : damage.formula,
      }))

      return this._rollDamage(components)
    } catch (error) {
      console.error('Error rolling damage', error)
    }
  }

  /** Handles the critical damage button click. */
  async _onRollCriticalDamage() {
    try {
      // criticalRolls (added alongside the legacy combined `critical` string
      // in attack-roll.mjs) carries one already-multiplied formula per
      // damage type, mirroring damage.rolls. Older chat messages created
      // before this fix only have the combined `critical` string - fall
      // back to rolling that as a single component so they still work,
      // just without the per-type split.
      const damageTypes = this.damage.rolls.map((damage) => damage.type)
      const components = this.damage.criticalRolls
        ? this.damage.criticalRolls.map((damage) => ({ type: damage.type, formula: damage.formula }))
        : [{ type: damageTypes[0], formula: this.damage.critical }]

      return this._rollDamage(components, true)
    } catch (error) {
      console.error('Error rolling critical damage', error)
    }
  }

  /**
   * Rolls one Roll per damage-type component and posts them all on a single
   * chat message, so `applicationDamages` can hand Actor#applyDamage a
   * correctly-typed DamageDescription per type instead of one lump total.
   * @param {{type: string, formula: string}[]} components
   * @param {boolean} isCritical
   */
  async _rollDamage(components, isCritical = false) {
    const types = components.map((c) => c.type)
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

    const isEyesTarget = this.targeted?.target === 'eyes'
    const rollData = this.actor.getRollData()

    // Only the first component gets the minDamage floor - applying "at least
    // minDamage" to every type separately would let an N-type weapon deal
    // N*minDamage as a guaranteed floor instead of minDamage overall.
    const rolls = []
    for (let i = 0; i < components.length; i++) {
      const floor = i === 0 ? minDamage : 0
      const wrapped = isEyesTarget
        ? `max(${floor}, floor((${components[i].formula}) / 2))`
        : `max(${floor}, ${components[i].formula})`
      const roll = new Roll(wrapped, rollData)
      await roll.evaluate()
      rolls.push(roll)
    }

    // Upgraded: +2 damage for every individual damage die (across every
    // damage-type roll) that shows a 1 or 2
    const weapon = this.actor?.items?.get(this.flags?.falloutzero?.itemId)
    const hasUpgraded =
      typeof weapon?.system?.bonusProperties === 'string' && weapon.system.bonusProperties.includes('Upgraded')

    // Fitted 1: DT doubles vs area-of-effect damage; explosives always count as AOE.
    const isAreaEffect =
      weapon?.type === 'explosive' ||
      [
        weapon?.system?.properties,
        weapon?.system?.description,
        weapon?.system?.bonusProperties,
      ].some((text) => typeof text === 'string' && text.includes('Area of Effect'))

    // Made of Sterner Stuff grants DT specifically against melee weapon-type attacks.
    const isMeleeAttack = weapon?.type === 'meleeWeapon'

    let upgradedBonus = 0
    let upgradedDieCount = 0
    if (hasUpgraded) {
      for (const roll of rolls) {
        for (const die of roll.dice) {
          for (const result of die.results) {
            if (result.active && (result.result === 1 || result.result === 2)) {
              upgradedBonus += 2
              upgradedDieCount += 1
            }
          }
        }
      }
      if (upgradedBonus > 0) {
        rolls[0]._total += upgradedBonus
        flavor += ` (+${upgradedBonus} from Upgraded)`
      }
    }

    const tooltip = `
      <div>
        <div>Ability bonus: ${this.abilityBonus || 0}</div>
        <div>Perks/Equipment bonus: ${this.damageBonus || 0}</div>
        ${upgradedBonus ? `<div>Upgraded bonus: +${upgradedBonus} (${upgradedDieCount} die${upgradedDieCount === 1 ? '' : 's'} rolled 1 or 2)</div>` : ''}
      </div>
    `

    // Post every component's Roll on one message. Originally this called
    // firstRoll.toMessage({ rolls: restRolls, ... }), trusting Roll#toMessage
    // to merge the remaining rolls in - confirmed live that it doesn't (only
    // the first roll ever showed up in the posted message, the rest silently
    // vanished). Creating the ChatMessage directly instead, the same way
    // attack-roll.mjs's own autoHit branch already successfully does,
    // passing every roll explicitly as the `rolls` array.
    return getDocumentClass('ChatMessage').create({
      rolls,
      flavor,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      rollMode: game.settings.get('core', 'rollMode'),
      sound: CONFIG.sounds.dice,
      'flags.falloutzero': {
        type: 'damage',
        damageTypes: types,
        tooltip,
        isAreaEffect,
        // Strengthened grants bonus DT specifically against critical-hit damage.
        isCritical,
        isMeleeAttack,
      },
    })
  }

  /** Handles target selection and canvas panning. */
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

  /** Handles hovering over a target in an attack roll message. */
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

  /** Handles hovering out of a target in an attack roll message. */
  _onTargetHoverOut(event) {
    if (this._highlighted) this._highlighted._onHoverOut(event)
    this._highlighted = null
  }
}
