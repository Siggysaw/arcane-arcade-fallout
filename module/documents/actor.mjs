import { FALLOUTZERO } from '../config.mjs'
import FalloutZeroActorSheet from '../sheets/actor-sheet.mjs'
import FalloutZeroItem from './item.mjs'
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
  // Perks List
  viewPerks() {
    const myDialogOptions = {resizable: true }
    let message = "Perks List Coming Soon!"
    const perks = game.packs.filter((i) => i.name == "perks")
    //actorData.items.find((i) => i.name == "Pack Rat")
    console.log(perks)



    new Dialog({
      title: 'Custom Roll',
      content: message,
      buttons: {
        button1: {
          label: 'Close',
        },
      },
    },
      myDialogOptions,
    ).render(true)
  }

  // Custom Roll
  async customRoll() {
    const myDialogOptions = { width: 275, resizable: true }
    const myContent = await renderTemplate("systems/arcane-arcade-fallout/templates/actor/dialog/custom-roll.hbs");
    const actor = this

    new Dialog({
      title: 'Custom Roll',
      content: myContent,
      buttons: {
        button1: {
          label: 'Roll It!',
          callback: (html) => rollDice(html, actor),
        },
      },
    },
      myDialogOptions,
    ).render(true)
  
    async function rollDice(html, actor) {
      const withModifiers = html.find('select#modified').val()
      const withAdvantage = html.find('select#advantage').val()
      let rollNumber = html.find('input#diceNumber').val()
      let rollType = html.find('select#diceType').val()
      let rollBonus = html.find('input#bonus').val()
      let rollInput = `${rollNumber}d${rollType}`
      if (withAdvantage !== "false") {
        rollInput += withAdvantage
      }
      if (withModifiers === "true") {
        const luckmod = actor.system.luckmod
        const penaltyTotal = actor.system.penaltyTotal
        rollInput +=` + ${luckmod} - ${penaltyTotal}`
      }
      if (rollBonus.length > 0) {
        rollInput += `+ ${rollBonus}`
      }
      const roll = new Roll(`${rollInput}`, actor.getRollData())
      await roll.evaluate()
      console.log(actor)

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `${actor.name} rolled a Custom Roll!`,
        rollMode: game.settings.get('core', 'rollMode'),
      })
    }
  }

  // Short Rest and Long Rest Button Functionality
  restRecovery(rest) {
    const raceItem = this.items.filter((i) => i.type == 'race')
    const race = raceItem[0].name
    const currentSP = this.system.stamina.value
    const currentHP = this.system.health.value
    const maxSP = this.system.stamina.max
    const maxHP = this.system.health.max
    const endurance = this.system.abilities.end.value
    const robotHeal = Math.max(this.system.abilities.int.value, this.system.abilities.per.value)

    // Short Rest
    if (rest === 'short') {
      let newSP = 0
      race === ('Human' || 'Ghoul' || 'Super Mutant')
        ? (newSP = currentSP + Math.floor(maxSP / 2))
        : (newSP = maxSP)
      newSP > maxSP ? (newSP = maxSP) : (newSP = newSP)
      this.update({ 'system.stamina.value': newSP })
    }
    // Long Rest
    if (rest === 'long') {
      let newHP = 0
      race === ('Human' || 'Ghoul' || 'Super Mutant')
        ? (newHP = currentHP + endurance / 2 + this.system.level)
        : (newHP = currentHP + robotHeal / 2 + this.system.level)
      newHP > maxHP ? (newHP = maxHP) : (newHP = newHP)
      this.update({ 'system.health.value': newHP })
      this.update({ 'system.stamina.value': maxSP })
    }
  }

  inspectCarryload() {
    const packrat = this.items.find((i) => i.name == "Pack Rat")
    const myDialogOptions = { width: 500, height: 300, resizable: true }
    const carryLoadSetting = game.settings.get('core', 'CarryLoad');
    let load = Math.floor(this.system.caps / 50)
    let message = `<table style="text-align:center"><tr><th>Item</th><th>Qty x Load</th><th>Total</th></tr><tr><td>Caps</td><td>${this.system.caps}/50</td><td>${load}</td>`
    let overall = load
    this.items.reduce((acc, item) => {
      if (item.system.load > 0) {
        let name = item.name
        let qty = item.system.quantity
        load = item.system.load
        if (item.system.worn) {
          load = 0
        }
        if (packrat && load < 3 && load > 1) {
          load = 1
        }
        let total = Number(load) * Number(qty)
        if (carryLoadSetting) {
          overall = overall + total
          total = Math.round(total * 10) / 10
          message += `<tr><td>${name}</td><td>${qty} x ${load}</td><td>${total}</td></tr>`
        } else {
          overall = overall + Math.floor(total)
          message += `<tr><td>${name}</td><td>${qty} x ${load}</td><td>${Math.floor(total)}</td></tr>`
        }
      }
    }, 0)
    new Dialog(
      {
        title: `Carry Load Details: ${this.name}`,
        content: `${message}<tr><td>Total</td><td></td><td>${overall}</td></tr></table>`,
        buttons: {},
      },
      myDialogOptions,
    ).render(true)
  }

  deep_value(obj, path) {
    for (var i = 0, path = path.split('.'), len = path.length; i < len; i++) {
      obj = obj[path[i]]
    }
    return obj
  }

  async addCustomEffect(path, modType, initialValue) {
    let actorValue = await this.deep_value(this, path)
    let consumValue, valueMax, valueMin
    if (typeof actorValue === 'number') {
      if (initialValue.includes('@')) {
        //Find the value
        try {
          consumValue = await this.evaluateAtFormula(initialValue)
        } catch {
          consumValue = initialValue
        }
      } else {
        consumValue = Number(initialValue)
      }
    } else {
      consumValue = initialValue
    }
    if (typeof actorValue != typeof consumValue) {
      alert(
        'Check Custom Effect Values for your consumable. If field is a Number, you need a Number as value or specify dependent stat using @ (ex.: @system.level or @system.abilities.luck.value) ',
      )
      return
    }
    if (modType == 'Add') {
      //Add Radiation levels if irradiated
      if (path == 'system.irradiated') {
        await this.handleIrradiated('system.irradiated', actorValue, consumValue)
      }
      //This should work with numbers and/or strings
      else {
        //If there is a max, don't go over it
        if (
          path.includes('value') &&
          typeof (await this.deep_value(this, path.replace('.value', '.max'))) == 'number'
        ) {
          valueMax = await this.deep_value(this, path.replace('.value', '.max'))
          actorValue = Math.min(actorValue + consumValue, valueMax)
        } else {
          actorValue = actorValue + consumValue
        }
        //Don't go under minimum
        if (
          path.includes('value') &&
          typeof (await this.deep_value(this, path.replace('.value', '.min'))) == 'number'
        ) {
          valueMin = await this.deep_value(this, path.replace('.value', '.min'))
          actorValue = Math.max(actorValue, valueMin)
        } else {
          if (actorValue < 0 && !path.includes('dvantage')) {
            actorValue = 0
          } //most stuff has a minimum of 0.
        }
      }
    } else {
      //If not Add
      if (typeof consumValue == Number) {
        if (
          (modType == 'Upgrade' && actorValue > consumValue) ||
          (modType == 'Downgrade' && actorValue > consumValue) ||
          modType == 'Override'
        ) {
          actorValue = consumValue
        }
        if (modType == 'Multiply') {
          actorValue = actorValue * consumValue
        }
      } else {
        actorValue = consumValue
      }
    }
    await this.update({ [path]: actorValue })
    let descSplit = path.split('.')
    let modifiedValue = descSplit[descSplit.length - 2]
    if (modifiedValue == 'system') {
      modifiedValue = descSplit[descSplit.length - 1]
    }
    let chatDesc = `${modifiedValue}<br>`
    return chatDesc
  }

  async evaluateAtFormula(string, myActor = this) {
    let strList = string.split(' ')
    string = ''
    for (var str of strList) {
      if (str.includes('@')) {
        str = await this.deep_value(myActor, str.split('@').join(''))
      }
      string += str + ' '
    }
    return Math.ceil(eval(string))
  }

  async askForCheck(ability, dc, condition) {
    let abilityLabel = this.deep_value(this, ability.replace('mod', 'label'))
    if (dc.includes('@')) {
      try {
        dc = await this.evaluateAtFormula(dc)
      } catch {
        dc = dc
      }
    }
    const button = `
    <div class="card-buttons">
      <button type="button" data-condition="${condition}" data-action="check" id="askForRoll" data-ability="${ability}" data-dc="${dc}">
        <i class="fas fa-shield-heart"></i>
        <span class="visible-dc">DC${dc} ${abilityLabel} Check for ${condition}</span>
      </button>
    </div>`
    return button
  }

  //Apply level of alcohol condition (Buzzed, Drunk, Hammered or Wasted)
  async applyDrunkness(condition, myActor) {
    //condition can be Drunk or Hammered depending on Endurance
    let newCondition
    let currentCondition
    let oldCondition
    let chatContent = ``
    let addedCondition //This effect has an @level that needs to be changed
    let pack = game.packs.find((p) => p.metadata.name == 'conditions')

    //Apply poison first.
    if (condition == 'Poisoned') {
      //activate poisoned
      if (myActor.items.find((i) => i.name == 'Poisoned')) {
        newCondition = await myActor.items.get(
          await myActor.items.find((i) => i.name == 'Poisoned')._id,
        )
        await newCondition.update({ 'system.quantity': currentCondition.system.quantity + 1 })
      } else {
        //add poisoned
        newCondition = await pack.getDocument('om8uTrsKZqMfhPWb') //Apply Poisoned
        addedCondition = await Item.create(newCondition, { parent: myActor })
      }
      chatContent += `${this.formatCompendiumItem('condition', newCondition.name, 'Click for details').split('<br>').join('')} for 4 hours.`
      return chatContent
    }

    //Evaluate Drunkness for all its levels
    if (myActor.items.find((i) => i.name == 'Wasted')) {
      //If wasted already
      currentCondition = await myActor.items.get(
        await myActor.items.find((i) => i.name == 'Wasted')._id,
      )
      await currentCondition.update({ 'system.quantity': currentCondition.system.quantity + 1 })
    } else {
      //Not currently wasted
      if (myActor.items.find((i) => i.name == 'Hammered')) {
        //If Hammered already
        currentCondition = await myActor.items.get(
          await myActor.items.find((i) => i.name == 'Hammered')._id,
        )
        if (currentCondition.system.quantity < 3) {
          //Hammered less than 3
          await currentCondition.update({ 'system.quantity': currentCondition.system.quantity + 1 }) //Add a Hammered level
        } else {
          //Hammered for a third time
          newCondition = await pack.getDocument('8jmOpO92JUHjddr5') //Apply Wasted
          addedCondition = await Item.create(newCondition, { parent: myActor })
          oldCondition = await this.items.get(currentCondition._id) //Delete Hammered
          oldCondition.delete()
        }
      } else {
        //Neither wasted nor hammered
        currentCondition = await myActor.items.find((i) => i.name == 'Drunk')
        if (currentCondition || condition == 'Hammered') {
          newCondition = await pack.getDocument('CbcBeOsQnIm5BtXL') //Apply Hammered
          addedCondition = await Item.create(newCondition, { parent: myActor })
          if (currentCondition) {
            //If Drunk, delete drunk
            oldCondition = await this.items.get(currentCondition._id) //Delete Drunk (if present)
            oldCondition.delete()
          }
        } else {
          //Neither wasted nor hammered, NOR Drunk (but maybe buzzed...)
          currentCondition = await myActor.items.find((i) => i.name == 'Buzzed')
          if (currentCondition || condition == 'Drunk') {
            newCondition = await pack.getDocument('Qw9wbkfMEkjX3XxB') //Apply Drunk
            addedCondition = await Item.create(newCondition, { parent: myActor })
            if (currentCondition) {
              //If Buzzed, delete Buzzed
              oldCondition = await this.items.get(currentCondition._id) //Delete Buzzed (if present)
              oldCondition.delete()
            }
          } else {
            //Not suffering from any current alcoholic condition
            newCondition = await pack.getDocument('NPlxn4CVIQRnimWK') //Apply Buzzed
            addedCondition = await Item.create(newCondition, { parent: myActor })
          }
        }
      }
    }
    if (newCondition) {
      chatContent += `${this.formatCompendiumItem('condition', newCondition.name, 'Click for details').split('<br>').join('')} for [[/r 1d4]] hours.`
    } else {
      chatContent += `${this.formatCompendiumItem('condition', currentCondition.name, 'Click for details').split('<br>').join('')} for an additional [[/r 1d4]] hours.`
    }
    //Modify Effects to get the @ values
    if (addedCondition) {
      console.log('added a drunk condition')
      let newArray
      for (var ef of addedCondition.effects) {
        newArray = ef.changes
        for (var change of newArray) {
          if (change.value.includes('@')) {
            change.value = await this.evaluateAtFormula(change.value)
          }
        }
        console.log(await ef.update({ changes: newArray }))
      }
    }
    return chatContent
  }

  async getConsequence(result, condition) {
    let chatMessage = ''
    let actorEf
    let conditionObj
    let actorEffects = this.items
    if (result == true) {
      chatMessage = 'Okie-dokie! You tolerate it well.'
      if (actorEffects.find((e) => e.name == condition)) {
        //Remove inactive condition
        actorEf = await actorEffects.get(actorEffects.find((e) => e.name == condition)._id)
        conditionObj = await actorEf.effects._source[0]
        if (conditionObj.disabled == false) {
          await actorEf.delete()
        }
      }
    } else {
      //Activate effect
      if (actorEffects.find((e) => e.name == condition)) {
        actorEf = await actorEffects.get(actorEffects.find((e) => e.name == condition)._id)
      } else {
        //Create new effect if not already on character
        let pack = await game.packs.find((p) => p.metadata.name == 'conditions')
        console.log(pack, condition)
        conditionObj = await pack.getDocument(pack.find((o) => o.name == condition)._id)
        actorEf = await Item.create(conditionObj, { parent: this })
        //Modify Effects to get the @ values
        if (actorEf) {
          let newArray
          for (var ef of actorEf.effects) {
            newArray = ef.changes
            for (var change of newArray) {
              if (change.value.includes('@')) {
                change.value = await this.evaluateAtFormula(change.value)
              }
            }
            await ef.update({ changes: newArray })
          }
        }
      }
      if (condition == 'Psychosis') {
        chatMessage = `Uh-oh! Your ${this.formatCompendiumItem('conditions', 'Psychosis', 'Click for details')} pushes you to attack the nearest creature.`
      } else {
        try {
          chatMessage = `Crap! You now suffer from ${this.formatCompendiumItem('conditions', condition, 'Click for details')}`
        } catch {
          chatMessage = `Crap! You now suffer from ${condition}`
        }
      }
    }
    return chatMessage
  }

  async checkCheckResult(ev) {
    let path = ev.currentTarget.dataset.ability
    let abilityLabel = this.deep_value(this, path.replace('mod', 'label'))
    let mod = this.deep_value(this, path)
    let lckMod = Math.floor(this.deep_value(this, 'system.abilities.lck.mod') / 2)
    let dc = ev.currentTarget.dataset.dc
    const roll = new Roll(`d20+${mod}+-@penaltyTotal+${lckMod}`, this.getRollData())
    await roll.evaluate()
    let rollContent = ''
    if (typeof Number(dc) == 'number') {
      if (roll._total > dc) {
        rollContent += await this.getConsequence(true, ev.currentTarget.dataset.condition)
      } else {
        rollContent += await this.getConsequence(false, ev.currentTarget.dataset.condition)
      }
    } else {
      rollContent += 'Could not evaluate success or failure. Apply consequence manually.'
    }
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${this.name} rolls a ${abilityLabel} Check, DC ${dc} for ${ev.currentTarget.dataset.condition}. <p>${rollContent}</p"`,
      rollMode: game.settings.get('core', 'rollMode'),
    })
  }

  //Consume item
  async lowerInventory(itemId) {
    let pack = game.packs.find((p) => p.metadata.name == 'conditions')
    const item = this.items.get(itemId)
    const updatedQty = item.system.quantity - 1
    let mods = { 'system.quantity': updatedQty }
    const description = item.system.description
    let details = description
    let chatContent = ``
    if (item.type != 'explosive') {
      if (item.type == 'food-and-drinks' || item.type == 'chems') {
        details = description.replace('<p>', "<p>It's ")
      }
      //Add reactions (custom effects with instantaneous results)
      if (typeof item.system.modifiers != 'undefined') {
        if (item.system.modifiers.path1 != '' && item.system.modifiers.value1 != '') {
          chatContent +=
            'Adjusted ' +
            (await this.addCustomEffect(
              item.system.modifiers.path1,
              item.system.modifiers.modType1,
              item.system.modifiers.value1,
            ))
        }
        if (item.system.modifiers.path2 != '' && item.system.modifiers.value2 != '') {
          chatContent +=
            ', ' +
            (await this.addCustomEffect(
              item.system.modifiers.path2,
              item.system.modifiers.modType2,
              item.system.modifiers.value2,
            ))
        }
        if (item.system.modifiers.path3 != '' && item.system.modifiers.value3 != '') {
          chatContent +=
            ', ' +
            (await this.addCustomEffect(
              item.system.modifiers.path3,
              item.system.modifiers.modType3,
              item.system.modifiers.value3,
            ))
        }
        if (item.system.modifiers.path4 != '' && item.system.modifiers.value4 != '') {
          chatContent +=
            ', ' +
            (await this.addCustomEffect(
              item.system.modifiers.path4,
              item.system.modifiers.modType4,
              item.system.modifiers.value4,
            ))
        }
      }

      //Add effects according to endurance VALUE
      if (this.system.abilities.end.value > 4) {
        //Endurance above or equal to 5
        if (description.includes('qT3KhtuyrbnpNfWy')) {
          //Highproof as a consumable condition
          chatContent += `You can hold your liquor! (End>4)<br><br>Still, you're `
          chatContent += await this.applyDrunkness('Drunk', this)
        }
        if (description.includes('o18dhjwLVVjGaCQR')) {
          //Alcoholic as a consumable condition
          chatContent += `You can hold your liquor! (End>4)<br><br>Still, you're `
          chatContent += await this.applyDrunkness('Buzzed', this)
        }
        if (description.includes('HcvGeJhIRhCECZQ8')) {
          //Putrid as a consumable condition
          chatContent += `That was discusting! (End>4)<br><br>But... you're fine.`
        }
      } else {
        // Endurance below or equal to 4
        if (description.includes('qT3KhtuyrbnpNfWy')) {
          //Highproof as a consumable condition
          chatContent += `You've had one too many! (End<5)<br><br>You're now `
          chatContent += await this.applyDrunkness('Hammered', this)
        }
        if (description.includes('o18dhjwLVVjGaCQR')) {
          //Alcoholic as a consumable condition
          chatContent += `You've had one too many! (End>5)<br><br>You're now `
          chatContent += await this.applyDrunkness('Drunk', this)
        }
        if (description.includes('HcvGeJhIRhCECZQ8')) {
          //Putrid as a consumable condition
          chatContent += `You throw up a little. (End<5)<br><br>And... you're `
          chatContent += await this.applyDrunkness('Poisoned', this)
        }
      }

      //Check for Snack
      let snacks = {}
      if (description.includes('2VO3ajTiEcRzHaS9')) {
        if (this.system.penalties.snack == 0) {
          Object.assign(snacks, { 'system.penalties.snack': 1 })
          console.log('Need one more snack!')
        } else {
          let hunger = Math.max(this.system.penalties.hunger.base - 1, 0)
          Object.assign(snacks, {
            'system.penalties.snack': 0,
            'system.penalties.hunger.base': hunger,
          })
        }
        await this.update(snacks)
      }

      //Add active effects from each condition present on the consumable
      let descSplit = description.split(' ')
      let strSplit, newCondition, itemEf, actorEf
      let actorEffects = this.items
      for (var str of descSplit) {
        if (str.includes('uuid')) {
          //Example : data-uuid="Compendium.arcane-arcade-fallout.${compendium}.Item.${myItem._id}"
          strSplit = str.replace(/"/g, '').split('.')
          newCondition = await pack.getDocument(strSplit[strSplit.length - 1])
          if (newCondition) {
            let i = 0
            if (
              await actorEffects.find((e) => e.name == newCondition.name && e.type == 'condition')
            ) {
              //if condition exists on actor
              actorEf = await actorEffects.get(
                actorEffects.find((e) => e.name == newCondition.name && e.type == 'condition')._id,
              )
              const itemEffects = actorEf.collections.effects.contents
              const qty = actorEf.system.quantity
              while (i < itemEffects.length) {
                //IF levels of effects are present, it will upgrade according to quantity.
                itemEf = await actorEf.effects.get(itemEffects[i]._id)
                if (Number(itemEf.name.slice(-1)) == qty + 1) {
                  await actorEf.update({ 'system.quantity': qty + 1 })
                  let j = 0
                  let otherEffect
                  while (j < itemEffects.length) {
                    otherEffect = await actorEf.effects.get(itemEffects[j]._id)
                    await otherEffect.update({ disabled: true })
                    j++
                  }
                  await itemEf.update({ disabled: false })
                }
                i++
              }
            } else {
              // condition is not on actor, create it
              if (
                newCondition.collections.effects.contents.filter((e) => e.disabled == false)
                  .length > 0
              ) {
                //Create it if it has active effects
                let addedCondition = await Item.create(newCondition, { parent: this })
                //Modify Effects to get the @ values
                if (addedCondition) {
                  let newArray
                  for (var ef of addedCondition.effects) {
                    newArray = ef.changes
                    for (var change of newArray) {
                      if (change.value.includes('@')) {
                        change.value = await this.evaluateAtFormula(change.value)
                      }
                    }
                    await ef.update({ changes: newArray })
                  }
                }
              }
            }
          }
        }
      }

      //Ask for checks if item says so.
      if (typeof item.system.checks != 'undefined') {
        if (item.system.checks.check1 != '' && item.system.checks.dc1 != '') {
          chatContent += await this.askForCheck(
            item.system.checks.check1,
            item.system.checks.dc1,
            item.system.checks.condition1,
          )
        }
        if (item.system.checks.check2 != '' && item.system.checks.dc2 != '') {
          chatContent += await this.askForCheck(
            item.system.checks.check2,
            item.system.checks.dc2,
            item.system.checks.condition2,
          )
        }
        if (item.system.checks.check3 != '' && item.system.checks.dc3 != '') {
          chatContent += await this.askForCheck(
            item.system.checks.check3,
            item.system.checks.dc3,
            item.system.checks.condition3,
          )
        }
      }
      //Finally update the item quantity
      await item.update(mods)
      //Add event listener for eventual Check button in Chat
      Hooks.once('renderChatMessage', (chatItem, html) => {
        html.find('#askForRoll').click((ev) => {
          this.checkCheckResult(ev)
        })
      })
      //Send "Ask for Check" Button to Chat
      let chatData = {
        author: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: chatContent,
        flavor: `Consumed ${item.name} : ${details}`,
      }
      ChatMessage.create(chatData, {})
      Hooks.once()
    }
  }

  combatexpandetoggle() {
    const currentState = this.system.combatActionsexpanded
    if (currentState == true) {
      this.update({ 'system.combatActionsexpanded': false })
    } else if (currentState == false) {
      this.update({ 'system.combatActionsexpanded': true })
    } else {
      return
    }
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

  //Handle irradiation from custom effects
  async handleIrradiated(field, fieldvalue, addValue) {
    //Make sure radiation goes up at 10
    var i = 0
    if (addValue > 0) {
      while (i < addValue) {
        await this.fieldaddition(field, fieldvalue)
        i++
      }
    } else {
      while (i > addValue) {
        await this.fieldsubtraction(field, fieldvalue)
        i--
      }
    }
  }

  //add to a field
  async fieldaddition(field, fieldvalue) {
    const newValue = Number(fieldvalue) + 1
    //Irradiated and Radiation Updates
    if (field === 'system.irradiated' && newValue == 10) {
      const newRads = this.system.penalties.radiation.base + 1
      this.update({ 'system.penalties.radiation.base': newRads, 'system.irradiated': 0 })
      return
    } else {
      // Update Field Value
      this.update({ [field]: newValue })
    }
  }

  async fieldsubtraction(field, fieldvalue) {
    const newValue = Number(fieldvalue) - 1
    //Irradiated and Radiation Updates
    if (field === 'system.irradiated' && newValue == -1) {
      const newRads = this.system.penalties.radiation.base - 1
      this.update({ 'system.penalties.radiation.base': newRads, 'system.irradiated': 9 })
      return
    } else {
      this.update({ [field]: newValue })
    }
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
    } else if (operator === 'minus') {
      newAction = this.system.actionPoints.value - 1
    } else {
      return
    }
    this.update({ 'system.actionPoints.value': newAction })
  }

  /**
   *
   * @param {number} cost
   * @returns true if successful or false if not enough AP
   */
  applyApCost(cost) {
    const currentAP = this.system.actionPoints.value
    const newAP = Number(currentAP) - Number(cost)
    if (newAP < 0) {
      ui.notifications.warn(`You don't have enough AP to perform this action!`)
      return false
    }
    this.update({ 'system.actionPoints.value': newAP })
    return true
  }

  //Add any stat with modifiers
  statAddition(stat, statType = '') {
    const actor = this.system
    let statField = 'system.' + stat + '.base'
    if (statType != '') {
      statField = 'system.' + statType + '.' + stat + '.base'
    }
    const newStatBase = this.deep_value(this, statField) + 1
    this.update({ [statField]: newStatBase })
  }

  //Subtract any stat with modifiers
  statSubtraction(stat, statType = '') {
    const actor = this.system
    let statField = 'system.' + stat + '.base'
    if (statType != '') {
      statField = 'system.' + statType + '.' + stat + '.base'
    }
    const newStatBase = this.deep_value(this, statField) - 1
    this.update({ [statField]: newStatBase })
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
    let newAP
    if (this.system.actionPoints.recover == 'full') {
      newAP = this.system.actionPoints.value
    } else {
      if (this.system.actionPoints.recover == 'none') {
        newAP = 0
      } else {
        newAP = Math.floor(this.system.actionPoints.value / 2)
      }
    }
    let maxForCalcs
    if (this.system.actionPoints.dazed == 1) {
      maxForCalcs = Math.floor(this.system.actionPoints.max / 2)
    } else {
      maxForCalcs = this.system.actionPoints.max
    }
    let RecycledAP = newAP + maxForCalcs + this.system.actionPoints.temp
    let currentMax = Math.max(15, this.system.actionPoints.boostMax)
    if (RecycledAP <= currentMax) {
      this.update({ 'system.actionPoints.value': RecycledAP })
    } else {
      this.update({
        'system.actionPoints.value': currentMax,
      })
    }
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
      title: 'Swap Ammunition',
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
      const energyWeapon = currentType.includes("Core") || currentType.includes("Fuel") || currentType.includes("Cell") || currentType.includes("Energy") || currentType.includes("2mm EC")
      if (currentItem) {
        const currentQty = currentItem.system.quantity + currentMag
        if (!energyWeapon) {
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

    // Manually Reloaded?
    const manualReload = weapon.system.description.includes('Manual Reload')

    // Do you have the AP?
    let apCost = 6
    if (manualReload) {
      apCost = 1
    }
    const newAP = this.system.actionPoints.value - apCost
    if (newAP < 0) {
      ui.notifications.warn(`Not enough action points to reload`)
      return
    }

    // Collect Required Ammo Information
    const ammoType = weapon.system.ammo.assigned
    const ammoFound = this.items.find((item) => item.name === ammoType)
    const energyWeapon = ammoType.includes("Core") || ammoType.includes("Fuel") || ammoType.includes("Cell") || ammoType.includes("Energy") || ammoType.includes("2mm EC")

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
    let capacity = weapon.system.ammo.capacity.max

    // Already Reloaded?
    if (currentMag == capacity) {
      ui.notifications.warn(`Weapon capacity is already at max`)
      return
    }

    // Reload The Weapon
    let ammoReloaded = capacity - currentMag
    let updatedAmmo = ammoOwned - ammoReloaded
    if (ammoReloaded > ammoOwned && !energyWeapon) {
      const ammoAvailable = currentMag + ammoOwned
      this.updateEmbeddedDocuments('Item', [
        { _id: weaponId, 'system.ammo.capacity.value': ammoAvailable },
      ])
    } else {
      if (manualReload) {
        capacity = currentMag + 1
      }
      this.updateEmbeddedDocuments('Item', [
        { _id: weaponId, 'system.ammo.capacity.value': capacity },
      ])
    }

    // Energy Weapon Reload Rules
    if (energyWeapon || manualReload) {
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

  //check which Actor wishes to Craft, from a particular item
  checkCraftActor(myItem){
    let playerID = game.user._id
    //Get owned actors
    let actorsList = game.actors.filter(a => a.type == "character").filter(a => a.ownership[playerID] == 3)
    let myActorName = actorsList[0].name
    if (actorsList == 1){
      this.checkIfCanCraft(myActorName, myItem)
    } 
    else {
      let dialogContent = `Who wants to craft ${this.formatCompendiumItem(myItem.type,myItem.name,"click for details").replace("<br>","").replace(`<i class="fas fa-suitcase"></i>`,``).replace(`draggable="true"`,`draggable="false"`)}?
      <br><br><select style="padding-left:20px" name="actorSelect" id = "actorSelect">`
      for (var actor of actorsList){
        dialogContent += `<option value='${actor.name}'>${actor.name}</option>`
      }
      dialogContent += `</select><br>`
      let d = new Dialog(
        {
          title: 'Who wants to craft this item?',
          content: dialogContent,
          buttons: {
            Yes: {
              icon: '<i class="fas fa-check"></i>',
              label: 'Okie-Dokie!',
              callback: async () => {
                this.checkIfCanCraft(myActorName, myItem)
              },
            },
            No: {
              icon: '<i class="fa-solid fa-x"></i>',
              label: 'Nope!',
              callback: async () => {},
            },
          },
          default: 'No',
          render: (html) => {
            html.find('[name=actorSelect]').change(function () {
              myActorName = this.value
            })
          },
        },
        {
          width: 500,
        },
      )
      d.render(true)
    }
  }

async getItemCraftingData(html,myActor,myItem){
  let myPaths = FalloutZeroItem.prototype.flattenObject(myItem.system.crafting)
  let itemNameBox = document.getElementById("itemName")
  itemNameBox.innerText = myItem.name
  let goodCraft = document.getElementById("goodCraft")
  goodCraft.style = "color:green;visibility:visible"
  let rollCraft = document.getElementById("rollCraft")
  rollCraft.style = "color:yellow;visibility:visible"
  let freeCraft = document.getElementById("freeCraft")
  for (var currentPath of Object.keys(myPaths)){
    let actorValues = {value:0,shown:false, style:"visibility:hidden;"}
    let myElement = document.getElementById(myPaths[currentPath].path)
    if (myElement){
      if (myPaths[currentPath].value != "" && myPaths[currentPath].value != 0){
        actorValues = await FalloutZeroActor.prototype.getActorCraftingData(myActor, myPaths, currentPath)
        if (actorValues.shown) {
          myElement.innerText = myPaths[currentPath].value + " (" + actorValues.value + ")"
          myElement.title = "Selected character's current values in brackets"
          if (Number(myPaths[currentPath].value) > Number(actorValues.value)) {
            goodCraft.style = "color:green;visibility:hidden"
            rollCraft.style = "color:yellow;visibility:hidden"
            freeCraft.style = "color:red;visibility:visible"
          }
        }
        else {
          myElement.innerText = myPaths[currentPath].value 
        } 
      } 
      else {
        myElement.innerText = ""
      }
      myElement.style = actorValues.style
    }
  }
  let titleElements = document.getElementsByClassName("tt")
  for (var el of titleElements){
    el.style ="visibility:visible;border:1px solid white"
  }
}

async getActorCraftingData(myActor,myPaths,currentPath){
  let greenBackground = "visibility:visible;background-color:rgba(0, 255, 0, 0.1);"
  let redBackground = "visibility:visible;background-color:rgba(255, 0, 0, 0.1);"
  let generalBackground = "visibility:visible;background-color:rgba(0, 0, 0, 0.1);border:1px solid white;"
  let fullPath = myPaths[currentPath].path
  let splitPath = fullPath.split(".")
  let matIndex = await splitPath[0].replace(/[^0-9]/g,"")
  let matReq, actorItem, newPath
  let actorValues = {value:0, shown:false, style:redBackground}
  switch (fullPath){
    case "craftingDC":
      actorValues.value = "+" + myActor.system.skills.crafting.value
      myPaths[currentPath].value.includes("Science")? actorValues.value += "|+" + myActor.system.skills.science.value : actorValues.value = actorValues.value
      myPaths[currentPath].value.includes("Explosives")? actorValues.value += "|+" + myActor.system.skills.explosives.value : actorValues.value = actorValues.value
      actorValues.shown = true
      actorValues.style = generalBackground
      break;
    case `matsReq${matIndex}.mat`:
      matReq = await myPaths.find(p => p.path == `matsReq${matIndex}.qty`).value
      actorItem = await myActor.items.find(i => i.name == myPaths[currentPath].value)
      if (actorItem){
        actorValues.value = actorItem.system.quantity
        if (Number(actorValues.value) >= matReq) {
          actorValues.style = greenBackground;
        }
      }
      break;
    case `matsReq${matIndex}.qty`:
      matReq = await myPaths.find(p => p.path == `matsReq${matIndex}.mat`).value
      actorItem = await myActor.items.find(i => i.name == matReq)
      actorValues.shown = true;
      if (actorItem){
        actorValues.value = actorItem.system.quantity
        if (Number(actorValues.value) >= myPaths[currentPath].value) {
          actorValues.style = greenBackground;
        }
      }
      break;
    default :
      actorValues.style = generalBackground;
      break;
  }
  return actorValues
}

  //Craft an item
  async checkIfCanCraft(myActorName, myItem=""){
    let myActor = game.actors.filter(a => a.type == "character").find(a => a.name == myActorName)
    let d = new Dialog(
      {
        title: 'Crafting?',
        content: {},
        buttons: {
          Yes: {
            icon: '<i class="fas fa-check"></i>',
            label: 'Okie-Dokie!',
            callback: async () => {
              console.log(
                document.getElementById('itemSelect').value
              )
            },
          },
          No: {
            icon: '<i class="fa-solid fa-x"></i>',
            label: 'Nope!',
            callback: async () => {},
          },
        },
        default: 'No',
        render: (html) => {
          let packsList = ["ammunition","armor","chems","explosives","food-and-drinks","melee-weapons","rangedweapons","material","miscellaneous"]
          let packSelect = document.getElementById('packSelect')
          let itemSelect = document.getElementById('itemSelect');
          let itemsLists = {}
          let itemsList = []
          for (var pack of packsList){
            packSelect.options[packSelect.options.length] = new Option(pack, pack);
            itemsList = []
            try {
              itemsList = game.packs.find(p => p.metadata.name == pack).tree.entries
            } catch {
              console.log(pack)
              alert("There is a system compendium missing. Please reinstal system.")
              break
            }
            Object.assign(itemsLists,{[pack]:itemsList})
          }
          if (myItem != ""){
            //Set right Pack
            let initialPack = FalloutZeroActor.prototype.getPackFromType(myItem.type)
            packSelect.value = initialPack
            //Set right Item with ID from compendium
            let pack = this.getPackFromType(myItem.type)
            let myPack = game.packs.find(p => p.metadata.name == pack)
            let myPackItemId = myPack.tree.entries.find(i => i.name == myItem.name)
            itemSelect.options[itemSelect.options.length] = new Option(myItem.name, myPackItemId._id)
            itemSelect.value = myPackItemId._id
            FalloutZeroActor.prototype.getItemCraftingData(html,myActor,myItem)
          }
          //Selecting a compendium from dropdown
          html.find('[name=packSelect]').change(async function () {
            itemsList = itemsLists[this.value]
            itemSelect.innerHTML = '';
            let myPack = game.packs.find(p => p.metadata.name == this.value)
            let itemData
            //Get the list of items from pack
            for (var item of itemsList){
              itemData = await myPack.getDocument(item._id)
              if (itemData.system.crafting.matsReq1.mat != '' && itemData.system.crafting.matsReq1.qty != 0){
                itemSelect.options[itemSelect.options.length] = new Option(item.name, item._id);
              }
            }
            let itemToCraft = await myPack.getDocument(document.getElementById('itemSelect').value) //ID is the value
            FalloutZeroActor.prototype.getItemCraftingData(html,myActor,itemToCraft)
          })
          //Selecting an item from dropdown
          html.find('[name=itemSelect]').change(async function () {
            let myPack = game.packs.find(p => p.metadata.name == document.getElementById('packSelect').value)
            let itemToCraft = await myPack.getDocument(this.value) //ID is the value
            FalloutZeroActor.prototype.getItemCraftingData(html,myActor,itemToCraft)
          })
          //Forcing a free Craft
          html.find('[id=freeCraft]').click(async function () {
            let myPack = game.packs.find(p => p.metadata.name == document.getElementById('packSelect').value)
            let itemToCraft = await myPack.getDocument(document.getElementById('itemSelect').value) //ID is the value
            await FalloutZeroActor.prototype.craftItem(itemToCraft,myActor,"freeCraft")
            FalloutZeroActor.prototype.getItemCraftingData(html,myActor,itemToCraft)
          })
          //Crafting from Materials (TO COME!)
          html.find('[id=goodCraft]').click(async function () {
            let myPack = game.packs.find(p => p.metadata.name == document.getElementById('packSelect').value)
            let itemToCraft = await myPack.getDocument(document.getElementById('itemSelect').value) //ID is the value
            await FalloutZeroActor.prototype.craftItem(itemToCraft,myActor,"goodCraft")
            FalloutZeroActor.prototype.getItemCraftingData(html,myActor,itemToCraft)
          })
        },
      },
      {
        template: 'systems/arcane-arcade-fallout/templates/actor/dialog/crafting.hbs',
        width: 500,
        height: 500,
        resizable: true,
      },
    )
    d.render(true)
  }

  //Craft the item
  async craftItem(itemToCraft, myActor, craftType){
    let newQty, itemLink
    let chatContent = ``
    if (craftType == "goodCraft"){
      for (var mats of Object.keys(itemToCraft.system.crafting)){
        if (mats.includes ("matsReq")){
          let matQty = itemToCraft.system.crafting[mats].qty
          let mat = itemToCraft.system.crafting[mats].mat
          let existingMat = myActor.items.find((u) => u.name.toLowerCase() == mat.toLowerCase())
          if (matQty > 0 && existingMat){
            newQty = Number(existingMat.system.quantity) - Number(matQty)
            await existingMat.update({ 'system.quantity': newQty })
            itemLink = this.formatCompendiumItem(existingMat.type,mat,'Removed from inventory.').replace(`<i class="fas fa-suitcase"></i>`,``).replace(`draggable="true"`,`draggable="false"`)
            chatContent += `${Number(matQty)}x ${itemLink}`
          }
        }
      }
    } else {
      chatContent = `Nothing! (player chose free crafting)<br>`
    }
    let qtyToCraft = itemToCraft.system.crafting.multiple.qty
    //Adjust quantity or create item
    let itemInInventory = myActor.items.find((u) => u.name.toLowerCase() == itemToCraft.name.toLowerCase())
    if (itemInInventory) {
      await itemInInventory.update({ 'system.quantity': itemInInventory.system.quantity + qtyToCraft})
    } 
    else {
      let newItem = await Item.create(itemToCraft, { parent: myActor })
      await newItem.update({'system.quantity': qtyToCraft})
    }
    
    //Add quantity of items if > 1 and look for item before creating
    itemLink = this.formatCompendiumItem(itemToCraft.type,itemToCraft.name,'Added to inventory.').replace(`<i class="fas fa-suitcase"></i>`,``).replace(`draggable="true"`,`draggable="false"`)
    let myGM = game.users.find(u => u.role == 4)
    //Add any more item types we want to make breakable.
    let chatData = {
      author: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      flavor: `${qtyToCraft}x ${itemLink.replace("<br>","")} crafted from:`,
      content: chatContent.slice(0,-4),
      whisper: myGM._id,
    }
    ChatMessage.create(chatData, {})
    
  }


  //Convert junk to Materials as per item stats
  async convertJunkToMat(item, mats, qty, myActor) {
    let compendium = game.packs.find((u) => u.metadata.name == 'material')
    console.log(compendium)
    let matData, existingMat, newQuantity, itemLink
    let material, chatContent, qtyMat
    if (item.type == "ammo") {
      qtyMat = Number(qty) / 5
    } else {
      qtyMat = Number(qty)
    }
    var i = 0
    chatContent = ``
    
    // Create item or add quantity if existing
    while (i < mats.length) {
      material = mats[i][1].trim()
      itemLink = this.formatCompendiumItem('material',material,'Added to inventory.').replace(`<i class="fas fa-suitcase"></i>`,``).replace(`draggable="true"`,`draggable="false"`)
      chatContent += `${Number(mats[i][0]) * Number(qtyMat)}x ${itemLink}`
      matData = compendium.tree.entries.find((u) => u.name.toLowerCase() == material.toLowerCase())
      existingMat = myActor.items.find((u) => u.name.toLowerCase() == mats[i][1].toLowerCase())
      if (existingMat) {
        newQuantity = Number(existingMat.system.quantity) + Number(mats[i][0]) * Number(qtyMat)
        existingMat.update({ 'system.quantity': newQuantity })
      } else {
        let newItem = await Item.create(matData, { parent: myActor })
        newItem.update({ 'system.quantity': Number(mats[i][0]) * Number(qtyMat) })
      }
      i++
    }
    //Adjust quantity or delete
    if (item.system.quantity != qty) {
      item.update({ 'system.quantity': item.system.quantity - qty })
    } else {
      item.delete()
    }
    itemLink = this.formatCompendiumItem(item.type,item.name,'Removed from inventory.').replace(`<i class="fas fa-suitcase"></i>`,``).replace(`draggable="true"`,`draggable="false"`)
    let myGM = game.users.find(u => u.role == 4)
    //Add any more item types we want to make breakable.
    let chatData = {
      author: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      flavor: `${qty}x ${itemLink.replace("<br>","")} broken down into:`,
      content: chatContent.slice(0,-4),
      whisper: myGM._id,
    }
    ChatMessage.create(chatData, {})
  }

  //Material conversion dialog
  checkConvert(itemID, myActor=this) {
    let item = myActor.items.find((u) => u._id == itemID)
    let initialQty = item.system.quantity
    let qtyOptions = []
    let dialogContent = ``
    let mats = []
    let matName
    let qty = 1
    let valid = true
    let itemName = this.formatCompendiumItem(
      item.type,
      item.name,
      'This will remove this item from inventory.',
    ).slice(0, -4).replace(`<i class="fas fa-suitcase"></i>`,``).replace(`draggable="true"`,`draggable="false"`)
    var i = 1
    if (item) {
      dialogContent = `Are you sure you want to convert ${itemName} into the following materials? <br><br>`
      while (i < Object.keys(item.system.junk).length / 2) {
        if (item.system.junk['quantity' + i] != 0) {
          matName = this.formatCompendiumItem(
            'material',
            item.system.junk['type' + i],
            'Material for Crafting',
          ).replace(`<i class="fas fa-suitcase"></i>`,``).replace(`draggable="true"`,`draggable="false"`)
          if (matName.includes("data-link")){
            dialogContent +=
            `x<b name='qty'>${item.system.junk['quantity' + i]}</b> ` +
            matName +
            `<br>`
          } else {
            dialogContent +=
            `x<b name='qty'>${item.system.junk['quantity' + i]}</b> ` + matName.replace("<br>","") + `<b> <-Check spelling for this mat and try again.</b><br><br>`
            valid = false
            alert("One of the components may not be spelled correctly and will not convert.")
          }
          mats.push([item.system.junk['quantity' + i], item.system.junk['type' + i]])
        }
        i++
      }
      if (initialQty > 1) {
        dialogContent += `<br> How many ${itemName} do you want to convert? <br><br>
        <select style="padding-left:20px" name="matQtyOpt" id = "matQtyOpt">`
        if (item.type == "ammo"){
          qty = 5
          dialogContent = dialogContent.replace('to convert', 'to convert packs of 5x ')
          i = 5
          while (i < Number(initialQty) + 1) {
            dialogContent += `<option value='${i}'>${i}</option>`
            qtyOptions.push(i)
            i += 5
          }
        } 
        else {
          dialogContent = dialogContent.replace('materials?', 'materials, each?')
          i = 1
          while (i < Number(initialQty) + 1) {
            dialogContent += `<option value='${i}'>${i}</option>`
            qtyOptions.push(i)
            i++
          }
        }
        
        dialogContent += `</select><br>`
      }
      dialogContent += `<h4> This process is irreversible. This action may require tools or a bench. Consult your GM first.</h4>`
    }
    let d = new Dialog(
      {
        title: 'Breakdown or not?',
        content: dialogContent,
        buttons: {
          Yes: {
            icon: '<i class="fas fa-check"></i>',
            label: 'Okie-Dokie!',
            disabled: !valid,
            callback: async () => {
              this.convertJunkToMat(item, mats, qty, myActor)
            },
          },
          No: {
            icon: '<i class="fa-solid fa-x"></i>',
            label: 'Nope!',
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
        table = await this.findTable(match[1])
        if (table) {
          myLoot += await this.rollMyTable(table)
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
      author: game.user._id,
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
    } else {
      // ask for character and player if none selected
      this.pcLuckDialog()
    }
  }

  formatDice(formula) {
    return `<a class="inline-roll roll" data-mode="roll" data-flavor="" data-tooltip="Click to roll" data-formula=${formula}><i class="fas fa-dice-d20" ></i>${formula}</a class="roll">`
  }

  //Compendium can be either the pack's name or the item type
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
      if (compendiumObject){
        myItem = compendiumObject.tree.entries.find(
          (u) => u.name.toLowerCase() == itemName.toLowerCase(),
        )
      }
      if (myItem) {
        return `<a class="content-link"  draggable="true" data-link data-uuid="Compendium.arcane-arcade-fallout.${compendium}.Item.${myItem._id}" 
          data-id="${myItem._id}" data-type="Item" data-pack="arcane-arcade-fallout.${compendium}" data-tooltip="${myTooltip}"><i class="fas fa-suitcase"></i>${itemName}</a><br>`
      } 
      else {
        compendium = this.getPackFromType(compendium)
        compendiumObject = game.packs.find((u) => u.metadata.name == compendium)
        myItem = compendiumObject.tree.entries.find(
          (u) => u.name.toLowerCase() == itemName.toLowerCase(),
        )
        if (myItem) {
          return `<a class="content-link"  draggable="true" data-link data-uuid="Compendium.arcane-arcade-fallout.${compendium}.Item.${myItem._id}" 
          data-id="${myItem._id}" data-type="Item" data-pack="arcane-arcade-fallout.${compendium}" data-tooltip="${myTooltip}"><i class="fas fa-suitcase"></i>${itemName}</a><br>`
        } 
        else {
          return `${itemName}<br>`
        }
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
    ui.notifications.notify(totLckMod)
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

  getPackFromType(itemType){
    let compendium
    switch (itemType) {
      case "ammo" : compendium = "ammunition" 
      break
      case "armor" : compendium = "armor" 
      break
      case "armorUpgrade" : compendium = "upgrades" 
      break
      case "weaponUpgrade" : compendium = "upgrades" 
      break
      case "background" : compendium = "background" 
      break
      case "chem" : compendium = "chems" 
      break
      case "condition" : compendium = "conditions" 
      break
      case "explosive" : compendium = "explosives" 
      break
      case "foodAnddrink" : compendium = "food-and-drinks" 
      break
      case "meleeWeapon" : compendium = "melee-weapons" 
      break
      case "rangedWeapon" : compendium = "rangedweapons" 
      break
      case "junkItem" : compendium = "junk" 
      break
      case "material" : compendium = "material" 
      break
      case "miscItem" : compendium = "miscellaneous" 
      break
      case "perk" : compendium = "perks" 
      break
      case "powerArmor" : compendium = "armor" 
      break
      case "property" : compendium = "property" 
      break
      case "trait" : compendium = "traits" 
      break
    }
    return compendium
  }

  async determineNpcLoot(myActor, whisper, playerName) {
    const npcName = this.name
    let dcLoot, whisperUser
    if (game.users.find((u) => u.name == playerName)) {
      whisperUser = game.users.find((u) => u.name == playerName)._id
    }
    let totLckMod = ''
    let BeenThereDoneThat = game.actors
      .find((u) => u.name == myActor)
      .items.find((i) => i.name == 'Been There Done That.')
    BeenThereDoneThat
      ? (totLckMod = game.actors.find((u) => u.name == myActor).system.abilities.lck.mod + 3)
      : (totLckMod = game.actors.find((u) => u.name == myActor).system.abilities.lck.mod)
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
        { flavor: myConcatenatedLoot, author: game.users.find((u) => u.name == playerName) },
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
        for (var loot of inventoryLoot) {
          myConcatenatedLoot = myConcatenatedLoot.slice(0, -4) + ' ' + this.formatCompendiumItem(loot.type, loot.name)
        }
      }
      let chatData = {
        author: game.user._id,

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

  // Get skill value or base + modifiers
  getSkillBonus(skill) {
    try {
      if (this.type === 'character') {
        return this.system.skills[skill].base + this.system.skills[skill].modifiers
      } else {
        return this.system.skills[skill].value
      }
    } catch (error) {
      console.error(error)
      ui.notifications.warn('Failed to get skill bonus')
    }
  }

  getAbilityMod(ability) {
    return this.system.abilities[ability].mod
  }
  getAttackBonus() {
    return this.system.attackBonus
  }
  getDamageBonus() {
    return this.system.damageBonus
  }

  hasKarmaCapAvailable() {
    if (this.type !== 'character' || this.system.karmaCaps.length === 0) return false

    return this.karmaCapsAvailable()
  }

  karmaCapsAvailable() {
    if (this.type !== 'character') return 0
    return this.system.karmaCaps.filter((flipped) => flipped).length
  }

  flipLastKarmaCap() {
    const capIdx = this.system.karmaCaps.findIndex((flipped) => flipped)
    if (capIdx < 0) {
      throw new Error('Actor has no karma caps available')
    }
    this.system.karmaCaps[capIdx] = false
    this.update({ 'system.karmaCaps': this.system.karmaCaps })
  }

  getPerks() {
    return this.items.filter((item) => item.type === 'perk')
  }

  sortTable(tableID) {
    var table, rows, switching, col, i, x, y, shouldSwitch;
    table = document.getElementById(tableID);
    switching = true;
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
      // Start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /* Loop through all table rows (except the
      first, which contains table headers): */
      for (i = 2; i < (rows.length - 1); i++) {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        tableID == "junkTable"? col = 1 : col = 0
        x = rows[i].getElementsByTagName("TD")[col];
        y = rows[i + 1].getElementsByTagName("TD")[col];
        // Check if the two rows should switch place:
        if (x.children[0].children[0].innerHTML.toLowerCase() > y.children[0].children[0].innerHTML.toLowerCase()) {
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  }
}
