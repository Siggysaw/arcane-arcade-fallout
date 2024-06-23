import { onManageActiveEffect, prepareActiveEffectCategories } from '../helpers/effects.mjs'

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
//Upgrades where no parameters needs to change
 async checkEquip(myUpgrade,newValue,oldValue){
  let equipped = false;
  
  if (this.object.system.itemEquipped){
    equipped = true;
    await this.unequipItemStats(this.object)
  }
  let myItem = await this.changeUpgrade(myUpgrade,newValue,oldValue);
  if (equipped){
    await this.equipItemStats(myItem) //Need to pass the item as an object parameter in the function! Otherwise, it takes "this" which is outdated by that point.
  }
 }

//Modify upgrades on an armor
  async changeUpgrade(myUpgrade,newValue,oldValue){
    let desc = `Nothing happens at Rank 0`;
    let slots = this.object.system.slots.value;
    let myPack = game.packs[0];
    let dt = this.object.system.damageThreshold.value;
    let ac = this.object.system.armorClass.value;
    let auto = `No automated effect`
    if (game.packs.find(u => u.metadata.label == "Upgrades")){
      myPack = game.packs.find(u => u.metadata.label == "Upgrades").tree.entries
    }
    let upgradeID;
    if (newValue == 1 && newValue>oldValue){
      slots -=1
    }
    if (newValue == 0){
      slots += 1
    }
    switch (myUpgrade) {
      case 'camouflage':
        let sneakAmount = 3*newValue
        auto = '+' + sneakAmount + " Sneak"
        switch (newValue){
          case 1 :
            desc = `You gain advantage on sneak checks relying on sight. Your passive sneak increases by 3.`
            break;
          case 2 :
            desc = `You gain advantage on sneak checks relying on sight and sound. Your passive sneak increases by 6.`
            break;
          case 3 :
            desc = `You gain advantage on sneak checks relying on sight and sound. While in dim light, you become shadowed. Your passive sneak increases by 9.`
            break;
          default :
            desc = 'Nothing happens at Rank 0.';
            auto = `No automated effect`;
            break;
        }
        if(myPack.find(u => u.name == "Camouflage" + newValue)){upgradeID=myPack.find(u => u.name == "Camouflage" + newValue)._id};
        //update Camouflage
        if (newValue>oldValue){
          await this.object.update({
            'system.upgrades.camouflage._id' : upgradeID, 
            'system.upgrades.camouflage.name' : 'camo',
            'system.upgrades.camouflage.auto' : auto,
            'system.upgrades.camouflage.desc' : desc, 
            'system.upgrades.camouflage.value' : newValue, 
            'system.charMod.skills.sneak.modifiers' : sneakAmount,
            'system.slots.value' : slots
          });
        } else{
          await this.object.update({
            'system.upgrades.camouflage.value' : newValue, 
            'system.upgrades.camouflage.desc' : desc, 
            'system.upgrades.camouflage.auto' : auto,
            'system.charMod.skills.sneak.modifiers' : sneakAmount,
            'system.slots.value' : slots
          });
        }
        break;
      case 'light':
        let originalLoad = 0;
        let load = 0;
        let strReq = 0;
        if(myPack.find(u => u.name == "Light" + newValue)){upgradeID=myPack.find(u => u.name == "Light" + newValue)._id};
        switch (newValue){
          case 1 :
            //Light1 +
            desc = `Load reduced by 5. Strength req. reduced by 1. DT reduced by 1.`
            auto = `Load-5, Str Req -1, DT-1` 
            if(newValue>oldValue){
              if (this.object.system.upgrades.light){
                originalLoad = this.object.system.upgrades.light.originalLoad;
              } else{
                originalLoad = this.object.system.load;
              }
              load = originalLoad - 5;
              strReq = this.object.system.strReq.value - 1;
              dt -= 1;
              await this.object.update({
                'system.upgrades.light._id' : upgradeID,  
                'system.upgrades.light.name' : 'light',
                'system.upgrades.light.auto' : auto,
                'system.upgrades.light.desc' : desc,
                'system.upgrades.light.value' : newValue,
                'system.upgrades.light.originalLoad' : originalLoad,
                'system.load' : load,
                'system.strReq.value' :  strReq,
                'system.damageThreshold.value' : dt,
                'system.slots.value' : slots
              });
            }
            //Light1 -
            else{
              originalLoad = this.object.system.upgrades.light.originalLoad;
              load = originalLoad - 5;
              await this.object.update({
                'system.upgrades.light.value' : newValue, 
                'system.upgrades.light.desc' : desc,
                'system.upgrades.light.auto' : auto,
                'system.load' : load,
              });
            }
            break;
            //Light2
          case 2 :
            desc = `Load reduced by 15 (min of 3). Strength req. reduced by 1. DT reduced by 1.`
            auto = `Load-15(min3), Str Req -1, DT-1` 
            if(newValue>oldValue){
              load = Math.max(this.object.system.upgrades.light.originalLoad-10,3)
              await this.object.update({
                'system.upgrades.light.value' : newValue, 
                'system.upgrades.light.desc' : desc,
                'system.upgrades.light.auto' : auto,
                'system.load' : load,
              });
            }
            else{
              await this.object.update({
                'system.upgrades.light.value' : newValue, 
                'system.upgrades.light.desc' : desc,
              });
            }
            break;
            //Light3
          case 3 :
            desc = `Load reduced by 15 (min of 3). Strength req. reduced by 1. DT reduced by 1. If you spend at least 4 AP on your turn to move, you can move an additional 10 feet.`
            await this.object.update({
              'system.upgrades.light.value' : newValue, 
              'system.upgrades.light.desc' : desc,
            });
            break;
            //Light0
          default :
            desc = 'Nothing happens at Rank 0.';
            load = this.object.system.upgrades.light.originalLoad;
            strReq = this.object.system.strReq.value + 1;
            dt += 1;
            await this.object.update({
              'system.upgrades.light.value' : newValue, 
              'system.upgrades.light.desc' : desc,
              'system.load' : load,
              'system.strReq.value' :  strReq,
              'system.damageThreshold.value' : dt,
              'system.slots.value' : slots
            });
            break;
          } 
        break;
      case 'fitted': 
        if(myPack.find(u => u.name == "Fitted" + newValue)){upgradeID=myPack.find(u => u.name == "Fitted" + newValue)._id};
        switch (newValue){
          case 1 :
          desc = `When you take damage from an area of effect, your DT is doubled.`
          if (newValue > oldValue){
            await this.object.update({
              'system.upgrades.fitted._id' : upgradeID,  
              'system.upgrades.fitted.name' : 'fit',
              'system.upgrades.fitted.auto' : auto,
              'system.upgrades.fitted.desc' : desc,
              'system.upgrades.fitted.value' : newValue, 
              'system.slots.value' : slots
            });
          } else {
            auto = `No automated effect`
            await this.object.update({
              'system.upgrades.fitted.value' : newValue, 
              'system.upgrades.fitted.desc' : desc,
              'system.upgrades.fitted.auto' : auto,
              'system.charMod.stamina.modifiers' : 0,
            });
          }
          break;
        case 2 :
          desc = `When you take damage from an area of effect, your DT is doubled. Your maximum stamina points increase by a number equal to your level.`
          auto = `+10 Max STA`
          if (newValue>oldValue){
            await this.object.update({
              'system.upgrades.fitted.value' : newValue, 
              'system.upgrades.fitted.desc' : desc,
              'system.upgrades.fitted.auto' : auto,
              'system.charMod.stamina.modifiers' : this.actor.level,
            });
          } else{
            await this.object.update({
              'system.upgrades.fitted.value' : newValue, 
              'system.upgrades.fitted.desc' : desc,
            });
          }
          break;
        case 3:
          desc = `When you take damage from an area of effect, your DT is doubled. Your maximum stamina points increase by a number equal to your level. You have advantage on combat sequence rolls. If you already have advantage, you gain a +5.`
            await this.object.update({
              'system.upgrades.fitted.value' : newValue, 
              'system.upgrades.fitted.desc' : desc,
            });
          break;
        default :
          desc = 'Nothing happens at Rank 0.'
          auto = `No automated effect`
          await this.object.update({
            'system.upgrades.fitted.value' : newValue, 
            'system.upgrades.fitted.desc' : desc,
            'system.upgrades.fitted.auto' : auto,
            'system.slots.value' : slots
          })
          break;
        }
        break;
      case 'leadlined': 
        if(myPack.find(u => u.name == "Lead Lined" + newValue)){upgradeID=myPack.find(u => u.name == "Lead Lined" + newValue)._id};
        let radDC = -2*newValue
        desc = `Radiation DC decreases by ` + radDC
        auto = `radDC -` + radDC
        await this.object.update({
          'system.upgrades.leadlined._id' : upgradeID,  
          'system.upgrades.leadlined.name' : 'lead',
          'system.upgrades.leadlined.auto' : auto,
          'system.upgrades.leadlined.desc' : desc,
          'system.upgrades.leadlined.value' : newValue, 
          'system.charMod.penalties.radDC.value' : -2*newValue,
          'system.slots.value' : slots
        });
        break;
      case 'strengthened': 
        auto = `No automated effect`
        if(myPack.find(u => u.name == "Strengthened" + newValue)){upgradeID=myPack.find(u => u.name == "Strengthened" + newValue)._id};
        switch (newValue){
          case 1 :
            desc = `When you take damage from a critical hit, your DT increases by 3`
            break;
          case 2: 
            desc = `When you take damage from a critical hit, your DT increases by 8.`
            break;
          case 3:
            desc = `When you take damage from a critical hit, your DT increases by 8. If you would gain a severe injury, you instead gain a random limb condition`
            break;
        }
        await this.object.update({
          'system.upgrades.strengthened._id' : upgradeID,  
          'system.upgrades.strengthened.name' : 'str',
          'system.upgrades.strengthened.auto' : auto,
          'system.upgrades.strengthened.desc' : desc,
          'system.upgrades.strengthened.value' : newValue, 
          'system.slots.value' : slots
        });
        break;
      case 'sturdy': 
        auto = `No automated effect`
        if(myPack.find(u => u.name == "Sturdy" + newValue)){upgradeID=myPack.find(u => u.name == "Sturdy" + newValue)._id};
        switch (newValue){
          case 1 :
            desc = `You ignore the negative effects of the first 2 levels of decay for the armor.`
            break;
          case 2: 
            desc = `You ignore the negative effects of the first 4 levels of decay for the armor. `
            break;
          case 3:
            desc = `You ignore the negative effects of the first 4 levels of decay for the armor. Your armor no longer decays from being damaged by a critical hit.`
            break;
        }
        await this.object.update({
          'system.upgrades.sturdy._id' : upgradeID,  
          'system.upgrades.sturdy.name' : 'sturd',
          'system.upgrades.sturdy.auto' : auto,
          'system.upgrades.sturdy.desc' : desc,
          'system.upgrades.sturdy.value' : newValue, 
          'system.slots.value' : slots
        });
        break;
      case 'pocketed': 
      if(myPack.find(u => u.name == "Pocketed" + newValue)){upgradeID=myPack.find(u => u.name == "Porcketed" + newValue)._id};
        let charLoad = 0;
        switch (newValue){
          case 1 :
            desc = `Your carry load is increased by 10.`
            charLoad = 10;
            auto = `carry Load Max +10`
            break;
          case 2: 
            desc = `Your carry load is increased by 25. `
            charLoad = 25;
            auto = `carry Load Max +25`
            break;
          case 3:
            desc = `Your carry load is increased by 50`
            charLoad = 50;
            auto = `carry Load Max +50`
            break;
          default:
            desc = ``
            charLoad = 0;
            auto = `No automated effect`
            break;
        }
        await this.object.update({
          'system.upgrades.pocketed._id' : upgradeID,
          'system.upgrades.pocketed.name' : 'pocket',
          'system.upgrades.pocketed.auto' : auto,
          'system.upgrades.pocketed.desc' : desc,
          'system.upgrades.pocketed.value' : newValue, 
          'system.charMod.carryLoad.max' : charLoad,
          'system.slots.value' : slots
        });
        break;      
      case 'reinforced': 
      if(myPack.find(u => u.name == "Reinforced" + newValue)){upgradeID=myPack.find(u => u.name == "Reinforced" + newValue)._id};
        switch (newValue){
          case 1 :
            desc = `+1 bonus to DT`;
            if(newValue>oldValue){dt+=1}
            else{dt-=1}
            auto = `+1 bonus to DT`;
            break;
          case 2: 
            desc = `+2 bonus to DT`;
            if(newValue>oldValue){dt+=1}
            else{dt-=2}
            auto = `+2 bonus to DT`;
            break;
          case 3:
            desc = `+4 bonus to DT`;
            dt += 2;
            auto = `+4 bonus to DT`;
            break;
          default:
            desc = ``;
            dt -= 1;
            auto = `No automated effect`;
            break;
        }
        await this.object.update({
          'system.upgrades.reinforced._id' : upgradeID,
          'system.upgrades.reinforced.name' : 'reinf',
          'system.upgrades.reinforced.auto' : auto,
          'system.upgrades.reinforced.desc' : desc,
          'system.upgrades.reinforced.value' : newValue,
          'system.damageThreshold.value' : dt,
          'system.slots.value' : slots
        });
        break;  
      case 'hardened':
        if(myPack.find(u => u.name == "Hardened" + newValue)){upgradeID=myPack.find(u => u.name == "Hardened" + newValue)._id};
        if (newValue != 0){
          desc = `+${newValue} bonus to AC`
          auto = desc
          if (newValue>oldValue){
            ac += 1
          }else {ac -= 1}
        } else {ac -= 1}
        await this.object.update({
          'system.upgrades.hardened._id' : upgradeID,
          'system.upgrades.hardened.name' : 'hard',
          'system.upgrades.hardened.auto' : auto,
          'system.upgrades.hardened.desc' : desc,
          'system.upgrades.hardened.value' : newValue, 
          'system.armorClass.value' : ac,
          'system.slots.value' : slots
        });
        break;
    }
    return this.object;
  }
 

  //Equip item upgrades (right now, it's just armor upgrades)
  async equipItemStats (myItem){
    const myActor = this.actor.system;
    let AC = myItem.system.armorClass.value;
    let DT = myItem.system.damageThreshold.value;
    
    const everyMod = { system :
      {'armorClass.value' : AC,
      'damageThreshold.value' : DT}
    };
    if(myItem.system.charMod){
      Object.assign(everyMod.system,myItem.system.charMod)
    }
    const flattenedItem = flattenObject(everyMod)
    console.log(flattenedItem)
    //const newObject = {}
    for(var path of Object.keys(flattenedItem)){
      flattenedItem[path] =  await this.getValue(path,this.actor)   + flattenedItem[path]
    }
    this.actor.update(everyMod)
    if (flattenedItem['system.penalties.radDC']){
      myActor.penalties.radDC = flattenedItem.system.penalties.radDC.value
    }
  }

  //Spits out each address that leads to values
  flattenObject(obj) {
    if (typeof obj !== 'object') {
      return [];
    }
    
    let paths = [];
    for (let key in obj) {
      let val = obj[key];
      if (typeof val === 'object') {
        let subPaths = flattenObject(val);
        subPaths.forEach(e => {
          paths.push({
            path: [key, e.path].join('.'),
            value: e.value
          });
        });
      } else {
        let path = { path: key, value: val };
        paths.push(path);
      }
    }
    return paths;
  }

  async getValue (path,obj) {
    let myPath = path.split('.').reduce((acc, c) => acc && acc[c], obj);
    return myPath;
  }

  //Removes modifiers related to Armor
  async unequipItemStats (myItem){
    let AC = myItem.system.armorClass.value; //by default will be 10, but we'll need that to be BASE in case there are other modifiers
    let DT = myItem.system.damageThreshold.value;
    const everyMod = { system :
      {'armorClass.value' : AC-10,
      'damageThreshold.value' : DT}
    };
    if(myItem.system.charMod){  
      Object.assign(everyMod.system,myItem.system.charMod)
    }
    const flattenedItem = flattenObject(everyMod)
    console.log(flattenedItem)
    //const newObject = {}
    for(var path of Object.keys(flattenedItem)){
      flattenedItem[path] =  await this.getValue(path,this.actor)-flattenedItem[path] 
    }
    this.actor.update(flattenedItem);
  }


  async swapArmors (otherArmor) {
    await this.unequipItemStats(otherArmor)
    otherArmor.update({'system.itemEquipped' : false})
    await this.equipItemStats(this.object)
  }

  //Get original state of weapon
  changeEquipStatus (myItem){
    if (myItem.type == "armor"){
      if (myItem.system.itemEquipped){
        this.unequipItemStats(myItem)
      }else {
        let otherArmor = this.actor.items.find(u => u.system.itemEquipped == true)
        if (otherArmor){
          this.swapArmors(otherArmor);
        }else{
          this.equipItemStats(myItem)
        }
      }
    }
    
  }

  async splitObject(myItem){
    let newItem = myItem;
    let qty = myItem.system.quantity - 1;
    let newName = this.object.name;
    if (!newName.includes("(u)")){ newName += "(u)"};
    this.object.update({'system.quantity' : 1, 'name' : newName});
    newItem.name = "(s)";
    newItem = await Item.create(newItem, { parent: this.actor });
    await newItem.update({'system.quantity' : qty});
  }
  
  splitDialog(myUpgrade,newValue,oldValue){
    let qty = this.object.quantity
    let cost = 300
    let fullCost = qty*cost
    let d = new Dialog({
      title: 'Split or upgrade all?',
      content: `Do you wish to upgrade all ${qty} items, or split it to upgrade only one copy?
      
      One upgrade usually costs ${cost}
      ${qty} upgrades usually costs ${fullCost}`,
      buttons: {
        Split: {
          icon: '<i class="fa-solid fa-split"></i>',
          label: 'Split',
          callback: async () => {
            await this.splitObject(this.object);
            this.checkEquip(myUpgrade,newValue,oldValue);
          },
        },
        Update: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Update all items at once',
          callback: async () => {
            this.object.update({'system.groupUpgrade' : true})
            this.checkEquip(myUpgrade,newValue,oldValue);
          },
        },
      },
      default: 'Split',
      render: () => {}
    },{
      left: 200,
      top: 200,
      width: 600,
    },)
    d.render(true)
  }
  
  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html)
    
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return


    //Decrease Upgrade Value
    html.on('click', '[data-tableSubtraction]', (ev) => {
      const myUpgrade = ev.currentTarget.id.replace("lower","").toLowerCase().replace(" ","");
      let oldValue = 0;
      //This check ensures a value is given if field doesn't exist
      if(this.object.system.upgrades[myUpgrade]){
         oldValue = this.object.system.upgrades[myUpgrade].value;
      }
      if (oldValue!=0){
        let newValue = oldValue - 1;
        if (this.object.system.groupUpgrade == true || this.object.system.quantity < 2){
          console.log(this.object.system.groupUpgrade);
          this.checkEquip(myUpgrade,newValue,oldValue);
        } else {
          this.splitDialog(myUpgrade,newValue,oldValue)
        }
      }
    })

    //Increase Upgrade Value
    html.on('click', '[data-tableAddition]', (ev) => {
      const myUpgrade = ev.currentTarget.id.replace("higher","").toLowerCase();
      let oldValue = 0;
      //This check ensures a value is given if field doesn't exist
      if(this.object.system.upgrades[myUpgrade]){
         oldValue = this.object.system.upgrades[myUpgrade].value;
      }
      if (oldValue!=3){
        let newValue = oldValue + 1;
        if(this.object.system.slots.value > 0 || newValue != 1){
          if (this.object.system.groupUpgrade == true || this.object.system.quantity < 2){
            console.log(this.object.system.groupUpgrade);
            this.checkEquip(myUpgrade,newValue,oldValue);
          } else {
            this.splitDialog(myUpgrade,newValue,oldValue)
          }
        }
      }
    })

    //On equip, calculate AC and other things that improve character's stats
    html.on('change','[equipItem]',() => {
      this.changeEquipStatus(this.object)
    })

    // Roll handlers, click handlers, etc. would go here.

    // Active Effect management
    html.on('click', '.effect-control', (ev) => onManageActiveEffect(ev, this.item))
  }
}
