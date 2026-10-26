/** Extends the basic Weapon with some very simple modifications. */
export default class FalloutZeroWeapon extends Item {
  /** Augments the basic Weapon data model with additional dynamic data. */
  prepareData() {
    // Weapons can override data-preparation methods (e.g. prepareBaseData()) like actors.
    super.prepareData()
  }

  /** @override Builds roll data for dice commands run against this Weapon. */
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
