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
    schema.itemEquipped = new fields.BooleanField({initial: false})
    schema.decay = new fields.NumberField({ initial: 10, min: 0, max: 10 })
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
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade2 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade3 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade4 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade5 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade6 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade7 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade8 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade9 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade10 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade11 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
      upgrade12 : new fields.SchemaField({
        name : new fields.StringField({initial: ``,}),
        id : new fields.StringField({initial: ``,}),
        description : new fields.StringField({initial: ``,}),
        rank : new fields.NumberField({initial: 1,}),
        img : new fields.StringField({initial: ``,})}),
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
  cost.innerHTML = `  (${myItem.system.baseCost} caps)` 
  details.innerHTML = `
    <a class="content-link" style="color:black" draggable="true" data-uuid="${myItem.uuid}"
      data-id="${myItem._id}" data-type="Item" data-pack="arcane-arcade-fallout.upgrades" data-tooltip="Click for details">
    <i class="fas fa-suitcase">
    </i>${myItem.name}
    </a>`
}

async addUpgrade(myItem,myUpgrade){
  let myData = {}
  let myValues = ['armorClass','damageThreshold','baseCost','strReq','slots','load']
  //Upgrade name and ID
  let myPath = ""
  let myValue = ""
  //If first upgrade, then set base values
  if (myItem.system.baseCost.base == 0){
    Object.assign(myData,{'system.baseCost.base' : myItem.system.baseCost.value});
    Object.assign(myData,{'system.armorClass.base' : myItem.system.armorClass.value});
    Object.assign(myData,{'system.damageThreshold.base' : myItem.system.damageThreshold.value});
    Object.assign(myData,{'system.slots.base' : myItem.system.slots.value});
    Object.assign(myData,{'system.strReq.base' : myItem.system.strReq.value});
    Object.assign(myData,{'system.baseLoad' : myItem.system.load});
    }
  //Upgrade values (Cost and load are slightly different)
  for (var val of myValues){
    if (myUpgrade.system[val] != 0){
      switch (val){
        case 'load':
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
  document.getElementById('upgradesTab').click();
}

async findUpgradeKey(armor, upgradeName){
  let keys = Object.keys(armor.system.upgrades)
  let key = 'Upgrade1';
  for (var k of keys){
    if (armor.system.upgrades[k].name == upgradeName){
      key = k
      break;
    }
  }
  return key
}

//Clicking + or - changes rank of upgrade
async changeRank(myItem,upgradeId,nextRank,removeCost){
  const pack = await game.packs.find(p => p.metadata.name == "upgrades")
  let wasEquipped = myItem.system.itemEquipped
  if(pack){
    let myUpgrade = await pack.getDocument(upgradeId);
    let key1 = await this.findUpgradeKey(myItem,myUpgrade.name)
    let newUpgradeName = myUpgrade.name.replace(myUpgrade.name.slice(-1),nextRank)
    let newUpgrade = pack.tree.entries.find(u => u.name == newUpgradeName)
    if(newUpgrade){
      newUpgrade = await pack.getDocument(newUpgrade._id);
      if (wasEquipped){await this.unequipItemStats(myItem)}
      await this.removeUpgrade(myItem,myUpgrade,removeCost,key1)
      let myData = {}
      let myKey = 'system.upgrades.' + key1 + '.id';
      Object.assign(myData, {[myKey] : newUpgrade._id});
      myKey = 'system.upgrades.' + key1 + '.name';
      Object.assign(myData, {[myKey] : newUpgrade.name});
      myKey = 'system.upgrades.' + key1 + '.img';
      Object.assign(myData, {[myKey] : newUpgrade.system.img});
      myKey = 'system.upgrades.' + key1 + '.rank';
      Object.assign(myData, {[myKey] : newUpgrade.system.rank});
      myKey = 'system.upgrades.' + key1 + '.description';
      let strippedString = newUpgrade.system.description.replace(/(<([^>]+)>)/gi, "");
      Object.assign(myData, {[myKey] : strippedString});
      myKey = 'systems.slots.value'
      Object.assign(myData, {[myKey] : myItem.system.slots.value + 1});
      await myItem.update(myData);
      await this.addUpgrade(myItem,newUpgrade);
      if (wasEquipped){await this.equipItemStats(myItem)}
    } else{
      alert('Could not find next upgrade on the list. Make sure the name of the upgrade ends with the rank number.')
    }
  } else{
    alert('Pack not found. Make sure you install the system properly.')
  }
}

async deleteWholeUpgrade (armor,myId){
  const pack = game.packs.find(p => p.metadata.name == "upgrades");
  if (pack) {
    const myUpgrade = await pack.getDocument(myId)
    let keys = Object.keys(armor.system.upgrades)
    let key = 'Upgrade1';
    let wasEquipped = armor.system.itemEquipped
    for (var k of keys){
      if (armor.system.upgrades[k].name == myUpgrade.name){
        key = k
        break;
      }
    }
    let myData = {}
    let myPath = 'system.upgrades.' + key + '.id';
    let myValue = ""
    Object.assign(myData,{[myPath]:myValue})
    myPath = 'system.updates.' + key + '.name'
    Object.assign(myData,{[myPath]:myValue})
    myPath = 'system.updates.' + key + '.img'
    Object.assign(myData,{[myPath]:myValue})
    myPath = 'system.updates.' + key + '.rank'
    Object.assign(myData,{[myPath]:0})
    myPath = 'system.updates.' + key + '.description'
    Object.assign(myData,{[myPath]:myValue})
    if (wasEquipped){await this.unequipItemStats(armor)}
    await armor.update(myData)
    await this.removeUpgrade(armor,myUpgrade,true,key,true)
    if (wasEquipped){await this.equipItemStats(armor)}
  } 
  else
  { 
    alert('Pack not found. Make sure you install the system properly.')
  }
  
}

async removeUpgrade(myItem,myUpgrade,removeCost,key,wholeUpgrade=false){
  let myIDs = []
  let myData = {}
  let myValues = ['armorClass','damageThreshold','baseCost','strReq','slots','load']
  //Upgrade name and ID
  let myPath = 'system.updates.' + key + '.name'
  let myValue = ""
  Object.assign(myData,{[myPath]:myValue})
  myPath = 'system.updates.' + key + '.id'
  Object.assign(myData,{[myPath]:myValue})
  myPath = 'system.updates.' + key + '.img'
  Object.assign(myData,{[myPath]:myValue})
  myPath = 'system.updates.' + key + '.rank'
  Object.assign(myData,{[myPath]:0})
  myPath = 'system.updates.' + key + '.description'
  Object.assign(myData,{[myPath]:myValue})
  await myItem.update(myData)
  //Upgrade values (Cost and load are slightly different)
  for (var val of myValues){
    if (myUpgrade.system[val] != 0){
      switch (val){
        case 'baseCost':
          if (removeCost) {
            myPath = `system.${val}.value`
            if(typeof Number(myUpgrade.name.slice(-1)) === 'number' && wholeUpgrade){
              myValue = Math.max(myItem.system.baseCost.base, Number(myItem.system.baseCost.value) - (Number(myUpgrade.name.slice(-1)) * Number(myUpgrade.system.baseCost)))
            }
            else {
              myValue = Math.max(myItem.system.baseCost.base, Number(myItem.system.baseCost.value) - (2 * Number(myUpgrade.system.baseCost)))
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
  await myItem.update(myData)
  //Active Effects
  for (var e of myItem.effects._source){
    if (e.origin.replace("Item.","") == myUpgrade._id){
      myIDs.push(e._id)
    }
  }
  await myItem.deleteEmbeddedDocuments('ActiveEffect',myIDs);
}



async checkUpgrade(armor,pack, id){
  let myUpgrade = await pack.getDocument(id);
  let preReq = pack.find(u => u.name == myUpgrade.system.requirement)
  let myKey,comment
  let myData = {}
  let wasEquipped = armor.system.itemEquipped
  console.log(wasEquipped)
  let oldUpgrade = myUpgrade
  let valid = false;
  if (myUpgrade.system.requirement == "None") {
    if (armor.system.slots.value >0){
      valid = true
    } else {comment ='You do not have any slots left for this upgrade.'}
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
    } else {comment = 'You do not meet the pre-requesite for this upgrade.'}
  }
  if (valid){
    for (var key of Object.keys(armor.system.upgrades)){
      if (armor.system.upgrades[key].id == "" || armor.system.upgrades[key].name == oldUpgrade.name){
        //unequip
        if (wasEquipped){await this.unequipItemStats(armor)}

        //Remove upgrades if needed
        if (oldUpgrade.name != myUpgrade.name){
          await this.removeUpgrade(armor,oldUpgrade,false,key)
        }
        //add upgrade
        await this.addUpgrade(armor,myUpgrade);

        //equip
        if (wasEquipped){await this.equipItemStats(armor)}
        myKey = 'system.upgrades.' + key + '.id';
        Object.assign(myData, {[myKey] : myUpgrade._id});
        myKey = 'system.upgrades.' + key + '.name';
        Object.assign(myData, {[myKey] : myUpgrade.name});
        myKey = 'system.upgrades.' + key + '.img';
        Object.assign(myData, {[myKey] : myUpgrade.system.img});
        myKey = 'system.upgrades.' + key + '.rank';
        Object.assign(myData, {[myKey] : myUpgrade.system.rank});
        myKey = 'system.upgrades.' + key + '.description';
        let strippedString = myUpgrade.system.description.replace(/(<([^>]+)>)/gi, "");
        Object.assign(myData, {[myKey] : strippedString});
        await armor.update(myData);
        break;
      }
    }
  } else {
    if (!comment) { comment = 'You do not meet some requirements for this upgrade.'}
    alert(comment)
  }
}
  
async seeUpgrade (id){
  const pack = game.packs.find(p => p.metadata.name == "upgrades");
  if (pack){
    const upgrade = await pack.getDocument(id)
    upgrade.sheet.render(true)
  }
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
    console.log(everyMod)
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
    let AC = Math.max(myItem.parent.system.armorClass.min, 10) //by default will be 10, but we'll need that to be BASE in case there are other modifiers
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
        let otherArmor = myItem.parent.items.find(u => u.system.itemEquipped == true && u.type =='armor')
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
