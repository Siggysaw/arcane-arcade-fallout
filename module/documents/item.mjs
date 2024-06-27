/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class FalloutZeroItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData()
  }

  //Checks char items before creating one, stops it and updates quantity if it exists and is not equipped.
  _preCreate(data, options, user){
    super._preCreate(data,options,user)
    console.log("pre_create");
    if (this.type == 'armorUpgrade' || this.type == 'weaponUpgrade'){
      console.log('This item does not belong in character sheet. Try adding it to a weapon or armor instead!')
      return false;
    }
    else{
      if(this.parent){
        let myItem = this.parent.items.find(u => u.name == this.name && u.type == this.type);
        if (this.system.itemEquipped == true || this.system.itemEquipped == false){
          console.log("equipped");
          this.system.itemEquipped = false;
          myItem = this.parent.items.find(u => u.name == this.name && u.type == this.type && u.system.itemEquipped == false);
          try {this.system.update({'itemEquipped' : false })}
          catch{console.log("Item cannot be updated in this way")}
        }
        let qty = 0;
        if (myItem){
          qty = myItem.system.quantity;
          qty ++
          myItem.update({'system.quantity' : qty });
          return false;
        }
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

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor })
    const rollMode = game.settings.get('core', 'rollMode')
    const label = `[${item.type}] ${item.name}`

    // If there's no roll data, send a chat message.
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? '',
      })
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData()

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.formula, rollData)
      // If you need to store the value first, uncomment the next line.
      // const result = await roll.evaluate();
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      })
      return roll
    }
  }
}
