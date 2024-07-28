import { onManageActiveEffect, prepareActiveEffectCategories } from '../helpers/effects.mjs'
import FalloutZeroArmor from '../data/armor.mjs'
import FalloutZeroItem from '../documents/item.mjs'
/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export default class FalloutZeroItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['falloutzero', 'sheet', 'item'],
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'description',
        },
      ],
    })
  }

  /** @override */
  get template() {
    const path = 'systems/arcane-arcade-fallout/templates/item'
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.hbs`;
    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.hbs`.
    return `${path}/item-${this.item.type}-sheet.hbs`
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData()

    // Use a safe clone of the item data for further operations.
    const itemData = context.data

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = this.item.getRollData()

    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system
    context.flags = itemData.flags

    // Prepare active effects for easier access
    context.effects = prepareActiveEffectCategories(this.item.effects)

    context.damageTypes = CONFIG.FALLOUTZERO.damageTypes
    context.conditions = CONFIG.FALLOUTZERO.conditions

    return context
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return

    //Add upgrades options
    html.find('[name=upgradesSelector]').click(function () {
      FalloutZeroItem.prototype.getUpgradeList(this)
    })

    html.on('click','[id=customEffectsNav]', () => {
      var mySelectors = document.getElementsByClassName("pathSelector")
        for (var select of mySelectors){
          let num = select.getAttribute("name").slice(-1)
          FalloutZeroItem.prototype.listModPaths(select)
          select.value = this.object.system.modifiers[`path${num}`]
        }
    })

    //Save Attributes (This has to be done to prevent losing info when modifying other parts of the item sheet)
    html.on('click','[id=effectSaveBtn]', () => {
      let myData = {}
      //Save paths
      let tag = document.getElementsByClassName("pathSelector")
      let newData = FalloutZeroItem.prototype.updateCustomEffects(tag)
      Object.assign(myData,newData)
      //Save ModTypes
      tag = document.getElementsByClassName("modSelector")
      newData = FalloutZeroItem.prototype.updateCustomEffects(tag)
      Object.assign(myData,newData)
      //Save Values
      tag = document.getElementsByClassName("valueBox")
      newData = FalloutZeroItem.prototype.updateCustomEffects(tag)
      Object.assign(myData,newData)
      let saveMessage = document.getElementById("savedMessage")
      if (this.object.update(myData)){
        console.log("SAVED")
        saveMessage.innerHTML = "Attributes saved successfully."
      } else {
        console.log("COULD NOT SAVE")
        saveMessage.innerHTML = "Could NOT save. Please check values again."
      }
    })

    //Choose upgrade
    html.on('change','[name=upgradesSelector]', (ev) => {
      var select = document.getElementById('upgradesSelector')
      const pack = game.packs.find((p) => p.metadata.name == 'upgrades')
      if (pack) {
        const myUpgrade = pack.tree.entries.find((u) => u.name == select.value)
        if (myUpgrade) {
          FalloutZeroItem.prototype.getMyItem(pack, myUpgrade._id, this.object)
        } else {
          alert('Could not find a upgrade named ' + select.value)
        }
      } else {
        alert("Could not find a compendium named 'upgrades'")
      }
    })

    //Increase upgrade rank
    html.on('click', '[upgradeRank]', (ev) => {
      let currentRank = ev.currentTarget.getAttribute('name')
      let upgradeID = ev.currentTarget.id
      if (Number(currentRank) < 3) {
        FalloutZeroArmor.prototype.changeRank(
          this.object,
          upgradeID,
          Number(currentRank) + 1,
          false,
        )
      } else {
        alert('Upgrade ranks end at 3.')
      }
    })

    //Decrease upgrade rank
    html.on('click', '[downgradeRank]', (ev) => {
      let currentRank = ev.currentTarget.getAttribute('name')
      let upgradeID = ev.currentTarget.id
      if (Number(currentRank) > 1) {
        FalloutZeroArmor.prototype.changeRank(this.object, upgradeID, Number(currentRank) - 1, true)
      } else {
        FalloutZeroArmor.prototype.deleteWholeUpgrade(this.object, upgradeID)
      }
    })

    //Add Upgrade
    html.on('click', '[addUpgradeBtn]', (ev) => {
      var select = document.getElementById('upgradesSelector')
      const pack = game.packs.find((p) => p.metadata.name == 'upgrades')
      if (pack) {
        const myUpgrade = pack.tree.entries.find((u) => u.name == select.value)
        if (myUpgrade) {
          if (this.object.system.quantity > 1 && this.object.system.baseCost.base == 0) {
            FalloutZeroArmor.prototype.splitDialog(this.object, pack, myUpgrade._id)
          } else {
              FalloutZeroItem.prototype.checkUpgradeType(this.object, pack, myUpgrade._id)
          }
        } 
        else {
          alert('Could not find a upgrade named ' + select.value)
        }
    } else {
      alert("Could not find a compendium named 'upgrades'")
    }
    })
    //Prevent submit on pressing enter
    $(document).ready(function () {
      $(window).keydown(function (event) {
        if (event.keyCode == 13) {
          event.preventDefault()
          return false
        }
      })
    })
    //show rule information
    html.on('click', '[data-condition]', (ev) => {
      const condition = ev.currentTarget.dataset.condition
      this.actor.ruleinfo(condition)
    })
    //show rule information
    html.on('click', '[data-trade]', (ev) => {
      const item = ev.currentTarget.dataset.trade
      this.actor.trade(item)
    })
    //Remove upgrade button
    html.on('click', '[deleteUpgrade]', (ev) => {
      let myId = ev.currentTarget.id.replace('delete', '')
      if (this.object.type == 'armor' || this.object.type == 'powerArmor') {
        FalloutZeroArmor.prototype.deleteWholeUpgrade(this.object, myId)
      } else {
        FalloutZeroItem.prototype.deleteWholeUpgrade(this.object, myId)
      }
    })

    //Click to see Upgrade from compendium
    html.on('click', '[seeUpgrade]', (ev) => {
      let myId = ev.currentTarget.id
      FalloutZeroArmor.prototype.seeUpgrade(myId)
    })

    //On equip, calculate AC and other things that improve character's stats
    html.on('change', '[equipItem]', () => {
      if ((item.type == "armor" || item.type == "powerArmor") && item.parent){
        FalloutZeroItem.prototype.changeEquipStatus(this.object)
      } else {
        if (item.name != "Bag, Backpack" && 
            item.name != "Bag, Camping Backpack" &&
            item.name != "Bandolier" &&
            item.name != "Hazmat Suit" &&
            item.name != "Hazmat Suit, Powered"
          ) {
          FalloutZeroItem.prototype.toggleEffects(this.object,this.object.system.itemEquipped)
        }
      }
    })

    //Change crafting materials quantity (up!)
    html.on('click', '[data-mat-add]', (ev) => {
      let matQty = ev.currentTarget.dataset.mat
      let myMat = matQty.split('.')
      let myItem = this.item
      let qty = (myItem.system[myMat[1]].qty += 1)
      this.item.update({ [matQty]: qty })
    })

    //Change crafting materials quantity (down!)
    html.on('click', '[data-mat-subtract]', (ev) => {
      let matQty = ev.currentTarget.dataset.mat
      let myMat = matQty.split('.')
      let myItem = this.item
      let qty = (myItem.system[myMat[1]].qty -= 1)
      this.item.update({ [matQty]: qty })
    })

    // Roll handlers, click handlers, etc. would go here.

    // Active Effect management
    html.on('click', '.effect-control', (ev) => onManageActiveEffect(ev, this.item))

    // Weapon listeners
    this.initWeaponListeners(html)
  }

  initWeaponListeners(html) {
    // Add Damage
    html.on('click', '[data-add-damage]', () => {
      this.item.system.damages.push({
        type: null,
        altType: null,
        formula: '',
      })
      this.item.update({
        ['system.damages']: this.item.system.damages,
      })
    })
    // Remove Damage
    html.on('click', '[data-remove-damage]', (ev) => {
      const index = ev.currentTarget.dataset.removeDamage
      if (!index) return

      this.item.system.damages.splice(index, 1)

      this.item.update({
        ['system.damages']: this.item.system.damages,
      })
    })
  }
}
