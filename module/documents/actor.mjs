import { FALLOUTZERO } from '../config.mjs'
/**
/**
 * Extend the base Actor class to implement additional system-specific logic.
 * @extends {Actor}
 */

export default class FalloutZeroActor extends Actor {
  getRollData() {
    // Starts off by populating the roll data with a shallow copy of `this.system`
    const data = { ...this.system }

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v)
      }
    }
    return data
  }

  limbcondition(limb) {
    ui.notifications.notify(`${limb} was Clicked!`)
  }

  getRaceType() {
    return this.items.contents.find((c) => c.type === 'race')?.system?.type
  }

  addCap() {
    const caps = this.system.karmaCaps
    this.update({ 'system.karmaCaps': [...caps, true] })
  }

  removeCap() {
    const newCaps = this.system.karmaCaps
    if (newCaps.length === 1) return
    newCaps.splice(newCaps.length - 1, 1)
    this.update({ 'system.karmaCaps': newCaps })
  }

  //add item
  itemaddition(importeditem) {
    const item = this.items.get(importeditem)
    const updatedQty = Number(item.system.quantity) + 1
    item.update({ 'system.quantity': updatedQty })
  }

  //subtract item
  itemsubtraction(importeditem) {
    const item = this.items.get(importeditem)
    let updatedQty = Number(item.system.quantity) - 1
    if (updatedQty < 1) {
      updatedQty = 0
    }
    item.update({ 'system.quantity': updatedQty })
  }

  //add to a field
  fieldaddition(field, fieldvalue) {
    const newValue = Number(fieldvalue) + 1

    //Irradiated and Radiation Updates
    if (field === 'system.irradiated' && newValue == 10) {
      const newRads = this.system.penalties.radiation.value + 1
      this.update({ 'system.penalties.radiation.value': newRads })
      this.update({ 'system.irradiated': 0 })
      return
    }

    // Update Field Value
    this.update({ [field]: newValue })
  }

  fieldsubtraction(field, fieldvalue) {
    const newValue = Number(fieldvalue) - 1
    this.update({ [field]: newValue })
  }

  ruleinfo(condition) {
    const myDialogOptions = { width: 500, height: 300, resizable: true }
    const conditionFormatted = condition.charAt(0).toUpperCase() + condition.slice(1)
    let title = conditionFormatted.replaceAll('_', ' ')
    const rule = FALLOUTZERO.rules[conditionFormatted]
    const message = `<div class="conditioninfo">${rule}</div>`
    new Dialog(
      {
        title: `Details: ${title}`,
        content: message,
        buttons: {},
      },
      myDialogOptions,
    ).render(true)
  }

  healthupdate(operator) {
    let newHealth = ''
    if (operator === 'plus') {
      newHealth = this.system.health.value + 1
    } else {
      newHealth = this.system.health.value - 1
    }
    this.update({ 'system.health.value': newHealth })
  }

  staminaupdate(operator) {
    let newStamina = ''
    if (operator === 'plus') {
      newStamina = this.system.stamina.value + 1
    } else {
      newStamina = this.system.stamina.value - 1
    }
    this.update({ 'system.stamina.value': newStamina })
  }
  actionupdate(operator) {
    let newAction = ''
    if (operator === 'plus') {
      newAction = this.system.actionPoints.value + 1
    } else {
      newAction = this.system.actionPoints.value - 1
    }
    this.update({ 'system.actionPoints.value': newAction })
  }

  skilladdition(skill) {
    const actor = this.system
    const newSkillbase = this.system.skills[skill].base + 1
    const skillField = 'system.skills.' + skill + '.base'
    this.update({ [skillField]: newSkillbase })

    // update skillpool
    const updatedSkillpool = actor.skillPool - 1
    this.update({ 'system.skillPool': updatedSkillpool })
  }
  skillsubtraction(skill) {
    const actor = this.system
    const newSkillbase = this.system.skills[skill].base - 1
    const skillField = 'system.skills.' + skill + '.base'
    this.update({ [skillField]: newSkillbase })

    // update skillpool
    const updatedSkillpool = actor.skillPool + 1
    this.update({ 'system.skillPool': updatedSkillpool })
  }

  skillUpdated() {
    //Set Variables
    const actor = this.system
    let skillPool = actor.skillPool

    let skillMod = 0
    if (actor.abilities.int.mod > 0) {
      skillMod = 5
    }
    if (actor.abilities.int.mod == 0) {
      skillMod = 4
    }
    if (actor.abilities.int.mod < 0) {
      skillMod = 3
    }
    const updatedSkillpool = skillPool + skillMod
    this.update({ 'system.skillPool': updatedSkillpool })
  }

  levelUp() {
    // Rewards Variables
    const actor = this.system
    const myDialogOptions = { width: 500, height: 400 }
    const newXP = this.system.xp - 1000
    const newLevel = this.system.level + 1
    let rewards = `<h3>Congratulations!</h3><p> You've Leveled Up! Please look below for your rewards!</p>`

    // Update Level
    this.update({ 'system.xp': newXP })
    this.update({ 'system.level': newLevel })

    // Skill Rewards Start

    const earnedSkillpoints = this.system.skillPool
    let skillPointsMod = ''
    let updatedSkillpool = ''

    // Levels that increase skill points
    if (actor.level % 4 === 0) {
      // Skill points allotted is based on Intelligence modifier
      if (actor.abilities.int.mod > 0) {
        skillPointsMod = 5
      }
      if (actor.abilities.int.mod == 0) {
        skillPointsMod = 4
      }
      if (actor.abilities.int.mod < 0) {
        skillPointsMod = 3
      }
      // Update points available to spend
      updatedSkillpool = Number(earnedSkillpoints) + Number(skillPointsMod)
      this.update({ 'system.skillPool': updatedSkillpool })

      // Build the Rewards Screen
      rewards += `You've Earned ${skillPointsMod} Skill Points to Allocate!<br>`
    }
    // Health and Stamina Rewards Start
    if (actor.level % 2 === 0) {
      let currentHP = actor.health.max
      let currentHPvalue = actor.health.value
      let currentSP = actor.stamina.max
      let currentSPvalue = actor.stamina.value
      const endMod = actor.abilities.end.mod
      const agiMod = actor.abilities.agi.mod
      let updatedHealthvalue = currentHPvalue + endMod + 5
      let updatedStaminavalue = currentSPvalue + agiMod + 5
      let updatedHealth = currentHP + endMod + 5
      let updatedStamina = currentSP + agiMod + 5

      this.update({ 'system.health.max': updatedHealth })
      this.update({ 'system.health.value': updatedHealthvalue })
      this.update({ 'system.stamina.max': updatedStamina })
      this.update({ 'system.stamina.value': updatedStaminavalue })
      rewards += `
      <br>Health has been updated to ${updatedHealth}
      <br>Stamina has been updated to ${updatedStamina}`
    }
    if (newLevel == 5 || newLevel == 9 || newLevel == 13 || newLevel == 17 || newLevel == 19) {
    } else {
      rewards += `<br>You can take a Perk OR you can add +1 to a SPECIAL stat!`
    }
    new Dialog(
      {
        title: 'You Leveled Up!',
        content: rewards,
        buttons: {},
      },
      myDialogOptions,
    ).render(true)
  }
  expandtoggle(item) {
    let currentItem = this.items.get(item)
    let currentState = currentItem.system.itemOpen
    if (currentState === true) {
      this.updateEmbeddedDocuments('Item', [{ _id: item, 'system.itemOpen': false }])
    } else {
      this.updateEmbeddedDocuments('Item', [{ _id: item, 'system.itemOpen': true }])
    }
  }

  refillAp() {
    this.update({ 'system.actionPoints.value': this.system.actionPoints.max })
  }

  recycleAp() {
    let RecycledAP = Math.floor(this.system.actionPoints.value / 2) + this.system.actionPoints.max
    if (RecycledAP < 16) {
      this.update({ 'system.actionPoints.value': RecycledAP })
    } else {
      this.update({
        'system.actionPoints.value': 15,
      })
    }
  }
  apUsed(weaponId) {
    let currentAp
    if (this.type === 'character') {
      currentAp = this.actionPoints.value
    } else {
      currentAp = this.system.actionPoints.value
    }
    const weapon = this.items.get(weaponId)
    const apCost = weapon.system.apCost
    const newAP = Number(currentAp) - Number(apCost)

    if (newAP < 0) {
      ui.notifications.warn(`Not enough AP for action`)
      return
    }

    this.update({ 'system.actionPoints.value': Number(newAP) })
  }

  getTargetedApCost(target) {
    switch (target) {
      case 'eyes':
        return 5
      case 'head':
        return 4
      case 'arm':
        return 3
      case 'torso':
        return 2
      case 'groin':
        return 3
      case 'leg':
        return 2
      case 'object':
        return 3
    }
  }

  rollWeapon(weapon, options = { rollMode: 'normal', target: null, bonus: '' }) {
    const currentAp = this.system.actionPoints.value
    const newAP =
      Number(currentAp) -
      (options.target ? this.getTargetedApCost(options.target) : Number(weapon.system.apCost))

    // if action would reduce AP below 0
    if (newAP < 0) {
      ui.notifications.warn(`Not enough AP for action`)
      return
    }

    if (weapon.system.consumesAmmo) {
      // if weapon ammo capacity is 0
      if (weapon.system.ammo.capacity.value < 1) {
        ui.notifications.warn(`Weapon ammo is empty, need to reload`)
        return
      }
      // Update ammo quantity
      const ammoType = weapon.system.ammo.type
      const foundAmmo = this.items.find((item) => item.name === ammoType)
      if (foundAmmo) {
        const newWeaponAmmoCapacity = Number(weapon.system.ammo.capacity.value - 1)
        this.updateEmbeddedDocuments('Item', [
          {
            _id: weapon._id,
            'system.ammo.capacity.value': newWeaponAmmoCapacity,
          },
        ])
      }
    }

    // update actor AP
    this.update({ 'system.actionPoints.value': Number(newAP) })

    // roll to hit
    // let roll = new Roll(
    //   this.getWeaponRollFormula(weaponId, { rollState: options.rollState }),
    //   this.getRollData(),
    // )
    // roll.toMessage({
    //   speaker: ChatMessage.getSpeaker({ actor: this }),
    //   flavor: `BOOM! Attack with a ${weapon.name}`,
    //   rollMode: game.settings.get('core', 'rollMode'),
    // })

    // return roll
  }

  // Ammo Swap Button is Pressed
  ammoswap(weaponId) {
    const weapon = this.items.get(weaponId)
    const actor = this
    const ammoBase = weapon.system.ammo.type
    let message = "<select id='ammoselect' name=chosenammo>"
    const ammoList = FALLOUTZERO.specialammo[ammoBase]
    for (let ammo of ammoList.available) {
      let ammoFullname = `${ammoBase} ${ammo}`
      if (ammoBase === ammo) {
        ammoFullname = ammoBase
      }
      let ammoFound = this.items.find((item) => item.name === ammoFullname)

      if (ammoFound) {
        message += `<option value="${ammoFullname}">${ammoFullname}: ${ammoFound.system.quantity}</option><br>`
      }
    }
    message += '</select>'
    new Dialog({
      title: 'My Dialog Title',
      content: message,
      buttons: {
        button1: {
          label: 'Display Value',
          callback: (html) => setammo(html),
          icon: `<i class="fas fa-check"></i>`,
        },
      },
    }).render(true)

    function setammo(html) {
      const chosenAmmo = html.find('select#ammoselect').val()
      const currentType = weapon.system.ammo.assigned
      const currentItem = actor.items.find((item) => item.name === currentType)
      const currentMag = weapon.system.ammo.capacity.value
      if (currentItem) {
        const currentQty = currentItem.system.quantity + currentMag
        if (!weapon.system.energyWeapon) {
          actor.updateEmbeddedDocuments('Item', [
            { _id: currentItem._id, 'system.quantity': currentQty },
          ])
        }
      }

      actor.updateEmbeddedDocuments('Item', [{ _id: weaponId, 'system.ammo.assigned': chosenAmmo }])
      actor.updateEmbeddedDocuments('Item', [{ _id: weaponId, 'system.ammo.capacity.value': 0 }])
    }
  }

  // Reload Button is Pressed
  reload(weaponId = null) {
    // Get Weapon Information Array
    const weapon = this.items.get(weaponId)
    if (!weapon) {
      ui.notifications.warn(`Weapon ${weaponId} not found on character / Delete and Readd`)
      return
    }
    // Do you have the AP?
    const newAP = this.system.actionPoints.value - 6
    if (newAP < 0) {
      ui.notifications.warn(`Not enough action points to reload`)
      return
    }

    // Collect Required Ammo Information
    const ammoType = weapon.system.ammo.assigned
    const ammoFound = this.items.find((item) => item.name === ammoType)

    // Do you have Ammo?
    if (!ammoFound) {
      ui.notifications.warn(`You don't have any ${ammoType} to reload with! Swap Ammo!`)
      return
    }
    const ammoOwned = ammoFound.system.quantity
    if (ammoOwned === 0) {
      ui.notifications.warn(`You don't have any ${ammoType} to reload with! Swap Ammo!`)
      return
    }
    const ammoID = ammoFound._id

    // Collect Required Weapon Information
    const currentMag = weapon.system.ammo.capacity.value
    const capacity = weapon.system.ammo.capacity.max

    // Already Reloaded?
    if (currentMag == capacity) {
      ui.notifications.warn(`Weapon capacity is already at max`)
      return
    }

    // Reload The Weapon
    const ammoReloaded = capacity - currentMag
    let updatedAmmo = ammoOwned - ammoReloaded
    if (ammoReloaded > ammoOwned && !weapon.system.energyWeapon) {
      const ammoAvailable = currentMag + ammoOwned
      this.updateEmbeddedDocuments('Item', [
        { _id: weaponId, 'system.ammo.capacity.value': ammoAvailable },
      ])
    } else {
      this.updateEmbeddedDocuments('Item', [
        { _id: weaponId, 'system.ammo.capacity.value': capacity },
      ])
    }

    // Energy Weapon Reload Rules
    if (weapon.system.energyWeapon) {
      updatedAmmo = ammoOwned - 1
      this.updateEmbeddedDocuments('Item', [{ _id: ammoID, 'system.quantity': updatedAmmo }])
    } else {
      this.updateEmbeddedDocuments('Item', [{ _id: ammoID, 'system.quantity': updatedAmmo }])
    }

    // Pay the AP
    this.update({ 'system.actionPoints.value': Number(newAP) })

    // After 10 Reloads, Gain 1 Level of Decay to the Weapon
    const newReloaddecay = weapon.system.reloadDecay + 1
    if (newReloaddecay == 10) {
      const newDecay = weapon.system.decay - 1
      this.updateEmbeddedDocuments('Item', [{ _id: weaponId, 'system.decay': newDecay }])
      this.updateEmbeddedDocuments('Item', [{ _id: weaponId, 'system.reloadDecay': 0 }])
    } else {
      this.updateEmbeddedDocuments('Item', [
        { _id: weaponId, 'system.reloadDecay': newReloaddecay },
      ])
    }
  }

  //Convert junk to Materials as per item stats
  async convertJunkToMat(item, mats, qty) {
    let compendium = game.packs.find((u) => u.metadata.name == 'material')
    let matData, existingMat, newQuantity
    let material
    var i = 0
    let newItem
    // Create item or add quantity if existing
    while (i < mats.length) {
      material = mats[i][1].trim()
      matData = compendium.tree.entries.find((u) => u.name.toLowerCase() == material.toLowerCase())
      existingMat = this.items.find((u) => u.name.toLowerCase() == mats[i][1].toLowerCase())
      if (existingMat) {
        newQuantity = Number(existingMat.system.quantity) + Number(mats[i][0]) * Number(qty)
        existingMat.update({ 'system.quantity': newQuantity })
      } else {
        newItem = await Item.create(matData)
        newItem.update({ 'system.quantity': Number(mats[i][0]) * Number(qty) })
      }
      i++
    }
    //Adjust quantity or delete
    if (item.system.quantity != qty) {
      item.update({ 'system.quantity': item.system.quantity - qty })
    } else {
      item.delete()
    }
  }

  //Material conversion dialog
  checkConvert(itemID) {
    let item = this.items.find((u) => u._id == itemID)
    let initialQty = item.system.quantity
    let qtyOptions = []
    let dialogContent = ``
    let mats = []
    let qty = 1
    let itemName = this.formatCompendiumItem(
      'junk',
      item.name,
      'This will remove this item from inventory.',
    ).slice(0, -4)
    var i = 1
    if (item) {
      dialogContent = `Are you sure you want to convert ${itemName} into the following materials? <br><br>`
      while (i < Object.keys(item.system.junk).length / 2 + 1) {
        if (item.system.junk['quantity' + i] != 0) {
          dialogContent +=
            `x<b name='qty'>${item.system.junk['quantity' + i]}</b> ` +
            this.formatCompendiumItem(
              'material',
              item.system.junk['type' + i],
              'Material for Crafting',
            ) +
            `<br>`
          mats.push([item.system.junk['quantity' + i], item.system.junk['type' + i]])
        }
        i++
      }
      if (initialQty > 1) {
        i = 1
        dialogContent = dialogContent.replace('materials?', 'materials, each?')
        dialogContent += `<br> How many ${itemName} do you want to convert? <br><br>
        <select style="padding-left:20px" name="matQtyOpt" id = "matQtyOpt">`
        while (i < initialQty + 1) {
          dialogContent += `<option value='${i}'>${i}</option>`
          qtyOptions.push(i)
          i++
        }
        dialogContent += `</select><br>`
      }
      dialogContent += `<h4> This process is irreversible.</h4>`
    }
    let d = new Dialog(
      {
        title: 'Convert or not?',
        content: dialogContent,
        buttons: {
          Yes: {
            icon: '<i class="fas fa-check"></i>',
            label: 'Yes please! (consult GM)',
            callback: async () => {
              this.convertJunkToMat(item, mats, qty)
            },
          },
          No: {
            icon: '<i class="fa-solid fa-x"></i>',
            label: 'Not yet...',
            callback: async () => {},
          },
        },
        default: 'No',
        render: (html) => {
          html.find('[name=matQtyOpt]').change(function () {
            qty = this.value
          })
        },
      },
      {
        width: 500,
      },
    )
    d.render(true)
  }

  //Roll any table, check if loot is a table and start over or add loot.
  async rollMyTable(table) {
    let roll = await new Roll(table.formula.replace('5[', this.system.abilities.lck.mod + '['))
    const customResults = await table.draw({ roll })
    game.messages.contents[game.messages.contents.length - 1].delete()
    let loot = ''
    for (var myResult of customResults.results) {
      //Goes back in the loop if results are tables
      loot +=
        ' ' +
        (await this.rollContainer(myResult, customResults.roll._total, customResults.roll._formula))
      console.log(`${table.name} : Rolled ${customResults.roll._total} total for ${myResult.text}`)
    }
    return loot
  }

  //All loot container types are rolled here and exceptions are managed, loot is returned
  async rollContainer(result, myTotal = 0, formula = 0) {
    let table = await this.findTable(result.text)
    let myLoot = ``
    let myTooltip = ``
    //Exception : Result is to roll multiple times on multiple tables
    if (result.text.startsWith('#Roll')) {
      var substrings = result.text.split('&')
      for (var matches of substrings) {
        var match = matches.match(/\{(.*?)\}/)
        table = await this.system.findTable(match[1])
        if (table) {
          myLoot += await this.system.rollMyTable(table)
        }
      }
    } else {
      //Exception : Junk has a rolled amount of tables to roll
      if (result.text.includes('Junk') && result.text.startsWith('[[')) {
        let subResults = result.text.split(' ')
        let roll = new Roll(subResults[1].replace(']]', ''))
        await roll.evaluate()
        var i = 0
        while (i < roll.total) {
          //get as many results as roll for specific junk table
          table = await this.findTable(subResults[2] + ' ' + subResults[3])
          if (table) {
            myLoot += await this.rollMyTable(table)
          }
          i++
        }
      }
      //Roll like a Regular table
      else {
        if (table) {
          //roll table if one is found and reiterate
          myLoot += await this.rollMyTable(table)
        }
        //Or format loot result, whether it is an object or text
        else {
          myTooltip = `Rolled <b><u>${myTotal}</b></u> total on<div>${result.parent.name} table (${formula})</div>`
          if (result.documentCollection) {
            myLoot += await this.formatCompendiumItem(
              result.documentCollection.replace(`arcane-arcade-fallout.`, ``),
              result.text,
              myTooltip,
            )
          } else {
            myLoot += await this.formatCompendiumItem('', result.text, myTooltip)
          }
        }
      }
    }
    return myLoot
  }

  //Room loot starts and ends here with chat message.
  async rollRoomLoot(tableName) {
    const table = await this.findTable(tableName)
    let roll = await new Roll(table.formula)
    const customResults = await table.roll({ roll })
    console.log('LOOT TABLE ASYNCHRONOUS RESULTS : (MAY APPEAR IN REVERSE ORDER)')
    let myConcatenatedLoot = `Room Loot: `
    for (var result of customResults.results) {
      myConcatenatedLoot += await this.rollContainer(result)
    }
    myConcatenatedLoot = myConcatenatedLoot.split('<br>').join('')
    customResults.roll.toMessage({ flavor: myConcatenatedLoot })
  }

  //Custom container loot starts and ends here with chat message
  async rollCustomLoot(myValues, myTables) {
    var i = 0
    var j = 0
    let formattedResult
    let tablesList = 'Custom loot from '
    console.log('LOOT TABLE ASYNCHRONOUS RESULTS : (MAY APPEAR IN REVERSE ORDER)')
    let myConcatenatedLoot = ``
    while (i < myValues.length) {
      if (myValues[i] > 0) {
        j = 0
        tablesList += myTables[i] + ', '
        while (j < myValues[i]) {
          formattedResult = { text: myTables[i], documentCollection: '' }
          myConcatenatedLoot += await this.rollContainer(formattedResult)
          j++
        }
      }
      i++
    }
    myConcatenatedLoot = myConcatenatedLoot.split('<br>').join('')
    myConcatenatedLoot = tablesList.slice(0, -2) + ':<br>' + myConcatenatedLoot
    let chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      flavor: myConcatenatedLoot,
      //whisper: game.users.find(u => u.name == playerName)
    }
    ChatMessage.create(chatData, {})
  }

  //Dialog for room loot
  roomLoot() {
    let lootContainers = []
    let allContainers = ``
    let myCaseValue = 0
    let i = 0
    let myTables = [``, ``, ``, ``, ``, ``, ``, ``, ``, ``, ``, ``]
    let myValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    let roomFolder = game.data.folders.find((u) => u.name == 'Room Loot')
    if (roomFolder) {
      lootContainers = game.data.tables.filter((u) => u.folder == roomFolder._id)
    } else {
      lootContainers = game.packs.find((u) => u.metadata.name == 'roomloot').tree.entries
    }
    let containerOptions = lootContainers
      .map((u) => `<option value=${u.name.split(' ').join('_')}> ${u.name} </option>`)
      .join(``)

    while (i < lootContainers.length && i < 12) {
      allContainers += `<tr><td><i style="padding:3px;cursor: pointer;" name=data-tableSubtraction id="lower${i}" class="fas fa-minus-square"></i></td>
        <td id=value${i}>0</td>
        <td><i style="padding:3px;cursor: pointer;" name=data-tableAddition id="higher${i}" class="fas fa-plus-square"></i></td>
        <td><select name="container" id="container${i}">${containerOptions.replace(`value=${lootContainers[i].name.split(' ').join('_')}`, `value=${lootContainers[i].name.split(' ').join('_')} selected="selected"`)}</select></td>
        `
      myTables[i] = lootContainers[i].name
      if (i + 1 < lootContainers.length) {
        allContainers += `<td><i style="padding:3px;cursor: pointer;" name=data-tableSubtraction id="lower${i + 1}" class="fas fa-minus-square"></i></td>
        <td id=value${i + 1}>0</td>
        <td><i style="padding:3px;cursor: pointer;" name=data-tableAddition id="higher${i + 1}" class="fas fa-plus-square"></i></td>
        <td><select name="container" id="container${i + 1}">${containerOptions.replace(`value=${lootContainers[i + 1].name.split(' ').join('_')}`, `value=${lootContainers[i + 1].name.split(' ').join('_')} selected="selected"`)}</select></td></tr>`
        myTables[i + 1] = lootContainers[i + 1].name
      } else {
        allContainers += `</tr>`
      }
      i += 2
    }

    let dialogContent = `<div><p>By default, random room loot is rolled and distributed.</p></div>
    <div>Alternatively, enter an amount of times each container will be rolled and select custom roll.</div><br>
    <table>
      ${allContainers}
    <table>
    <br><br><div><i>Tip: Options here are populated from the Room Loot Compendium OR by the Room Loot rolltables Folder if it exists.`
    let d = new Dialog(
      {
        title: 'Choose loot options for the room',
        content: dialogContent,
        buttons: {
          Room: {
            icon: '<i class="fas fa-check"></i>',
            label: 'Random Room Loot',
            callback: async () => {
              this.rollRoomLoot('Room Loot')
            },
          },
          Custom: {
            icon: '<i class="fas fa-list-ul"></i>',
            label: 'Custom Rolls',
            callback: async () => {
              if (myValues.reduce((partialSum, a) => partialSum + a, 0) != 0) {
                this.rollCustomLoot(myValues, myTables)
              } else {
                alert(`You need at least one non-zero value for a custom roll. 
            
            Thank you for choosing Vault-Tec!`)
                d.render(true)
              }
            },
          },
        },
        default: 'Room',
        render: (html) => {
          html.find('[name=data-tableSubtraction]').click(function () {
            myCaseValue = document.getElementById(`value${this.id.replace(`lower`, ``)}`).innerHTML
            if (myCaseValue > 0) {
              document.getElementById(`value${this.id.replace(`lower`, ``)}`).innerHTML =
                myCaseValue - 1
              myValues[this.id.replace(`lower`, ``)] -= 1
            }
          })
          html.find('[name=data-tableAddition]').click(function () {
            document.getElementById(`value${this.id.replace(`higher`, ``)}`).innerHTML =
              parseInt(document.getElementById(`value${this.id.replace(`higher`, ``)}`).innerHTML) +
              1
            myValues[this.id.replace(`higher`, ``)] += 1
          })
          html.find('[name=container]').change(function () {
            myTables[this.id.replace(`container`, ``)] = this.value.split('_').join(' ')
          })
        },
      },
      {
        left: 200,
        top: 200,
        width: 600,
      },
    )
    d.render(true)
  }

  npcLoot() {
    let selectPC = canvas.tokens.controlled.find((u) => u.actor.type === 'character')
    if (selectPC) {
      try {
        // whisper loot to player if found from selected token
        let playerName = ``
        if (game.users.filter((u) => u.role < 3).find((u) => u.character.name == selectPC.name)) {
          playerName = game.users
            .filter((u) => u.role < 3)
            .find((u) => u.character.name == selectPC.name).name
        }
        this.determineNpcLoot(selectPC.actor.name, true, playerName)
      } catch {
        // public chat loot
        this.determineNpcLoot(selectPC.actor.name, false, '')
      }
    }
    // ask for character and player if none selected
    this.pcLuckDialog()
  }

  formatDice(formula) {
    return `<a style="color:black" class="inline-roll roll" data-mode="roll" data-flavor="" data-tooltip="Click to roll" data-formula=${formula}><i class="fas fa-dice-d20" ></i>${formula}</a class="roll">`
  }

  formatCompendiumItem(compendium, itemName, myTooltip = 'Item') {
    let compendiumObject, myItem, myRoll
    if (itemName.includes('[[')) {
      try {
        myRoll = itemName.replace('[[/r ', '').replace(']]', '')
        itemName = this.formatDice(myRoll)
      } catch {
        console.log('Incorrect dice, not converted')
      }
    }
    try {
      compendiumObject = game.packs.find((u) => u.metadata.name == compendium)
      myItem = compendiumObject.tree.entries.find(
        (u) => u.name.toLowerCase() == itemName.toLowerCase(),
      )
      if (myItem) {
        return `<a class="content-link" style="color:black" draggable="true" data-uuid="Compendium.arcane-arcade-fallout.${compendium}.Item.${myItem._id}" 
          data-id="${myItem._id}" data-type="Item" data-pack="arcane-arcade-fallout.${compendium}" data-tooltip="${myTooltip}"><i class="fas fa-suitcase">
          </i>${itemName}</a><br>`
      } else {
        return `${itemName}<br>`
      }
    } catch {
      return `${itemName}<br>`
    }
  }

  //Rolls loot for official monsters list below (not rolltables)
  createChatObject(compendium, itemName) {
    let myRoll
    switch (compendium) {
      case 'qty':
        if (itemName.includes('[')) {
          myRoll = itemName.replace('[', '')
          return this.formatDice(myRoll)
        } else {
          return itemName
        }
      case 'text':
        return `${itemName}<br>` //Bring back on same line as last
      case 'money':
        if (itemName.includes('[')) {
          myRoll = itemName.replace('[', '')
          return this.formatDice(myRoll) + `<br>`
        } else {
          return `${itemName}<br>`
        }
      default:
        return this.formatCompendiumItem(compendium, itemName)
    }
  }

  async iterateLoot(myMonsterLoot, totLckMod) {
    let i = 0
    let compendium, itemName
    let allLoot = ``
    while (i < myMonsterLoot.length) {
      compendium = myMonsterLoot[i][0]
      itemName = myMonsterLoot[i][1].replace('totLckMod', totLckMod)
      if (itemName.includes('(')) {
        allLoot =
          allLoot.slice(0, allLoot.length - 4) +
          ' ' +
          this.formatCompendiumItem(compendium, itemName)
      } else {
        allLoot = allLoot + this.createChatObject(compendium, itemName)
      }

      i++
    }
    return allLoot
  }

  async iterateResults(myLootResults) {
    let compendium = ``
    let allLoot = ``
    for (var loot of myLootResults) {
      compendium = loot.documentCollection.replace(`arcane-arcade-fallout.`, ``)
      if (loot.text.includes('(')) {
        allLoot =
          allLoot.slice(0, allLoot.length - 4) +
          ' ' +
          this.formatCompendiumItem(compendium, loot.text)
      } else {
        if (loot.text.endsWith('x')) {
          allLoot = allLoot + this.formatCompendiumItem(compendium, loot.text)
          allLoot = allLoot.slice(0, allLoot.length - 4) + ' '
        } else {
          allLoot = allLoot + this.formatCompendiumItem(compendium, loot.text)
        }
      }
    }
    return allLoot
  }

  pcLuckDialog() {
    let playerOptions, characterOptions
    try {
      playerOptions = game.users
        .filter((u) => u.role < 3)
        .map((u) => `<option value=${u.name.split(' ').join('_')}> ${u.name} </option>`)
        .join(``)
      characterOptions = game.actors
        .filter((u) => u.type == 'character')
        .map((u) => `<option value=${u.name.split(' ').join('_')}> ${u.name} </option>`)
        .join(``)
    } catch {
      alert('You must have at least 1 player and 1 actor to use this functionality.')
      return
    }
    let selectedCharacter = ``
    let charAssociated
    let selectedPlayer = ``
    let dialogContent = `<p>You haven't selected a token. Who is this loot for?</p><br><div></div>
                      <div">Player to whisper to:<select id="playSelec" name="player">${playerOptions}</select></div>
                      <div">Character's luck Mod:<select id="charSelec" name="character">${characterOptions}</select></div>
                      <br><br><div><i>Tip: Selecting a player character token on the map before clicking loot will skip this window</i></div>`
    let d = new Dialog({
      title: 'Choose a player and character',
      content: dialogContent,
      buttons: {
        Public: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Public',
          callback: async () => {
            this.determineNpcLoot(selectedCharacter, false, game.user)
          },
        },
        Whisper: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Whisper',
          callback: async () => {
            this.determineNpcLoot(selectedCharacter, true, selectedPlayer)
          },
        },
      },
      default: 'Public',
      render: (html) => {
        selectedPlayer = document.getElementById('playSelec').value.split('_').join(' ')
        selectedCharacter = document.getElementById('charSelec').value.split('_').join(' ')
        html.find('[name=player]').change(function () {
          selectedPlayer = document.getElementById('playSelec').value.split('_').join(' ')
          charAssociated = game.users.find((u) => u.name == selectedPlayer).character
          if (charAssociated) {
            document.getElementById('charSelec').value = charAssociated.name
          }
        })
        html.find('[name=character]').change(function () {
          selectedCharacter = document.getElementById('charSelec').value.split('_').join(' ')
        })
      },
    })
    d.render(true)
  }

  async findTable(name) {
    let table = null
    if (game.tables.getName(name)) {
      table = game.tables.getName(name)
    } else {
      const pack = game.packs.find((p) => {
        if (p.metadata.type !== 'RollTable') return false
        return !!p.index.getName(name)
      })
      if (pack) {
        let entry = pack.index.getName(name)
        table = await pack.getDocument(entry._id)
      }
    }
    return table
  }

  async determineNpcLoot(myActor, whisper, playerName) {
    const npcName = this.name
    let dcLoot, whisperUser
    if (game.users.find((u) => u.name == playerName)) {
      whisperUser = game.users.find((u) => u.name == playerName)._id
    }
    const totLckMod = game.actors.find((u) => u.name == myActor).system.abilities.lck.mod
    let myRollMode = CONST.DICE_ROLL_MODES.PRIVATE
    let myConcatenatedLoot = ``
    const collection = await game.packs.find((u) => u.metadata.label == 'Monster Loot')
    let table = await this.findTable(npcName)
    if (table) {
      // World & Compendium rollTables (can be customized by user or homebrew)
      const roll = await new Roll(table.formula)
      const customResults = await table.roll({ roll })
      myConcatenatedLoot =
        npcName + ` drops: <br>` + (await this.iterateResults(customResults.results))
      if (!whisper) {
        myRollMode = CONST.DICE_ROLL_MODES.PUBLIC
      }
      await customResults.roll.toMessage(
        { flavor: myConcatenatedLoot, user: game.users.find((u) => u.name == playerName) },
        { rollMode: myRollMode },
      )
    } else {
      //Not a roll table, from v2 hard-coded list
      const aMonsterLoot = FALLOUTZERO.monsterLoot.find((u) => u.name == npcName)
      if (aMonsterLoot) {
        //Official monsters
        myConcatenatedLoot = await this.iterateLoot(aMonsterLoot.loot[0].all, totLckMod)
        if (aMonsterLoot.loot.length > 1) {
          //Luck Roll with DC if specified
          myConcatenatedLoot += `<div><b>${myActor}</b> can roll ${this.formatDice('1d20+' + totLckMod)} for more loot.</div>`
          dcLoot =
            `<b>On success (${aMonsterLoot.dice.replace('Lck', '')})</b> : <br>` +
            (await this.iterateLoot(aMonsterLoot.loot[1].dc, totLckMod))
        }
      } else {
        let inventoryLoot = this.collections.items.contents
        myConcatenatedLoot = npcName + ` drops: <br><br>`
        let compendium = ``
        for (var loot of inventoryLoot) {
          switch (loot.type) {
            case 'explosive':
              compendium = 'explosives'
              break
            case 'ammo':
              compendium = 'ammunition'
              break
            case 'meleeWeapon':
              compendium = 'melee-weapons'
              break
            case 'rangedWeapon':
              compendium = 'rangedweapons'
              break
            case 'miscItem':
              compendium = 'miscellaneous'
              break
            case 'chem':
              compendium = 'chems'
              break
            case 'foodAnddrink':
              compendium = 'food-and-drinks'
              break
            case 'junkItem':
              compendium = 'junk'
              break
            default:
              compendium = loot.type
              break
          }
          myConcatenatedLoot =
            myConcatenatedLoot.slice(0, -4) + this.formatCompendiumItem(compendium, loot.name)
        }
      }
      let chatData = {
        user: game.user._id,

        speaker: ChatMessage.getSpeaker(),

        flavor: myConcatenatedLoot,

        whisper: whisperUser,
      }
      ChatMessage.create(chatData, {})
      if (dcLoot) {
        ChatMessage.create({ flavor: dcLoot, whisper: game.user._id })
      }
    }
  }
}
