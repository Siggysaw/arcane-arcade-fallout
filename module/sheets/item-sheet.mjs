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
      FalloutZeroItem.prototype.getMods(mySelectors, this.object)
    })

    //Save Attributes (This has to be done to prevent losing info when modifying other parts of the item sheet)
    html.on('click','[id=effectSaveBtn]', () => {
      let myData = {}
      //Save paths
      let tag = document.getElementsByClassName("pathSelector")
      let newData = FalloutZeroItem.prototype.updateCustomEffects(tag, "modifiers")
      Object.assign(myData,newData)
      //Save ModTypes
      tag = document.getElementsByClassName("modSelector")
      newData = FalloutZeroItem.prototype.updateCustomEffects(tag, "modifiers")
      Object.assign(myData,newData)
      //Save Values
      tag = document.getElementsByClassName("valueBox")
      newData = FalloutZeroItem.prototype.updateCustomEffects(tag, "modifiers")
      Object.assign(myData,newData)
      //Save Checks
      tag = document.getElementsByClassName("checkSelector")
      newData = FalloutZeroItem.prototype.updateCustomEffects(tag, "checks")
      Object.assign(myData,newData)
      //Save Checks
      tag = document.getElementsByClassName("dcBox")
      newData = FalloutZeroItem.prototype.updateCustomEffects(tag, "checks")
      Object.assign(myData,newData)
      tag = document.getElementsByClassName("condition")
      newData = FalloutZeroItem.prototype.updateCustomEffects(tag, "checks")
      Object.assign(myData,newData)
      let mySelectors = document.getElementsByClassName("pathSelector")
      let saveMessage = document.getElementById("savedMessage")
      FalloutZeroItem.prototype.checkSaveReactions(mySelectors, myData, saveMessage, this.object)
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
    html.on('click', '[data-worn]', (ev) => {
      const item = ev.currentTarget.dataset.worn
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
      if ((this.object.type == "armor" || this.object.type == "powerArmor") && this.object.parent) {
        FalloutZeroArmor.prototype.changeEquipStatus(this.object)
      }
    })

    //On worn, activate effects
    html.on('change', '[worn]', () => {
          FalloutZeroItem.prototype.toggleEffects(this.object, this.object.system.worn)
    })

    //Drag and drop items into description box creates a link to it, whether it's a compendium or someone else's inventory.
    html.on('click','[item-description]', () => {
      //try{
        if (this.object.system.description.includes("@UUID")){
        // Original link example : `@UUID[Compendium.arcane-arcade-fallout.junk.Item.n7OMTyzznsUINuMi]{Adjustable Wrench}`
        let UUID = ""
        let ID = ""
        let descStr = this.object.system.description
        let itemName = descStr.match(/\{(.*?)\}/);
        let item_name = itemName[1].split(" ").join("_")
        let matches = []
        //This catches errors where there is a space within ONE item name
        if (itemName){
          descStr = descStr.split(itemName[1]).join(item_name)
        }
        let desc = descStr.split(" ")
        for (var str of desc){
          if (str.includes("@UUID")) {
            matches = str.match(/\[(.*?)\]/);
            if (matches) {
                UUID = matches[1];
                ID = UUID.split(".");
                let newLink = `<a class="content-link" 
                draggable="true" data-link="" 
                data-uuid="${UUID}" 
                data-id="${ID[ID.length -1]}" 
                data-type="Item" 
                data-pack="arcane-arcade-fallout.conditions" 
                data-tooltip="Click for details."
                >
                ${itemName[1]}
                </a>`;
                descStr = this.object.system.description.split(`@UUID[${UUID}]{${itemName[1]}}`).join(newLink);
                if (UUID.includes("conditions")){
                  FalloutZeroItem.prototype.getReactions(ID[ID.length -1], this.object)
                }
                this.object.update({'system.description' : descStr});
                return;
            }
          }
        }
      }
    //}
      //catch{}
    })

    //Change crafting materials quantity (up!)
    html.on('click', '[data-mat-add]', (ev) => {
      let matQty = ev.currentTarget.dataset.mat
      let myMat = matQty.split('.')
      let myItem = this.item
      let qty = (myItem.system.crafting[myMat[2]].qty += 1)
      this.item.update({ [matQty]: qty })
    })

    //Change crafting materials quantity (down!)
    html.on('click', '[data-mat-subtract]', (ev) => {
      let matQty = ev.currentTarget.dataset.mat
      let myMat = matQty.split('.')
      let myItem = this.item
      let qty = (myItem.system.crafting[myMat[2]].qty -= 1)
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
      console.log(index)

      this.item.update({
        ['system.damages']: this.item.system.damages,
      })
    })
  }
}
