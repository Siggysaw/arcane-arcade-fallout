/**
 * Extend the basic Weapon with some very simple modifications.
 * @extends {Item}
 */
export default class FalloutZeroWeapon extends Item {
  /**
   * Augment the basic Weapon data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, weapons are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData()
  }

  /**
   * Prepare a data object which defines the data schema used by dice roll commands against this Weapon
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
}
