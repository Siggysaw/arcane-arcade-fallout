import { FalloutZeroItemBase,FalloutZeroItem } from './_module.mjs'

export default class FalloutZeroArmor extends FalloutZeroItemBase {
  static defineSchema() {
    const fields = foundry.data.fields
    const schema = super.defineSchema()
    schema.baseCost = new fields.SchemaField({
      value: new fields.NumberField({
        initial: 0,
      }),
      base: new fields.NumberField({
        initial: 0,
      }),
    })
    schema.img = new fields.StringField({
      initial: 'systems/arcane-arcade-fallout/assets/vaultboy/ranged-weapon-icon.webp',
    })
    schema.armorClass = new fields.SchemaField({
      value: new fields.NumberField({
        initial: 0,
      }),
      base: new fields.NumberField({
        initial: 0,
      }),
    })

    schema.damageThreshold = new fields.SchemaField({
      value: new fields.NumberField({
        initial: 0,
      }),
      base: new fields.NumberField({
        initial: 0,
      }),
    })
    schema.slots = new fields.SchemaField({
      value: new fields.NumberField({
        initial: 0,
      }),
      base: new fields.NumberField({
        initial: 0,
      }),
    })
    schema.strReq = new fields.SchemaField({
      value: new fields.NumberField({
        initial: 0,
      }),
      base: new fields.NumberField({
        initial: 0,
      }),
    })	
    schema.load = new fields.NumberField({ initial:0, min:0}),
    schema.baseLoad = new fields.NumberField({ initial:0, min:0}),
    schema.upgrades = new fields.SchemaField({
      upgrade1 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,})}),
      upgrade2 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,})}),
      upgrade3 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,})}),
      upgrade4 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,})}),
      upgrade5 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,})}),
      upgrade6 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,})}),
      upgrade7 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,})}),
      upgrade8 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,})}),
      upgrade9 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,})}),
      upgrade10 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,})}),
      upgrade11 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,})}),
      upgrade12 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,})})
    })
    return schema
  }

  prepareDerivedData() {    
  }


//Get full item from compendium
async getMyItem (pack, id){
  var cost = document.getElementById('upgradeCost');
  var details = document.getElementById('upgradeDetails');
  let myItem = await pack.getDocument(id);
  cost.innerHTML = myItem.system.baseCost
  details.innerHTML = `<a class="content-link" style="color:black" draggable="true" data-uuid="${myItem.uuid}"
  data-id="${myItem._id}" data-type="Item" data-pack="arcane-arcade-fallout.upgrades" data-tooltip="Click for details">
    <i class="fas fa-suitcase">
    </i>${myItem.name}
  </a>
  <a class="item-control upgrade-delete" deleteUpgrade title="Delete Upgrade" id="delete${myItem.name}>
    <i class="fas fa-trash"></i>
  </a>`
}

async addUpgrade(myItem,myUpgrade){
  console.log(myItem)
  let myData = {}
  let myValues = ['armorClass','damageThreshold','baseCost','strReq','slots','load']
  //Upgrade name and ID
  let myPath = ""
  let myValue = ""
  //Upgrade values (Cost and load are slightly different)
  for (var val of myValues){
    if (myUpgrade.system[val] != 0){
      switch (val){
        case 'load':
          console.log(Number(myItem.system[val]))
          console.log(Number(myUpgrade.system[val]))
          if (myUpgrade.name.slice(0,-1) == 1 && myItem.system.baseLoad == 0) {
            //Assign Base Load if not already set.
            myPath = 'system.baseLoad'
            myValue = myItem.system[val]
            Object.assign(myData,{[myPath] : myValue})
          }
          myPath = `system.${val}`
          myValue = Math.max(3,Number(myItem.system[val]) + Number(myUpgrade.system[val])) //Min of 3 as per Light 2 
        break;
        default:
          myPath = `system.${val}.value`
          myValue = Number(myItem.system[val].value) + Number(myUpgrade.system[val])
          break;
      }
      Object.assign(myData,{[myPath] : myValue})
    }
  }
  //Update values of item
  await myItem.update(myData)
  //Active Effects
  await myItem.createEmbeddedDocuments('ActiveEffect',myUpgrade.effects._source);
}

async deleteWholeUpgrade (armor,myId){
  const pack = game.packs.find(p => p.metadata.name == "upgrades");
  if (pack) {
    const myUpgrade = await pack.getDocument(myId)
    let keys = Object.keys(armor.system.upgrades)
    let key = 'Upgrade1';
    for (var k of keys){
      if (armor.system.upgrades[k].name == myUpgrade.name){
        key = k
        break;
      }
    }
    let myData = {}
    let myKey = 'system.upgrades.' + key + '.id';
    Object.assign(myData, {[myKey] : ""})
    myKey = 'system.upgrades.' + key + '.name';
    Object.assign(myData, {[myKey] : ""})
    await armor.update(myData)
    await this.removeUpgrade(armor,myUpgrade,true,key)
  } 
  else
  { 
    alert('Pack not found. Make sure you install the system properly.')
  }
  
}

async removeUpgrade(myItem,myUpgrade,removeCost,key){
  let myIDs = []
  let myData = {}
  let myValues = ['armorClass','damageThreshold','baseCost','strReq','slots','load']
  //Upgrade name and ID
  let myPath = 'system.updates.' + key + '.name'
  let myValue = "0"
  Object.assign(myData,{[myPath]:myValue})
  myPath = 'system.updates.' + key + '.id'
  Object.assign(myData,{[myPath]:myValue})
  await myItem.update(myData)
  //Upgrade values (Cost and load are slightly different)
  for (var val of myValues){
    if (myUpgrade.system[val] != 0){
      switch (val){
        case 'baseCost':
          if (removeCost) {
            myPath = `system.${val}.value`
            if(typeof Number(myUpgrade.name.slice(-1)) === 'number'){
              console.log('multiplied')
              myValue = Number(myItem.system.baseCost.value) - (Number(myUpgrade.name.slice(-1)) * Number(myUpgrade.system.baseCost))
            }
            else {
              console.log('not multiplied')
              myValue = Number(myItem.system.baseCost.value) - myUpgrade.system.baseCost
            }
          }
          break;
        case 'load':
          myPath = `system.${val}`
          myValue = myItem.system['baseLoad']
          break;
        default:
          myPath = `system.${val}.value`
          myValue = Number(myItem.system[val].value) - Number(myUpgrade.system[val])
          break;
      }
    }
    Object.assign(myData,{[myPath]:myValue})
  }
  //Update values of item
  console.log(myData)
  await myItem.update(myData)
  //Active Effects
  for (var e of myItem.effects._source){
    console.log(e.origin.replace("Item.",""))
    if (e.origin.replace("Item.","") == myUpgrade._id){
      myIDs.push(e._id)
    }
  }
  await myItem.deleteEmbeddedDocuments('ActiveEffect',myIDs);
}



async checkUpgrade(armor,pack, id){
  let myUpgrade = await pack.getDocument(id);
  let preReq = pack.find(u => u.name == myUpgrade.system.requirement)
  let myKey, newItem
  let myData = {}
  let wasEquipped = armor.isEquipped
  let oldUpgrade = myUpgrade
  let valid = false;
  if (myUpgrade.system.requirement == "None") {
    valid = true
  }
  else {
    if (preReq){
      for (var key of Object.keys(armor.system.upgrades)){
        if (armor.system.upgrades[key].id == preReq._id){
          //get upgrade from id
          oldUpgrade = await pack.getDocument(armor.system.upgrades[key].id); 
          valid = true
        }
      }
    }
  }
  if (valid){
    for (var key of Object.keys(armor.system.upgrades)){
      if (armor.system.upgrades[key].id == "" || armor.system.upgrades[key].name == oldUpgrade.name){
        //unequip
        if (wasEquipped){await this.unequipItemStats(armor)}
        //add and remove upgrades
        if (oldUpgrade.name != myUpgrade.name){
          await this.removeUpgrade(armor,oldUpgrade,false,key)
          await this.addUpgrade(armor,myUpgrade);
        } else {
          await this.addUpgrade(armor,myUpgrade);
        }
        //equip
        if (wasEquipped){await this.equipItemStats(armor)}
        myKey = 'system.upgrades.' + key + '.id';
        Object.assign(myData, {[myKey] : myUpgrade._id})
        myKey = 'system.upgrades.' + key + '.name';
        Object.assign(myData, {[myKey] : myUpgrade.name})
        await armor.update(myData)
        break;
      }
    }
  } else {
    alert("You do not meet the pre-requesite for this upgrade.")
  }
}
  

//Modify upgrades on an armor (New Function, under construction!)
 async changeUpgradeInProgress(myItem, myUpgrade,newValue,oldValue){
  let slots = myItem.system.slots.value;
  let dt = myItem.system.damageThreshold.value;
  let ac = myItem.system.armorClass.value;
  let upgradeStats = FALLOUTZERO.armorUpgrades.find(u => u.name.toLowerCase() == myUpgrade)
  let newRank = upgradeStats.rank[newValue]
  let oldRank = upgradeStats.rank[oldValue]
  console.log(upgradeStats)
  let myPath, myValue = ``
  let modifiers = ['name','short','craftingDC','cost','craftingTime',
    'auto','desc','value','originalLoad','charMod']
  let updateData = {}
  Object.assign(updateData,{system : {[myUpgrade] : upgradeStats}})
  console.log(updateData);
  
  let myPaths = [
    `system.upgrades.${myUpgrade}.name`,
    `system.upgrades.${myUpgrade}.auto`,
    `system.upgrades.${myUpgrade}.desc`,
    `system.upgrades.${myUpgrade}.value`,
    `system.upgrades.${myUpgrade}.originalLoad`,
    `system.upgrades.${myUpgrade}.charMod`,
    'system.slots.value',
    'system.strReq.value',
    'system.damageThreshold.value',
    'system.slots.value',
    ]
  }

//Modify upgrades on an armor
  async changeUpgradeOld(myItem, myUpgrade,newValue,oldValue){
    let desc = `Nothing happens at Rank 0`;
    let slots = myItem.system.slots.value;
    let myPack = game.packs[0];
    let dt = myItem.system.damageThreshold.value;
    let ac = myItem.system.armorClass.value;
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
          await myItem.update({
            'system.upgrades.camouflage._id' : upgradeID, 
            'system.upgrades.camouflage.name' : 'camo',
            'system.upgrades.camouflage.auto' : auto,
            'system.upgrades.camouflage.desc' : desc, 
            'system.upgrades.camouflage.value' : newValue, 
            'system.charMod.skills.sneak.modifiers' : sneakAmount,
            'system.slots.value' : slots
          });
        } else{
          await myItem.update({
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
              if (myItem.system.upgrades.light){
                originalLoad = myItem.system.upgrades.light.originalLoad;
              } else{
                originalLoad = myItem.system.load;
              }
              load = originalLoad - 5;
              strReq = myItem.system.strReq.value - 1;
              dt -= 1;
              await myItem.update({
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
              originalLoad = myItem.system.upgrades.light.originalLoad;
              load = originalLoad - 5;
              await myItem.update({
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
              load = Math.max(myItem.system.upgrades.light.originalLoad-10,3)
              await myItem.update({
                'system.upgrades.light.value' : newValue, 
                'system.upgrades.light.desc' : desc,
                'system.upgrades.light.auto' : auto,
                'system.load' : load,
              });
            }
            else{
              await myItem.update({
                'system.upgrades.light.value' : newValue, 
                'system.upgrades.light.desc' : desc,
              });
            }
            break;
            //Light3
          case 3 :
            desc = `Load reduced by 15 (min of 3). Strength req. reduced by 1. DT reduced by 1. If you spend at least 4 AP on your turn to move, you can move an additional 10 feet.`
            await myItem.update({
              'system.upgrades.light.value' : newValue, 
              'system.upgrades.light.desc' : desc,
            });
            break;
            //Light0
          default :
            desc = 'Nothing happens at Rank 0.';
            load = myItem.system.upgrades.light.originalLoad;
            strReq = myItem.system.strReq.value + 1;
            dt += 1;
            await myItem.update({
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
            await myItem.update({
              'system.upgrades.fitted._id' : upgradeID,  
              'system.upgrades.fitted.name' : 'fit',
              'system.upgrades.fitted.auto' : auto,
              'system.upgrades.fitted.desc' : desc,
              'system.upgrades.fitted.value' : newValue, 
              'system.slots.value' : slots
            });
          } else {
            auto = `No automated effect`
            await myItem.update({
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
            await myItem.update({
              'system.upgrades.fitted.value' : newValue, 
              'system.upgrades.fitted.desc' : desc,
              'system.upgrades.fitted.auto' : auto,
              'system.charMod.stamina.modifiers' : myItem.parent.level,
            });
          } else{
            await myItem.update({
              'system.upgrades.fitted.value' : newValue, 
              'system.upgrades.fitted.desc' : desc,
            });
          }
          break;
        case 3:
          desc = `When you take damage from an area of effect, your DT is doubled. Your maximum stamina points increase by a number equal to your level. You have advantage on combat sequence rolls. If you already have advantage, you gain a +5.`
            await myItem.update({
              'system.upgrades.fitted.value' : newValue, 
              'system.upgrades.fitted.desc' : desc,
            });
          break;
        default :
          desc = 'Nothing happens at Rank 0.'
          auto = `No automated effect`
          await myItem.update({
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
        await myItem.update({
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
        await myItem.update({
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
        await myItem.update({
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
        await myItem.update({
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
        await myItem.update({
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
        await myItem.update({
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
    return myItem;
  }
 

  //Equip item upgrades (right now, it's just armor upgrades)
  async equipItemStats (myItem){
    const myActor = myItem.parent;
    let AC = myItem.system.armorClass.value;
    let DT = myItem.parent.system.damageThreshold.value + myItem.system.damageThreshold.value;
    
    const everyMod = { system :
      { 'armorClass.min' : myItem.parent.system.armorClass.value,
        'armorClass.value' : AC,
        'damageThreshold.value' : DT}
    };
    myActor.update(everyMod)
  }

  //Spits out each address that leads to values -- DEPRECATED
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
  //-- DEPRECATED
  async getValue (path,obj) {
    let myPath = path.split('.').reduce((acc, c) => acc && acc[c], obj);
    return myPath;
  }

  //Removes modifiers related to Armor
  async unequipItemStats (myItem){
    console.log(myItem)
    let AC = Math.ceil(myItem.parent.system.armorClass.min, 10) //by default will be 10, but we'll need that to be BASE in case there are other modifiers
    let DT = myItem.parent.system.damageThreshold.value - myItem.system.damageThreshold.value;
    const everyMod = { system :
      {'armorClass.value' : AC,
      'damageThreshold.value' : DT}
    };
    myItem.parent.update(everyMod);
  }


  async swapArmors (myItem,otherArmor) {
    await this.unequipItemStats(otherArmor)
    this.toggleEffects(otherArmor,true)
    otherArmor.update({'system.itemEquipped' : false})
    await this.equipItemStats(myItem)
    this.toggleEffects(myItem,false)
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

  //Get original state of weapon
  changeEquipStatus (myItem){
    if (myItem.type == "armor"){
      if (myItem.system.itemEquipped){
        this.unequipItemStats(myItem)
        this.toggleEffects(myItem,true)
      }else {
        let otherArmor = myItem.parent.items.find(u => u.system.itemEquipped == true && u.name == myItem.name)
        if (otherArmor){
          this.swapArmors(myItem,otherArmor);
        }else{
          this.equipItemStats(myItem)
          this.toggleEffects(myItem,false)
        }
      }
    }
  }

  async splitObject(myItem){
    let newItem = myItem;
    let qty = myItem.system.quantity - 1;
    let newName = myItem.name;
    if (!newName.includes("(u)")){ newName += "(u)"};
    myItem.update({'system.quantity' : 1, 'name' : newName});
    newItem.name = "(s)";
    newItem = await Item.create(newItem, { parent: myItem.parent });
    await newItem.update({'system.quantity' : qty});
  }
  
  splitDialog(myItem,myUpgrade,myId){
    let qty = myItem.quantity
    let cost = myUpgrade.baseCost
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
            await this.splitObject(myItem);
            this.checkUpgrade(myItem,myUpgrade,myId);
          },
        },
        Update: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Update all items at once',
          callback: async () => {
            myItem.update({'system.groupUpgrade' : true})
            this.checkUpgrade(myItem,myUpgrade,myId);
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
}
