import { FALLOUTZERO } from '../config.mjs'

export default class FalloutZeroActorBase extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = {}
    schema.biography = new fields.HTMLField()
    schema.skillPool = new fields.NumberField({ initial: 0 })
    schema.startingSkillpoints = new fields.NumberField({ initial: 6 })
    schema.totalSkillpoints = new fields.NumberField({ initial: 0 })
    schema.health = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
      }),
      min: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      max: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
      }),
    })
    schema.stamina = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        min: 0,
        initial: 10,
      }),
      min: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      max: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
      }),
    })
    schema.actionPoints = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
      }),
      min: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      max: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
      }),
    })
    schema.karmaCaps = new fields.ArrayField(new fields.BooleanField(), { initial: [true] })

    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField(
      Object.keys(FALLOUTZERO.abilities).reduce((obj, ability) => {
        obj[ability] = new fields.SchemaField({
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 5,
          }),
          mod: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          base: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          modifiers: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          label: new fields.StringField({
            initial: FALLOUTZERO.abilities[ability].label,
          }),
          abbr: new fields.StringField({
            initial: FALLOUTZERO.abilities[ability].abbreviation,
          }),
        })
        return obj
      }, {}),
    )

    schema.skills = new fields.SchemaField(
      Object.keys(FALLOUTZERO.skills).reduce((obj, skill) => {
        obj[skill] = new fields.SchemaField({
          ability: new fields.ArrayField(new fields.StringField({ required: true })),
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          base: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          modifiers: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          label: new fields.StringField({
            initial: FALLOUTZERO.skills[skill].label,
          }),
          id: new fields.StringField({
            initial: FALLOUTZERO.skills[skill].id,
          }),
        })
        return obj
      }, {}),
    )

    schema.materials = new fields.SchemaField(
      Object.keys(FALLOUTZERO.materials).reduce((obj, material) => {
        obj[material] = new fields.SchemaField({
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
            min: 0,
          }),
          label: new fields.StringField({
            initial: FALLOUTZERO.materials[material].label,
          }),
          id: new fields.StringField({
            initial: FALLOUTZERO.materials[material].id,
          }),
        })
        return obj
      }, {}),
    )

    schema.armorClass = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      min: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })

    schema.damageThreshold = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      min: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })

    schema.caps = new fields.NumberField({
      initial: 0,
      min: 0,
    })

    return schema
  }

  prepareBaseData() {
    super.prepareBaseData()
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.abilities) {
      // Calculate the modifier using d20 rules.
      this.abilities[key].mod = Math.floor(this.abilities[key].value - 5)
    }

    // Loop through skill scores, and add their modifiers to our sheet output.
    for (const key in this.skills) {
      this.skills[key].ability = FALLOUTZERO.skills[key].ability
    }
  }

  // START HERE FOR CUSTOM FUNCTIONS

  addCap() {
    const caps = this.parent.system.karmaCaps
    this.parent.update({ 'system.karmaCaps': [...caps, true] })
  }

  removeCap() {
    const newCaps = this.parent.system.karmaCaps
    if (newCaps.length === 1) return
    newCaps.splice(newCaps.length - 1, 1)
    this.parent.update({ 'system.karmaCaps': newCaps })
  }

  //add item
  itemaddition(importeditem) {
    const item = this.parent.items.get(importeditem)
    const updatedQty = Number(item.system.quantity) + 1
    item.update({ 'system.quantity': updatedQty })
  }

  //subtract item
  itemsubtraction(importeditem) {
    const item = this.parent.items.get(importeditem)
    let updatedQty = Number(item.system.quantity) - 1
    if (updatedQty < 1) {
      updatedQty = 0
    }
    item.update({ 'system.quantity': updatedQty })
  }

  ruleinfo(condition) {
    const myDialogOptions = { width: 500, height: 300, resizable: true }
    const conditionFormatted = condition.charAt(0).toUpperCase() + condition.slice(1)
    const rule = FALLOUTZERO.rules[conditionFormatted]
    const message = `<div class="conditioninfo">${rule}</div>`
    new Dialog(
      {
        title: `Details: ${conditionFormatted}`,
        content: message,
        buttons: {},
      },
      myDialogOptions,
    ).render(true)
  }

  healthupdate(operator) {
    let newHealth = ''
    if (operator === 'plus') {
      newHealth = this.parent.system.health.value + 1
    } else {
      newHealth = this.parent.system.health.value - 1
    }
    this.parent.update({ 'system.health.value': newHealth })
  }

  staminaupdate(operator) {
    let newStamina = ''
    if (operator === 'plus') {
      newStamina = this.parent.system.stamina.value + 1
    } else {
      newStamina = this.parent.system.stamina.value - 1
    }
    this.parent.update({ 'system.stamina.value': newStamina })
  }
  actionupdate(operator) {
    let newAction = ''
    if (operator === 'plus') {
      newAction = this.parent.system.actionPoints.value + 1
    } else {
      newAction = this.parent.system.actionPoints.value - 1
    }
    this.parent.update({ 'system.actionPoints.value': newAction })
  }

  skilladdition(skill) {
    const actor = this.parent.system
    const newSkillbase = this.parent.system.skills[skill].base + 1
    const skillField = 'system.skills.' + skill + '.base'
    this.parent.update({ [skillField]: newSkillbase })

    // update skillpool
    const updatedSkillpool = actor.skillPool - 1
    this.parent.update({ 'system.skillPool': updatedSkillpool })
  }
  skillsubtraction(skill) {
    const actor = this.parent.system
    const newSkillbase = this.parent.system.skills[skill].base - 1
    const skillField = 'system.skills.' + skill + '.base'
    this.parent.update({ [skillField]: newSkillbase })

    // update skillpool
    const updatedSkillpool = actor.skillPool + 1
    this.parent.update({ 'system.skillPool': updatedSkillpool })
  }

  skillUpdated() {
    //Set Variables
    const actor = this.parent.system
    let skillPool = actor.skillPool

    // Loop Through Skills, get sum of all the skill
    if (actor.abilities.int.mod > 0) {
      skillMod = 5
    }
    if (actor.abilities.int.mod == 0) {
      skillMod = 4
    }
    if (actor.abilities.int.mod < 0) {
      skillMod = 3
    }
    updatedSkillpool = skillPool + skillMod
    this.parent.update({ 'system.skillPool': updatedSkillpool })
  }

  levelUp() {
    // Rewards Variables
    const actor = this.parent.system
    const myDialogOptions = { width: 500, height: 400 }
    const newXP = this.parent.system.xp - 1000
    const newLevel = this.parent.system.level + 1
    let rewards = `<h3>Congratulations!</h3><p> You've Leveled Up! Please look below for your rewards!</p>`

    // Update Level
    this.parent.update({ 'system.xp': newXP })
    this.parent.update({ 'system.level': newLevel })

    // Skill Rewards Start

    const earnedSkillpoints = this.parent.system.skillPool
    let skillPointsMod = ''
    let SkillPointsUsed = ''
    const SkillPoolUsed = ''
    let updatedSkillpool = ''
    let updatedSkillpoints = this.parent.system.totalSkillpoints

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
      this.parent.update({ 'system.skillPool': updatedSkillpool })

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

      this.parent.update({ 'system.health.max': updatedHealth })
      this.parent.update({ 'system.health.value': updatedHealthvalue })
      this.parent.update({ 'system.stamina.max': updatedStamina })
      this.parent.update({ 'system.stamina.value': updatedStaminavalue })
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
    let currentItem = this.parent.items.get(item)
    let currentState = currentItem.system.itemOpen
    if (currentState === true) {
      this.parent.updateEmbeddedDocuments('Item', [{ _id: item, 'system.itemOpen': false }])
    } else {
      this.parent.updateEmbeddedDocuments('Item', [{ _id: item, 'system.itemOpen': true }])
    }
  }

  refillAp() {
    this.parent.update({ 'system.actionPoints.value': this.parent.system.actionPoints.max })
  }

  recycleAp() {
    let RecycledAP =
      Math.floor(this.parent.system.actionPoints.value / 2) + this.parent.system.actionPoints.max
    if (RecycledAP < 16) {
      this.parent.update({ 'system.actionPoints.value': RecycledAP })
    } else {
      this.parent.update({
        'system.actionPoints.value': 15,
      })
    }
  }
  apUsed(weaponId) {
    const currentAp = this.actionPoints.value
    const weapon = this.parent.items.get(weaponId)
    const apCost = weapon.system.apCost
    const newAP = Number(currentAp) - Number(apCost)

    if (newAP < 0) {
      ui.notifications.warn(`Not enough AP for action`)
      return
    }

    this.parent.update({ 'system.actionPoints.value': Number(newAP) })
  }

  rollWeapon(weaponId, hasDisadvantage = false) {
    const currentAp = this.actionPoints.value
    const weapon = this.parent.items.get(weaponId)
    const apCost = weapon.system.apCost
    const newAP = Number(currentAp) - Number(apCost)

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
      const foundAmmo = this.parent.items.find(item => item.name === ammoType)
      if (foundAmmo) {
        const newWeaponAmmoCapacity = Number(weapon.system.ammo.capacity.value - 1)
        this.parent.updateEmbeddedDocuments('Item', [
          {
            _id: weapon._id,
            'system.ammo.capacity.value': newWeaponAmmoCapacity,
          },
        ])
      }
    }

    // update actor AP
    this.parent.update({ 'system.actionPoints.value': Number(newAP) })

    // roll to hit
    const dice = hasDisadvantage ? '2d20kl' : 'd20'

    const skillBonusValue = this.skills[weapon.system.skillBonus].base + this.skills[weapon.system.skillBonus].modifiers
    const abilityMod = this.abilities[weapon.system.abilityMod].mod
    const decayValue = (weapon.system.decay - 10) * -1
    let roll = new Roll(
      `${dice} + ${skillBonusValue} + ${abilityMod} - ${this.penaltyTotal} - ${decayValue} + ${this.luckmod}`,
      this.getRollData(),
    )
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.parent }),
      flavor: `BOOM! Attack with a ${weapon.name}`,
      rollMode: game.settings.get('core', 'rollMode'),
    })

    console.log('ACTOR UPDATE', {
      'system.actionPoints.value': newAP,
    })

    return roll
  }

  // Reload Button is Pressed
  reload(weaponId = null) {
    // Get Weapon Information Array
    const weapon = this.parent.items.get(weaponId)
    if (!weapon) {
      ui.notifications.warn(`Weapon ${weaponId} not found on character / Delete and Readd`)
      return
    }
    // Do you have the AP?
    const newAP = this.actionPoints.value - 6
    if (newAP < 0) {
      ui.notifications.warn(`Not enough action points to reload`)
      return
    }

    // Collect Required Ammo Information
    const ammoType = weapon.system.ammo.type
    const ammoFound = this.parent.items.find(item => item.name === ammoType)

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
      this.parent.updateEmbeddedDocuments('Item', [{ _id: weaponId, 'system.ammo.capacity.value': ammoAvailable }])
    } else {
      this.parent.updateEmbeddedDocuments('Item', [{ _id: weaponId, 'system.ammo.capacity.value': capacity }])
    }

    // Energy Weapon Reload Rules
    if (weapon.system.energyWeapon) {
      updatedAmmo = ammoOwned - 1
      this.parent.updateEmbeddedDocuments('Item', [{ _id: ammoID, 'system.quantity': updatedAmmo }])
    } else {
      this.parent.updateEmbeddedDocuments('Item', [{ _id: ammoID, 'system.quantity': updatedAmmo }])
    }

    // Pay the AP
    this.parent.update({ 'system.actionPoints.value': Number(newAP) })

    // After 10 Reloads, Gain 1 Level of Decay to the Weapon
    const newReloaddecay = weapon.system.reloadDecay + 1
    if (newReloaddecay == 10) {
      const newDecay = weapon.system.decay - 1
      this.parent.updateEmbeddedDocuments('Item', [{ _id: weaponId, 'system.decay': newDecay }])
      this.parent.updateEmbeddedDocuments('Item', [{ _id: weaponId, 'system.reloadDecay': 0 }])
    } else {
      this.parent.updateEmbeddedDocuments('Item', [
        { _id: weaponId, 'system.reloadDecay': newReloaddecay },
      ])
    }
  }

  //Roll any table, check if loot is a table and start over or add loot.
  async rollMyTable(table) {
    let roll = await new Roll(
      table.formula.replace('5[', this.parent.system.abilities.lck.mod + '['),
    )
    const customResults = await table.draw({ roll })
    game.messages.contents[game.messages.contents.length - 1].delete()
    let loot = ''
    for (var myResult of customResults.results) {
      //Goes back in the loop if results are tables
      loot +=
        ' ' +
        (await this.parent.system.rollContainer(
          myResult,
          customResults.roll._total,
          customResults.roll._formula,
        ))
      console.log(`${table.name} : Rolled ${customResults.roll._total} total for ${myResult.text}`)
    }
    return loot
  }

  //All loot container types are rolled here and exceptions are managed, loot is returned
  async rollContainer(result, myTotal = 0, formula = 0) {
    let table = await this.parent.system.findTable(result.text)
    let myLoot = ``
    let myTooltip = ``
    //Exception : Result is to roll multiple times on multiple tables
    if (result.text.startsWith('#Roll')) {
      var substrings = result.text.split('&')
      for (var matches of substrings) {
        var match = matches.match(/\{(.*?)\}/)
        table = await this.parent.system.findTable(match[1])
        if (table) {
          myLoot += await this.parent.system.rollMyTable(table)
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
          table = await this.parent.system.findTable(subResults[2] + ' ' + subResults[3])
          if (table) {
            myLoot += await this.parent.system.rollMyTable(table)
          }
          i++
        }
      }
      //Roll like a Regular table
      else {
        if (table) {
          //roll table if one is found and reiterate
          myLoot += await this.parent.system.rollMyTable(table)
        }
        //Or format loot result, whether it is an object or text
        else {
          myTooltip = `Rolled <b><u>${myTotal}</b></u> total on<div>${result.parent.name} table (${formula})</div>`
          if (result.documentCollection) {
            myLoot += await this.parent.system.formatCompendiumItem(
              result.documentCollection.replace(`arcane-arcade-fallout.`, ``),
              result.text,
              myTooltip,
            )
          } else {
            myLoot += await this.parent.system.formatCompendiumItem('', result.text, myTooltip)
          }
        }
      }
    }
    return myLoot
  }

  //Room loot starts and ends here with chat message.
  async rollRoomLoot(tableName) {
    const table = await this.parent.system.findTable(tableName)
    let roll = await new Roll(table.formula)
    const customResults = await table.roll({ roll })
    console.log('LOOT TABLE ASYNCHRONOUS RESULTS : (MAY APPEAR IN REVERSE ORDER)')
    let myConcatenatedLoot = `Room Loot: `
    for (var result of customResults.results) {
      myConcatenatedLoot += await this.parent.system.rollContainer(result)
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
          myConcatenatedLoot += await this.parent.system.rollContainer(formattedResult)
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
              this.parent.system.rollRoomLoot('Room Loot')
            },
          },
          Custom: {
            icon: '<i class="fas fa-list-ul"></i>',
            label: 'Custom Rolls',
            callback: async () => {
              if (myValues.reduce((partialSum, a) => partialSum + a, 0) != 0) {
                this.parent.system.rollCustomLoot(myValues, myTables)
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
      try{ // whisper loot to player if found from selected token
        let playerName = ``
        if (game.users.filter((u) => u.role < 3).find((u) => u.character.name == selectPC.name)) {
          playerName = game.users
            .filter((u) => u.role < 3)
            .find((u) => u.character.name == selectPC.name).name
        }
        this.parent.system.determineNpcLoot(selectPC.actor.name, true, playerName)
      }
      catch{ // public chat loot
        this.parent.system.determineNpcLoot(selectPC.actor.name, false, "");
      }
    }
      // ask for character and player if none selected
      this.parent.system.pcLuckDialog()
  }

  formatDice(formula) {
    return `<a style="color:black" class="inline-roll roll" data-mode="roll" data-flavor="" data-tooltip="Click to roll" data-formula=${formula}><i class="fas fa-dice-d20" ></i>${formula}</a class="roll">`
  }

  formatCompendiumItem(compendium, itemName, myTooltip = 'Item') {
    let compendiumObject, myItem, myRoll
    if (itemName.includes('[[')) {
      try {
        myRoll = itemName.replace('[[/r ', '').replace(']]', '')
        itemName = this.parent.system.formatDice(myRoll)
      } catch {
        console.log('Incorrect dice, not converted')
      }
    }
    try {
      compendiumObject = game.packs.find((u) => u.metadata.name == compendium)
      myItem = compendiumObject.tree.entries.find((u) => u.name == itemName)
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
          return this.parent.system.formatDice(myRoll)
        } else {
          return itemName
        }
        break
      case 'text':
        return `${itemName}<br>` //Bring back on same line as last
        break
      case 'money':
        if (itemName.includes('[')) {
          myRoll = itemName.replace('[', '')
          return this.parent.system.formatDice(myRoll) + `<br>`
        } else {
          return `${itemName}<br>`
        }
        break
      default:
        return this.parent.system.formatCompendiumItem(compendium, itemName)
        break
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
          this.parent.system.formatCompendiumItem(compendium, itemName)
      } else {
        allLoot = allLoot + this.parent.system.createChatObject(compendium, itemName)
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
          this.parent.system.formatCompendiumItem(compendium, loot.text)
      } else {
        if (loot.text.endsWith('x')) {
          allLoot = allLoot + this.parent.system.formatCompendiumItem(compendium, loot.text)
          allLoot = allLoot.slice(0, allLoot.length - 4) + ' '
        } else {
          allLoot = allLoot + this.parent.system.formatCompendiumItem(compendium, loot.text)
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
            this.parent.system.determineNpcLoot(selectedCharacter, false, game.user)
          },
        },
        Whisper: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Whisper',
          callback: async () => {
            this.parent.system.determineNpcLoot(selectedCharacter, true, selectedPlayer)
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
    const npcName = this.parent.name
    let dcLoot, whisperUser
    if (game.users.find((u) => u.name == playerName)) {
      whisperUser = game.users.find((u) => u.name == playerName)._id
    }
    const totLckMod = game.actors.find((u) => u.name == myActor).system.abilities.lck.mod
    let myRollMode = CONST.DICE_ROLL_MODES.PRIVATE
    let myConcatenatedLoot = ``
    const collection = await game.packs.find((u) => u.metadata.label == 'Monster Loot')
    let table = await this.parent.system.findTable(npcName)
    if (table) {
      // World & Compendium rollTables (can be customized by user or homebrew)
      const roll = await new Roll(table.formula)
      const customResults = await table.roll({ roll })
      myConcatenatedLoot =
        npcName + ` drops: <br>` + (await this.parent.system.iterateResults(customResults.results))
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
        myConcatenatedLoot = await this.parent.system.iterateLoot(
          aMonsterLoot.loot[0].all,
          totLckMod,
        )
        if (aMonsterLoot.loot.length > 1) {
          //Luck Roll with DC if specified
          myConcatenatedLoot += `<div><b>${myActor}</b> can roll ${this.parent.system.formatDice('1d20+' + totLckMod)} for more loot.</div>`
          dcLoot =
            `<b>On success (${aMonsterLoot.dice.replace('Lck', '')})</b> : <br>` +
            (await this.parent.system.iterateLoot(aMonsterLoot.loot[1].dc, totLckMod))
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

  getRollData() {
    const data = {}

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k, v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v)
      }
    }

    if (this?.attributes?.level?.value) {
      data.lvl = this.attributes.level.value
    }

    return data
  }
}
