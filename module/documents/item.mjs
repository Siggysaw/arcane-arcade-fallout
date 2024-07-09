import AttackRoll from '../dice/attack-roll.mjs'

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export default class FalloutZeroItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData()
  }

  //Checks char items before creating one, stops it and updates quantity if it exists and is not equipped.
  _preCreate(data, options, user) {
    super._preCreate(data, options, user)
    if (this.parent) {
      let myItem = this.parent.items.find((u) => u.name == this.name && u.type == this.type)
      if (this.system.itemEquipped == true || this.system.itemEquipped == false) {
        this.system.itemEquipped = false
        myItem = this.parent.items.find(
          (u) => u.name == this.name && u.type == this.type && u.system.itemEquipped == false,
        )
        try {
          this.system.update({ itemEquipped: false })
        } catch {
          console.log('Item cannot be updated in this way')
        }
      }
      let qty = 0
      if (myItem) {
        qty = myItem.system.quantity
        qty++
        myItem.update({ 'system.quantity': qty })
        return false
      }
    }
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData()
  }

  /**
   * Prepare a data object which defines the data schema used by dice roll commands against this Item
   * @override
   */
  getRollData() {
    // Starts off by populating the roll data with `this.system`
    const rollData = { ...super.getRollData() }

    // Quit early if there's no parent actor
    if (!this.actor) return rollData

    // If present, add the actor's roll data
    rollData.actor = this.actor.getRollData()

    return rollData
  }

  getSkillBonus() {
    if (this.actor.type === 'character') {
      return (
        this.actor.system.skills[this.system.skillBonus].base +
        this.actor.system.skills[this.system.skillBonus].modifiers
      )
    } else {
      return this.actor.system.skills[this.system.skillBonus].value
    }
  }

  getAbilityBonus() {
    return this.actor.system.abilities[this.system.abilityMod].mod ?? 0
  }

  getDecayValue() {
    return (this.system.decay - 10) * -1
  }

  getActorLuck() {
    return this.actor.system.luckmod
  }

  getActorPenalties() {
    return this.actor.system.penaltyTotal
  }

  getWeaponRollFormula() {
    let skillBonusValue = this.getSkillBonus(this.system.skillBonus)
    const abilityMod = this.getAbilityBonus(this.system.abilityMod)

    const decayValue = this.getDecayValue()
    return `${skillBonusValue} + ${abilityMod} - ${this.getActorPenalties()} - ${decayValue} + ${this.getActorLuck()}`
  }

  async rollAttack({ advantageMode }) {
    const roll = await new AttackRoll(this.actor, this, { advantageMode }, () => {})
    await roll.render(true)
  }
}
