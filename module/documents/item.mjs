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
}
