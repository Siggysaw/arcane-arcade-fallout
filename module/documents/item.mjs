import AttackRoll from '../dice/attack-roll.mjs'
/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */

const nonStackableTypes = [
  'armorUpgrade',
]
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
    if (nonStackableTypes.includes(data.type)) {
      return
    }

    if (this.parent) {
      let myItem
      if (this.system.itemEquipped == true || this.system.itemEquipped == false) {
        if (this.system.upgrades) {
          myItem = this.parent.items.find(
            (u) =>
              u.name == this.name &&
              u.type == this.type &&
              u.system.itemEquipped == false &&
              u.system.decay == 10 &&
              u.system.upgrades.upgrade1.id == '',
          )
        } else {
          myItem = this.parent.items.find(
            (u) => u.name == this.name && u.type == this.type && u.system.itemEquipped == false,
          )
        }
      } else {
        myItem = this.parent.items.find((u) => u.name == this.name && u.type == this.type)
      }
      let qty = 0
      if (myItem) {
        qty = Number(myItem.system.quantity) + Number(data.system.quantity)
        myItem.update({ 'system.quantity': qty })
        return false
      } else {
        if (this.system.itemEquipped == true) {
          data.system.itemEquipped = false
        }
      }
    }
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData()
    if (this.type == "powerArmor") {
      this.system.cost = this.system.baseCost.value
    }
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

  getAbilityBonus() {
    return this.actor.system.abilities[this.system.abilityMod].mod ?? 0
  }

  getDecayValue() {
    return (this.system.decay - 10) * -1
  }

  applyAmmoCost() {
    if (this.system.ammo.capacity.value < 1) {
      ui.notifications.warn(`Weapon ammo is empty, need to reload`)
      return false
    }

    // Update ammo quantity
    const newWeaponAmmoCapacity = Number(this.system.ammo.capacity.value - 1)
    this.actor.updateEmbeddedDocuments('Item', [
      {
        _id: this._id,
        'system.ammo.capacity.value': newWeaponAmmoCapacity,
      },
    ])
    return true
  }

  async rollAttack({ advantageMode }) {
    const roll = await new AttackRoll(this.actor, this, { advantageMode }, () => { })
    roll.render(true)
  }
}
