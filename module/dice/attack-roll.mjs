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

    const closeButton = html.querySelector('[data-close]')
    closeButton?.addEventListener('click', this.close())
  }

  getTargetedApCost(target) {
    switch (target) {
      case 'eyes':
        return 5
      case 'head':
        return 4
      case 'arm':
        return 3
      case 'torso':
        return 2
      case 'groin':
        return 3
      case 'leg':
        return 2
      case 'carried':
        return 3
      default:
        return 0
    }
  }

  async _updateObject(event, formData) {
    Object.assign(this.formDataCache, formData)

    if (event.type !== 'submit') {
      this.render()
      return
    }

    /**
     * Reduce AP if applicable
     */
    if (formData.consumesAp) {
      const apCost = this.weapon.system.apCost + this.getTargetedApCost(this.formDataCache.targeted)
      const canAfford = this.actor.apCost(apCost)
      if (!canAfford) return
    }

    const { skillBonus, abilityBonus, decayPenalty, actorLuck, actorPenalties, bonus } =
      this.formDataCache

    const roll = new Roll(
      `${this.getDice()} + ${skillBonus} + ${abilityBonus} + ${actorLuck} + ${bonus || 0} - ${actorPenalties} - ${decayPenalty}`,
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

// const currentAp = this.system.actionPoints.value
// const weapon = this.items.get(weaponId)
// let apCost = weapon.system.apCost
// if (freeAttack) {
//   apCost = 0
// }
// const newAP = Number(currentAp) - Number(apCost)
// // if action would reduce AP below 0
// if (newAP < 0) {
//   ui.notifications.warn(`Not enough AP for action`)
//   return
// }

// if (weapon.system.consumesAmmo) {
//   // if weapon ammo capacity is 0
//   if (weapon.system.ammo.capacity.value < 1) {
//     ui.notifications.warn(`Weapon ammo is empty, need to reload`)
//     return
//   }
//   // Update ammo quantity
//   const ammoType = weapon.system.ammo.type
//   const foundAmmo = this.items.find((item) => item.name === ammoType)
//   if (foundAmmo) {
//     const newWeaponAmmoCapacity = Number(weapon.system.ammo.capacity.value - 1)
//     this.updateEmbeddedDocuments('Item', [
//       {
//         _id: weapon._id,
//         'system.ammo.capacity.value': newWeaponAmmoCapacity,
//       },
//     ])
//   }
// }

// // update actor AP
// this.update({ 'system.actionPoints.value': Number(newAP) })
