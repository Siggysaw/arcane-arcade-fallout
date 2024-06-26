import { FALLOUTZERO } from '../config.mjs'
import { onManageActiveEffect, prepareActiveEffectCategories } from '../helpers/effects.mjs'
import FalloutZeroArmor from '../data/armor.mjs'

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class FalloutZeroItemSheet extends ItemSheet {
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
      var select = document.getElementById('upgradesSelector')
      if(select.childElementCount < 3){
        select.removeChild(select.lastElementChild)
        let upgradeOptions = game.packs.find(p => p.metadata.name == "upgrades")
      if (upgradeOptions) {
        for (var upgrade of upgradeOptions.tree.entries){
          var opt = document.createElement('option')
          opt.value = upgrade.name
          opt.innerHTML = upgrade.name
          select.appendChild(opt);
        }
      }
      }
    })

    //Choose upgrade
    html.find('[name=upgradesSelector]').change(function () {
      var select = document.getElementById('upgradesSelector');
      const pack = game.packs.find(p => p.metadata.name == "upgrades");
      if (pack) {
        const myUpgrade = pack.tree.entries.find(u => u.name == select.value)
        if(myUpgrade){
          FalloutZeroArmor.prototype.getMyItem(pack, myUpgrade._id)
        } else {
          alert("Could not find a upgrade named " + select.value)
        }
      } else {
        alert("Could not find a compendium named 'upgrades'")
      }
    })

    //Add Upgrade
    html.on('click', '[addUpgradeBtn]', (ev) => {
      var select = document.getElementById('upgradesSelector');
      const pack = game.packs.find(p => p.metadata.name == "upgrades");
      if (pack) {
        const myUpgrade = pack.tree.entries.find(u => u.name == select.value)
        if(myUpgrade){
          if (this.object.system.quantity > 1 && this.object.system.upgrade1 == ''){
            FalloutZeroArmor.prototype.splitDialog(this.object, pack, myUpgrade._id)
          } else {
            FalloutZeroArmor.prototype.checkUpgrade(this.object, pack, myUpgrade._id)
          }
        } else {
          alert("Could not find a upgrade named " + select.value)
        }
      } else {
        alert("Could not find a compendium named 'upgrades'")
      }
      
    })
    //Prevent submit on pressing enter
    $(document).ready(function() {
      $(window).keydown(function(event){
        if(event.keyCode == 13) {
          event.preventDefault();
          return false;
        }
      });
    });

    html.on('click', '[deleteUpgrade]', (ev) => {
      let myId = ev.currentTarget.id.replace("delete","")
        FalloutZeroArmor.prototype.deleteWholeUpgrade (this.object,myId)
    })

    //On equip, calculate AC and other things that improve character's stats
    html.on('change','[equipItem]',() => {
      FalloutZeroArmor.prototype.changeEquipStatus(this.object, this.actor)
    })

    // Roll handlers, click handlers, etc. would go here.

    // Active Effect management
    html.on('click', '.effect-control', (ev) => onManageActiveEffect(ev, this.item))
  }
}


