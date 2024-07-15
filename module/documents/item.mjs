import AttackRoll from '../dice/attack-roll.mjs'
import FalloutZeroArmor from '../data/armor.mjs'
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

//Get list of upgrades for item  type
async getUpgradeList (tag){
  let select = document.getElementById('upgradesSelector')
  let upgrade, opt
  if (select.childElementCount < 3) {
    select.removeChild(select.lastElementChild)
    console.log(tag.getAttribute('data-itemType'))
    const upgradeOptions = game.packs.find((p) => p.metadata.name == 'upgrades')
    if (upgradeOptions) {
      for (var packItem of upgradeOptions.tree.entries) {
        upgrade = await upgradeOptions.getDocument(packItem._id)
        if (upgrade.system.upgradeType == tag.getAttribute('data-itemType')){
          opt = document.createElement('option')
          opt.value = upgrade.name
          opt.innerHTML = upgrade.name
          select.appendChild(opt)
        }
      }
    }
  }
}

//Get full item from compendium
async getMyItem (pack, id, myItem){
  var cost = document.getElementById('upgradeCost');
  var details = document.getElementById('upgradeDetails');
  let myUpgrade = await pack.getDocument(id);
  let newCost
  if (typeof myUpgrade.system.baseCost == "string"){
    //console.log(myItem)
    newCost = await this.calcUpgradeCost(myUpgrade,myItem)
    if(myItem.type=="rangedWeapon"){
      cost.innerHTML = `  (${newCost} &#13;&#10; caps)` 
    } else {
      cost.innerHTML = `  (${newCost} caps)` 
    }
  } else { 
    cost.innerHTML = `  (${myUpgrade.system.baseCost} caps)` 
  }
  
  details.innerHTML = `
    <a class="content-link" style="color:black" draggable="true" data-link data-uuid="${myUpgrade.uuid}"
      data-id="${myUpgrade._id}" data-type="Item" data-pack="arcane-arcade-fallout.upgrades" data-tooltip="Click for details">
    <i class="fas fa-suitcase">
    </i>${myUpgrade.name}
    </a>`
}

async checkUpgradeType (myItem,pack, id){
  let myUpgrade = await pack.getDocument(id);
  if (myUpgrade.system.upgradeType == "armor" || myUpgrade.system.upgradeType == "powerArmor"){
    FalloutZeroArmor.prototype.checkUpgrade(myItem, pack, id)
  } else {
    this.checkUpgrade(myItem, pack, id)
  }
}

async calcUpgradeCost (myUpgrade, myItem){
  if (myUpgrade.system.baseCost.includes("%")){
    let percentage = myUpgrade.system.baseCost.split("%")
    if (myItem.system.baseCost == 0){
      return Math.floor(Number(percentage[0])*0.01*Number(myItem.system.cost),2)
    } else {
      return Math.floor(Number(percentage[0])*0.01*Number(myItem.system.baseCost),2)
    }
  } else {
    return Number(myUpgrade.system.baseCost.split("c").join(""))
  }
}

//Check for upgrades for ranged and melee weapons  (armors are handled in armor.mjs because they are more complex)
async checkUpgrade(weapon,pack, id){
  let myUpgrade = await pack.getDocument(id);
  let myKey,comment
  let myData = {}
  let wasEquipped = weapon.system.itemEquipped
  let valid = false;
  let newSlots = weapon.system.slots + myUpgrade.system.slots
  let newCost = weapon.system.cost + await this.calcUpgradeCost(myUpgrade,weapon)
  if (newSlots > -1){
    valid = true
  } else {comment ='You do not have any slots left for this upgrade.'}
  if (valid){
    for (var key of Object.keys(weapon.system.upgrades)){
      if (weapon.system.upgrades[key].id == ""){
        //unequip
        if (wasEquipped){await this.toggleEffects(weapon,true)}

        //add upgrade SCRIPT to be added when automated <----
        //await this.addUpgrade(weapon,myUpgrade);
        await weapon.createEmbeddedDocuments('ActiveEffect',myUpgrade.effects._source);
        
        //equip
        if (wasEquipped){await this.toggleEffects(weapon,false)}
        //add upgrade to weapon
        if (weapon.system.baseCost == 0){
          console.log("Base cost of 0!")
          myKey = 'system.baseCost'
          Object.assign(myData, {[myKey] : Number(weapon.system.cost)});
        }
        myKey = 'system.cost'
        Object.assign(myData, {[myKey] : newCost});
        myKey = 'system.slots';
        Object.assign(myData, {[myKey] : newSlots});
        myKey = 'system.upgrades.' + key + '.id';
        Object.assign(myData, {[myKey] : myUpgrade._id});
        myKey = 'system.upgrades.' + key + '.name';
        Object.assign(myData, {[myKey] : myUpgrade.name});
        myKey = 'system.upgrades.' + key + '.img';
        Object.assign(myData, {[myKey] : myUpgrade.img});
        myKey = 'system.upgrades.' + key + '.rank';
        Object.assign(myData, {[myKey] : myUpgrade.system.slots});
        myKey = 'system.upgrades.' + key + '.description';
        let strippedString = myUpgrade.system.description.replace(/(<([^>]+)>)/gi, "");
        Object.assign(myData, {[myKey] : strippedString});
        console.log(myData)
        await weapon.update(myData);
        break;
      }
    }
    document.getElementById('upgradesTab').click();
  } else {
    if (!comment) { comment = 'You do not meet some requirements for this upgrade.'}
    alert(comment)
  }
}

async toggleEffects (myItem, equipStatus) {
  let myEffect
  let i = 0;
  if(myItem.collections.effects.contents){
    let myEffects = myItem.collections.effects.contents
    while (i < myEffects.length){
      myEffect = myItem.effects.get(myEffects[i]._id)
      myEffect.update({ disabled: equipStatus })
      i++
    }
  }
}

async deleteWholeUpgrade (weapon,myId){
  const pack = game.packs.find(p => p.metadata.name == "upgrades");
  if (pack) {
    const myUpgrade = await pack.getDocument(myId)
    let keys = Object.keys(weapon.system.upgrades)
    let key = 'Upgrade1';
    let wasEquipped = weapon.system.itemEquipped
    for (var k of keys){
      if (weapon.system.upgrades[k].name == myUpgrade.name){
        key = k
        break;
      }
    }
    let myData = {}
    let myPath = 'system.upgrades.' + key + '.id';
    let myValue = ""
    Object.assign(myData,{[myPath]:myValue})
    myPath = 'system.cost'
    let newCost = weapon.system.cost - await this.calcUpgradeCost(myUpgrade,weapon)
    Object.assign(myData, {[myPath] : newCost});
    myPath = 'system.slots';
    let newSlots = weapon.system.slots - myUpgrade.system.slots
    Object.assign(myData, {[myPath] : newSlots});
    myPath = 'system.updates.' + key + '.name'
    Object.assign(myData,{[myPath]:myValue})
    myPath = 'system.updates.' + key + '.img'
    Object.assign(myData,{[myPath]:myValue})
    myPath = 'system.updates.' + key + '.rank'
    Object.assign(myData,{[myPath]:0})
    myPath = 'system.updates.' + key + '.description'
    Object.assign(myData,{[myPath]:myValue})
    //Add update stats <-- Needs automation
    if (wasEquipped){await this.toggleEffects(weapon,true)}
    await weapon.update(myData)
    //Remove update stats <-- Needs automation
    if (wasEquipped){await this.toggleEffects(weapon,false)}
  } 
  else
  { 
    alert('Pack not found. Make sure you install the system properly.')
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
