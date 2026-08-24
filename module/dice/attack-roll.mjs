import { applyDamageToActor } from '../helpers/damage-relay.mjs'

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
      // Force this attack to count as a critical hit regardless of the d20
      // result - for Sneak Attack, a perk that grants free crit damage in a
      // specific scenario, etc. Auto-hits (bypasses AC) and rolls the
      // critical damage formula, same as a roll that met the crit threshold
      // naturally.
      forceCritical: false,
      advantageMode: options.advantageMode ?? AttackRoll.ADV_MODE.NORMAL,
      apCost: this.weapon.system.apCost,
      totalApCost: this.weapon.system.totalApCost,
      adjustedApCost: 0,
      ammoCost: 1,
      totalAmmoCost: 1,
      adjustedAmmoCost: 0,

      critical: {
        dice: this.getCriticalThreshold(),
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

    // Keep the dialog's target summary live while the player is off
    // clicking tokens on the canvas (see _onSelectTargets()). Cleaned up in
    // close() so these don't pile up across repeated attack dialogs.
    this._targetHooks = [
      { hook: 'targetToken', id: Hooks.on('targetToken', () => this._refreshTargetSummary()) },
      { hook: 'controlToken', id: Hooks.on('controlToken', () => this._refreshTargetSummary()) },
    ]
  }

  /** @override */
  async close(options) {
    this._targetHooks?.forEach(({ hook, id }) => Hooks.off(hook, id))
    this._targetHooks = []
    this._restoreCanvasTool()
    return super.close(options)
  }

  /**
   * Re-render just enough to refresh the live target-summary readout in the
   * template. Called whenever targeting/selection changes on the canvas, so
   * the dialog (never minimized - see _onSelectTargets) shows an up-to-date
   * target list the whole time the player is clicking tokens.
   */
  _refreshTargetSummary() {
    if (this.rendered) this.render(false)
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
    data.attackTargetNames = this.getAttackTargets().map((t) => t.name)
    return data
  }

  /**
   * Tokens this attack will resolve against: whatever's currently targeted
   * with the crosshair tool (game.user.targets).
   *
   * Deliberately does NOT fall back to canvas.tokens.controlled/selected
   * tokens - a player attacking almost always still has their OWN token
   * selected/controlled on the canvas, so that fallback was silently
   * auto-applying the attack's damage back onto the attacker whenever
   * nobody had explicitly targeted anything ("they're going to accidentally
   * shoot themselves"). With no explicit target, this returns an empty
   * list; getTargetHitResults then has nothing to resolve against, so
   * auto-apply does nothing, and a GM handles the hit manually via the
   * damage card's own Apply tray - exactly how it worked before any of
   * this session's targeting automation existed.
   * @returns {Token[]}
   */
  getAttackTargets() {
    return Array.from(game.user.targets)
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

    const selectTargets = form.querySelector('[data-select-targets]')
    selectTargets?.addEventListener('click', () => this._onSelectTargets())

    const closeButton = form.querySelector('[data-close]')
    closeButton?.addEventListener('click', this.close())
  }

  /**
   * Handle clicking the "Select Target(s)" button: switch the player's
   * active canvas tool to the Token layer's Target tool, so left-clicking a
   * token targets it directly instead of controlling/selecting it - no need
   * to know the T keybind. The dialog itself is never minimized (a
   * minimized Application in Foundry doesn't reliably restore to its
   * original size, which made the earlier minimize-based flow annoying to
   * use) - it just stays open and visible while the player clicks tokens on
   * the canvas around/behind it, and its target summary keeps itself live
   * via the hooks registered in the constructor.
   */
  _onSelectTargets() {
    this._activateTargetTool()
    ui.notifications.info(`Target tool active - click token(s) on the canvas to target them, then roll here.`)
  }

  /**
   * Switch to the Token layer's "target" tool, remembering whatever tool
   * was active before so close() can restore it. Best-effort: Foundry's
   * scene-controls API has changed across versions (this system supports
   * Foundry 12-14), so every step here is guarded - if something doesn't
   * exist or throws, targeting still works the old way (T, or a token's
   * HUD), it just isn't pre-selected as the active tool.
   */
  _activateTargetTool() {
    try {
      const activeControl = ui.controls?.control?.name ?? ui.controls?.activeControl ?? null
      const activeTool = ui.controls?.tool?.name ?? ui.controls?.activeTool ?? null
      this._previousTool = activeControl === 'token' ? activeTool : null
    } catch (err) {
      this._previousTool = null
    }
    try {
      canvas.tokens?.activate({ tool: 'target' })
    } catch (err) {
      console.warn('AttackRoll: could not switch the canvas to the target tool automatically.', err)
    }
  }

  /**
   * Restore whatever Token-layer tool was active before _activateTargetTool
   * switched it, if any. Called from close() so the player isn't left
   * stuck on the target tool (where a plain click targets instead of
   * selects) after the attack dialog goes away.
   */
  _restoreCanvasTool() {
    if (!this._previousTool) return
    try {
      canvas.tokens?.activate({ tool: this._previousTool })
    } catch (err) {
      // Best-effort only - nothing to do if this fails.
    }
    this._previousTool = null
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


  /**
   * @param {string|null|undefined} target   Called-shot body part, if any.
   * @param {boolean|null} [hit]              Whether this roll hit at least
   *   one of getAttackTargets()'s tokens (see getTargetHitResults) - null/
   *   undefined when there's nothing targeted to compare against, in which
   *   case the wording stays neutral since hit/miss can't be determined.
   */
  getFlavor(target, hit) {
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
      flavor = hit ? `BOOM! Attack hits with ${this.weapon.name}` : `BOOM! Attack with ${this.weapon.name}`
    }

    if (!target) {
      return flavor
    }

    if (target === 'carried') {
      flavor += ` aiming for the carried item`
    } else {
      flavor += ` aiming for the ${target}`
    }

    // NB: this used to fall off the end of the function without a return
    // here, so getFlavor() came back undefined for every called-shot attack
    // (only the untargeted branch above ever returned anything) - callers
    // guarded against that with `getFlavor(...) || ''`. Fixed while touching
    // this function for the hit-wording change, since a called-shot attack
    // is exactly the kind of attack that should still show "hits" wording.
    return flavor
  }

  /**
   * The raw d20 result needed to critically hit with the current weapon:
   * the weapon's listed crit chance (`critical.dice`, adjusted by any
   * weapon upgrades into `critical.diceFinal`), lowered by half the
   * attacker's Luck modifier (`actor.system.critMod`, already halved and
   * floored at 0 by the actor data model). Matches the PDF's Critical Hit
   * Chance rule (pg. 39/128): "All weapons you attack with (besides
   * shotguns) have their critical hit chance lowered by a number equal to
   * half your Luck modifier."
   * @returns {number}
   */
  getCriticalThreshold() {
    return this.weapon.system.critical.diceFinal - (this.actor.system.critMod ?? 0)
  }

  /**
   * Compare this roll to each of getAttackTargets()'s tokens' Armor Class to
   * determine hits/misses, per the core rule (PDF pg. 56): "If an attack
   * roll's total is equal to or greater than your AC, you take damage." A
   * raw d20 result meeting the weapon's critical hit chance always hits
   * too, regardless of AC (PDF: "the result of the d20, without adding any
   * modifiers, is equal to or higher than the critical hit chance; the
   * attack automatically hits") - the same definition of "critical" this
   * class already uses for the Strengthened/Upgraded bonuses elsewhere.
   * @param {Roll} roll            The evaluated attack roll.
   * @param {boolean} isCritical   Whether this roll met the weapon's crit chance.
   * @returns {{token: Token, ac: number, hit: boolean}[]}
   */
  getTargetHitResults(roll, isCritical) {
    return this.getAttackTargets().map((token) => {
      const ac = token.actor?.system?.armorClass?.value ?? 10
      return { token, ac, hit: isCritical || roll.total >= ac }
    })
  }

  /**
   * Apply an already-rolled damage message's damage to each given token.
   * @param {ChatMessage} damageMessage   A 'damage'-type chat message.
   * @param {Token[]} hitTokens           Tokens to apply it to.
   */
  async applyDamageToHitTokens(damageMessage, hitTokens) {
    const damages = damageMessage?.applicationDamages
    if (!damages) return

    for (const token of hitTokens) {
      if (!token.actor) continue
      await applyDamageToActor(token.actor, damages, { multiplier: 1 })
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
      // No d20 is rolled for an autoHit weapon, so there's no threshold to
      // compare against - it's only ever a crit here if forceCritical says so.
      const isCritical = this.formDataCache.forceCritical === true

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
            isCritical,
            criticalCondition: this.weapon.system.critical.condition,
            critical: `(${this.getCombinedDamageFormula()} + ${finalCritical.formula || ''} + ${abilityBonus}) * ${finalCritical.multiplier || ''}`,
          },
        },
      })

      const autoHitDamageMessage = isCritical
        ? await message._onRollCriticalDamage()
        : await message._onRollDamage()

      // autoHit weapons always connect, so every explicitly-targeted token
      // (see getAttackTargets) counts as hit - there's no roll to compare
      // against AC. No target selected means nothing auto-applies here
      // either - a GM handles it manually via the damage card's Apply tray.
      if (game.settings.get(CONFIG.FALLOUTZERO.systemId, 'AutoApplyDamage')) {
        await this.applyDamageToHitTokens(autoHitDamageMessage, this.getAttackTargets())
      }
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

    // Whether the d20 itself met the weapon's crit threshold - this is the
    // ONLY thing that bypasses AC (per the PDF's crit-chance auto-hit rule).
    // forceCritical (Sneak Attack, a crit-granting perk, etc.) deliberately
    // does NOT feed into this: the attack still has to actually hit first,
    // it just deals critical damage once it does. Auto-hit and auto-crit
    // are separate flags - see rollsCriticalDamage below.
    const naturalCritical = roll.dice[0].total >= this.getCriticalThreshold()
    const hitResults = this.getTargetHitResults(roll, naturalCritical)
    // AC is deliberately NOT included here - players can see whether an
    // attack hit or missed, but not the enemy's actual AC value. The
    // message's stored flavor text is broadcast to every connected client
    // as-is (Foundry has no per-user field redaction), so keeping AC out of
    // this string entirely is the only way to keep it out of a player's
    // client altogether - not just visually hidden by CSS, which a player
    // could still inspect around. See flags.falloutzero.hitResults below
    // for where the AC values actually go, and
    // FalloutZeroChatMessage#_addGmOnlyAc for how a GM's client (and only a
    // GM's client) adds them back to these lines at render time.
    const hitSummary = hitResults.length
      ? `<div class="hit-results">${hitResults
          .map((r) => `<div class="hit-result-line">${r.hit ? 'Hits' : 'Misses'} ${r.token.name}</div>`)
          .join('')}</div>`
      : ''
    // Whether this roll beat at least one targeted token's AC (or scored a
    // natural crit, which auto-hits) - drives the "Attack hits with" flavor
    // wording and the red dice styling below. null with nothing targeted:
    // there's no AC to compare against, so hit/miss can't be determined and
    // both stay in their neutral/default state (matches getAttackTargets -
    // no target means a GM resolves the hit manually).
    const anyHit = hitResults.length ? hitResults.some((r) => r.hit) : null

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
    const attackMessage = await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: (this.getFlavor(this.formDataCache.targeted?.target, anyHit) || '') + hitSummary,
      rollMode: game.settings.get('core', 'rollMode'),
      'flags.falloutzero': {
        type: 'attack',
        itemId: this.weapon.id,
        tooltip: attackTooltip,
        abilityBonus,
        targeted: this.formDataCache.targeted,
        // Read by FalloutZeroChatMessage#_addHitStyling to color this roll's
        // dice red in the chat card when it beat AC - see getFlavor above
        // for the wording half of the same request.
        hit: anyHit,
        // GM-only AC values, one entry per hitResults/hit-result-line, same
        // order. Not shown to players - see the comment on hitSummary above
        // and FalloutZeroChatMessage#_addGmOnlyAc.
        hitResults: hitResults.map((r) => ({ ac: r.ac })),
        damage: {
          rolls: damageRolls,
          damageBonus,
          isCritical: naturalCritical,
          forceCritical: this.formDataCache.forceCritical === true,
          criticalCondition: this.weapon.system.critical.condition,
          critical: `(${this.getCombinedDamageFormula()} + ${finalCritical.formula || ''} + ${abilityBonus}) * ${finalCritical.multiplier || ''}`,
        },
      },
    })

    // Auto-roll and apply damage to whichever targeted tokens were hit (see
    // getTargetHitResults for the hit rule - unaffected by forceCritical,
    // only a natural crit bypasses AC). A miss for a given token just means
    // it's excluded here - the "Roll damage"/"Roll critical damage" buttons
    // on the card still work manually regardless, same as before this
    // existed.
    //
    // Whether to roll critical damage is a separate question from whether
    // it hit: a natural crit always rolls critical damage, and forceCritical
    // (Sneak Attack, a crit perk, etc.) ALSO rolls critical damage but only
    // once an actual hit already happened - it never bypasses the to-hit
    // roll itself. Matches the manual buttons in _addDamageButtons, which
    // show "Roll damage" or "Roll critical damage" as separate buttons
    // rather than one button that silently upgrades.
    const hitTokens = hitResults.filter((r) => r.hit).map((r) => r.token)
    const rollsCriticalDamage = naturalCritical || this.formDataCache.forceCritical === true
    if (hitTokens.length && game.settings.get(CONFIG.FALLOUTZERO.systemId, 'AutoApplyDamage')) {
      const damageMessage = rollsCriticalDamage
        ? await attackMessage._onRollCriticalDamage()
        : await attackMessage._onRollDamage()
      await this.applyDamageToHitTokens(damageMessage, hitTokens)
    }

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
