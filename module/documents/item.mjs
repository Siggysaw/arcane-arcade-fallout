import AttackRoll from '../dice/attack-roll.mjs'
// Extends the basic Item with some very simple modifications.

const nonStackableTypes = [
  'armorUpgrade',
  'armor',
  'rangedWeapon',
  'meleeWeapon',
  'powerArmor'
]
export default class FalloutZeroItem extends Item {
  /** Augments the basic Item data model with additional dynamic data. */
  prepareData() {
    // Items can override data-preparation methods (e.g. prepareBaseData()) like actors.
    super.prepareData()
  }
  //Get list of upgrades for item type
  async getUpgradeList(tag) {
    let upgrade, opt
    if (tag.childElementCount < 3) {
      tag.removeChild(tag.lastElementChild)
      const upgradeOptions = game.packs.find((p) => p.metadata.name == 'upgrades')
      if (upgradeOptions) {
        for (var packItem of upgradeOptions.tree.entries) {
          upgrade = await upgradeOptions.getDocument(packItem._id)
          if (upgrade.system.upgradeType == tag.getAttribute('data-itemType')) {
            opt = document.createElement('option')
            opt.value = upgrade.name
            opt.innerHTML = upgrade.name
            tag.appendChild(opt)
          }
        }
      }
    }
  }

  flattenObject(obj, ancestors = []) {
    if (typeof obj !== 'object' || obj === null) {
      return []
    }
    if (ancestors.includes(obj)) {
      return []
    }
    let paths = []
    for (let key in obj) {
      if (key === 'parent') continue
      let val = obj[key]
      if (typeof val === 'object' && val != null) {
        let subPaths = this.flattenObject(val, [...ancestors, obj])
        subPaths.forEach((e) => {
          paths.push({
            path: [key, e.path].join('.'),
            value: e.value,
          })
        })
      } else {
        //val = 0
        let path = { path: key, value: val }
        let pathTest = key.split('.')
        if (
          pathTest[pathTest.length - 1] != 'label' &&
          pathTest[pathTest.length - 1] != 'description' &&
          pathTest[pathTest.length - 1] != 'id' &&
          pathTest[pathTest.length - 1] != 'img' &&
          pathTest[pathTest.length - 1] != 'name' &&
          pathTest[pathTest.length - 1] != 'sort' &&
          pathTest[pathTest.length - 1] != 'type'
        ) {
          paths.push(path)
        }
      }
    }
    return paths
  }

  //Checks if reactions saved in the item, then refreshes selectors
  async checkSaveReactions(mySelectors, myData, saveMessage, myItem) {
    let isSaved = await myItem.update(myData)
    if (isSaved) {
      saveMessage.innerHTML = 'Attributes saved successfully.'
    } else {
      saveMessage.innerHTML = 'Could NOT save. Please make sure only one item sheet is open at a time, check values and try again.'
    }
    this.getMods(mySelectors, myItem)
  }

  //Get mods to update from selectors
  getMods(mySelectors, myItem) {
    for (var select of mySelectors) {
      let num = select.getAttribute('name').slice(-1)
      this.listModPaths(select)
      select.value = myItem.system.modifiers[`path${num}`]
    }
  }

  listModPaths(tag) {
    let opt
    const actor = game.actors.filter((a) => a.type == 'character')[0]
    let pathList = actor ? this.flattenObject(actor.system) : []
    if (pathList) {
      tag.removeChild(tag.lastElementChild)
      let myPaths = pathList.map((p) => `system.${p.path}`)
      myPaths.push('')
      for (var pathValue of myPaths.sort()) {
        if (
          !pathValue.startsWith('_') &&
          !pathValue.includes('overrides') &&
          !pathValue.includes('ownership')
        ) {
          opt = document.createElement('option')
          opt.value = pathValue
          opt.innerHTML = pathValue
          tag.appendChild(opt)
        }
      }
    }
  }

  //Display upgrade before addition
  async getMyItem(pack, id, myItem) {
    var cost = document.getElementById('upgradeCost')
    var details = document.getElementById('upgradeDetails')
    let myUpgrade = await pack.getDocument(id)
    let newCost
    if (typeof myUpgrade.system.baseCost == 'string') {
      newCost = await this.calcUpgradeCost(myUpgrade, myItem)
      if (myItem.type == 'rangedWeapon') {
        cost.innerHTML = `  (${newCost} &#13;&#10; caps)`
      } else {
        cost.innerHTML = `  (${newCost} caps)`
      }
    } else {
      cost.innerHTML = `  (${myUpgrade.system.baseCost} caps)`
    }

    details.innerHTML = `
    <a class="content-link" draggable="true" data-link data-uuid="${myUpgrade.uuid}"
      data-id="${myUpgrade._id}" data-type="Item" data-pack="arcane-arcade-fallout.upgrades" data-tooltip="Click for details">
    <i class="fas fa-suitcase">
    </i>${myUpgrade.name}
    </a>`
  }

  async checkUpgradeType(myItem, pack, id) {
    let myUpgrade = await pack.getDocument(id)
    if (myUpgrade.system.upgradeType == 'armor' || myUpgrade.system.upgradeType == 'powerArmor') {
      FalloutZeroArmor.prototype.checkUpgrade(myItem, pack, id)
    } else {
      this.checkUpgrade(myItem, pack, id)
    }
  }

  async calcUpgradeCost(myUpgrade, myItem) {
    if (myUpgrade.system.baseCost.includes('%')) {
      let percentage = myUpgrade.system.baseCost.split('%')
      if (myItem.system.baseCost == 0) {
        return Math.floor(Number(percentage[0]) * 0.01 * Number(myItem.system.cost), 2)
      } else {
        return Math.floor(Number(percentage[0]) * 0.01 * Number(myItem.system.baseCost), 2)
      }
    } else {
      return Number(myUpgrade.system.baseCost.split('c').join(''))
    }
  }

  // Gets the modifiers path and value for given select or input tags.
  updateCustomEffects(tags, path) {
    let myData = {}
    let mod, myKey
    for (var tag of tags) {
      mod = tag.getAttribute('name')
      myKey = `system.${path}.${mod}`
      Object.assign(myData, { [myKey]: tag.value })
    }
    return myData
  }

  //Check for upgrades for ranged and melee weapons  (armors are handled in armor.mjs because they are more complex)
  async checkUpgrade(weapon, pack, id) {
    let myUpgrade = await pack.getDocument(id)
    let myKey, comment
    let myData = {}
    let wasEquipped = weapon.system.itemEquipped
    let valid = false
    let newSlots = weapon.system.slots + myUpgrade.system.slots
    let newCost = weapon.system.cost + (await this.calcUpgradeCost(myUpgrade, weapon))
    if (newSlots > -1) {
      valid = true
    } else {
      comment = 'You do not have any slots left for this upgrade.'
    }
    if (valid) {
      for (var key of Object.keys(weapon.system.upgrades)) {
        if (weapon.system.upgrades[key].id == '') {
          //unequip
          if (wasEquipped) {
            await this.toggleEffects(weapon, true)
          }

          //add upgrade SCRIPT to be added when automated <----


          //await this.addUpgrade(weapon,myUpgrade);

          // Tags each effect with the source upgrade's id, for later removal.
          const effectsData = myUpgrade.effects.map((e) => {
            const obj = e.toObject()
            foundry.utils.setProperty(obj, `flags.${game.system.id}.sourceUpgradeId`, myUpgrade._id)
            return obj
          })
          await weapon.createEmbeddedDocuments('ActiveEffect', effectsData)

          //equip
          if (wasEquipped) {
            await this.toggleEffects(weapon, false)
          }
          //add upgrade to weapon
          if (weapon.system.baseCost == 0) {
            myKey = 'system.baseCost'
            Object.assign(myData, { [myKey]: Number(weapon.system.cost) })
          }
          myKey = 'system.cost'
          Object.assign(myData, { [myKey]: newCost })
          myKey = 'system.slots'
          Object.assign(myData, { [myKey]: newSlots })
          myKey = 'system.upgrades.' + key + '.id'
          Object.assign(myData, { [myKey]: myUpgrade._id })
          myKey = 'system.upgrades.' + key + '.name'
          Object.assign(myData, { [myKey]: myUpgrade.name })
          myKey = 'system.upgrades.' + key + '.img'
          Object.assign(myData, { [myKey]: myUpgrade.img })
          myKey = 'system.upgrades.' + key + '.rank'
          Object.assign(myData, { [myKey]: myUpgrade.system.slots })
          myKey = 'system.upgrades.' + key + '.description'
          let strippedString = myUpgrade.system.description.replace(/(<([^>]+)>)/gi, '')
          Object.assign(myData, { [myKey]: strippedString })
          await weapon.update(myData)
          break
        }
      }
      document.getElementById('upgradesTab').click()
    } else {
      if (!comment) {
        comment = 'You do not meet some requirements for this upgrade.'
      }
      alert(comment)
    }
  }

  async toggleEffects(myItem, equipStatus) {
    if (myItem.collections.effects.contents) {
      const myEffects = myItem.collections.effects.contents
      for (const eff of myEffects) {
        const myEffect = myItem.effects.get(eff._id)
        await myEffect.update({ disabled: equipStatus })
      }
    }
  }

  async deleteWholeUpgrade(weapon, myId) {
    const pack = game.packs.find((p) => p.metadata.name == 'upgrades')
    if (pack) {
      const myUpgrade = await pack.getDocument(myId)
      let keys = Object.keys(weapon.system.upgrades)
      let key = 'Upgrade1'
      let wasEquipped = weapon.system.itemEquipped
      for (var k of keys) {
        if (weapon.system.upgrades[k].name == myUpgrade.name) {
          key = k
          break
        }
      }

      // Deletes the upgrade's effects first, so there's no race with disable/enable toggling.
      const effectsToRemove = weapon.effects.filter(
        (e) => e.getFlag(game.system.id, 'sourceUpgradeId') === myId,
      )
      console.log('deleteWholeUpgrade: matching effects for', myId, effectsToRemove)
      if (effectsToRemove.length) {
        await weapon.deleteEmbeddedDocuments('ActiveEffect', effectsToRemove.map((e) => e.id))
      }

      let myData = {}
      let myPath = 'system.upgrades.' + key + '.id'
      let myValue = ''
      Object.assign(myData, { [myPath]: myValue })
      myPath = 'system.cost'
      let newCost = weapon.system.cost - (await this.calcUpgradeCost(myUpgrade, weapon))
      Object.assign(myData, { [myPath]: newCost })
      myPath = 'system.slots'
      let newSlots = weapon.system.slots - myUpgrade.system.slots
      Object.assign(myData, { [myPath]: newSlots })
      myPath = 'system.upgrades.' + key + '.name'
      Object.assign(myData, { [myPath]: myValue })
      myPath = 'system.upgrades.' + key + '.img'
      Object.assign(myData, { [myPath]: myValue })
      myPath = 'system.upgrades.' + key + '.rank'
      Object.assign(myData, { [myPath]: 0 })
      myPath = 'system.upgrades.' + key + '.description'
      Object.assign(myData, { [myPath]: myValue })

      // Remaining toggle is now only for OTHER effects still on the weapon
      if (wasEquipped) {
        await this.toggleEffects(weapon, true)
      }
      await weapon.update(myData)
      if (wasEquipped) {
        await this.toggleEffects(weapon, false)
      }
    } else {
      alert('Pack not found. Make sure you install the system properly.')
    }
  }

  //Checks char items before creating one, stops it and updates quantity if it exists and is not equipped.
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user)
    if (allowed === false) return false

    if (nonStackableTypes.includes(this.type)) {
      return
    }
    if (this.parent) {
      let myItem
      if (this.system.itemEquipped == true || this.system.itemEquipped == false) {
        if (this.system.upgrades) {
          myItem = this.parent.items.find(
            (u) =>
              u.name == this.name &&
              u.type == this.type &&
              u.system.itemEquipped == false &&
              u.system.decay == 10 &&
              u.system.upgrades.upgrade1.id == '',
          )
        } else {
          myItem = this.parent.items.find(
            (u) => u.name == this.name && u.type == this.type && u.system.itemEquipped == false,
          )
        }
      } else {
        myItem = this.parent.items.find((u) => u.name == this.name && u.type == this.type)
      }
      let qty = 0
      if (myItem) {
        qty = Number(myItem.system.quantity) + Number(this.system.quantity)
        await myItem.update({ 'system.quantity': qty })
        return false
      } else {
        if (this.system.itemEquipped == true) {
          // Mutate pending source data via updateSource rather than the data argument directly
          this.updateSource({ 'system.itemEquipped': false })
        }
      }
    }
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData()
    if (this.type == "powerArmor") {
      this.system.cost = this.system.baseCost.value
    }
  }

  /** @override Builds roll data for dice commands run against this Item. */
  getRollData() {
    // Starts off by populating the roll data with `this.system`
    const rollData = { ...super.getRollData() }

    // Quit early if there's no parent actor
    if (!this.actor) return rollData

    // If present, add the actor's roll data
    rollData.actor = this.actor.getRollData()

    return rollData
  }

  getAbilityBonus() {
    return this.actor.system.abilities[this.system.abilityMod].mod ?? 0
  }

  getDecayValue() {
    return (this.system.decay - 10) * -1
  }

  /** Whether this item has a decay bar and isn't already at full condition. */
  get isRepairable() {
    return CONFIG.FALLOUTZERO.repairableTypes.includes(this.type) && this.system.decay < 10
  }

  /** Computed from decay rather than a hand-set flag, so it can't drift out of sync. */
  get isBroken() {
    return this.system.decay === 0
  }

  /** Resolves this item's current repair cost: bonus, time, and materials (fixed or pool mode). */
  getRepairRequirements() {
    const authored = this.system.repair
    const broken = this.isBroken

    if (authored?.materials?.length) {
      return this._fixedRepairRequirements({
        bonus: authored.dc ?? 1,
        materials: authored.materials.map((m) => ({ ...m })),
        time: { value: authored.time?.value ?? 10, unit: authored.time?.unit ?? 'minutes' },
      }, broken)
    }

    if (this.type === 'armor' && CONFIG.FALLOUTZERO.armorRepairTable[this.system.armorType]) {
      const table = CONFIG.FALLOUTZERO.armorRepairTable[this.system.armorType]
      return this._fixedRepairRequirements({
        bonus: table.bonus,
        materials: table.materials.map((m) => ({ ...m })),
        time: { ...table.time },
      }, broken)
    }

    const weaponTable = this.type === 'meleeWeapon'
      ? CONFIG.FALLOUTZERO.meleeWeaponRepairTable[this.name?.toLowerCase()]
      : this.type === 'rangedWeapon'
        ? CONFIG.FALLOUTZERO.rangedWeaponRepairTable[this.name?.toLowerCase()]
        : null

    return this._poolRepairRequirements({
      bonus: weaponTable?.bonus ?? 1,
      slots: weaponTable?.slots ?? 2,
      time: weaponTable ? { ...weaponTable.time } : { value: 5, unit: 'minutes' },
    }, broken)
  }

  _fixedRepairRequirements({ bonus, materials, time }, broken) {
    if (broken) {
      bonus += 5
      materials = materials.map((m) => ({ ...m, quantity: m.quantity * 5 }))
      time = { ...time, value: time.value * 5 }
    }
    return { mode: 'fixed', bonus, dc: 10 + bonus, materials, time, broken }
  }

  _poolRepairRequirements({ bonus, slots, time }, broken) {
    const materialPool = this._repairMaterialPool()
    // Can't require more distinct materials than the pool actually has.
    slots = Math.min(slots, materialPool.length)
    let unitQuantity = 1
    if (broken) {
      bonus += 5
      unitQuantity = 5
      time = { ...time, value: time.value * 5 }
    }
    return { mode: 'pool', bonus, dc: 10 + bonus, time, broken, materialPool, slotsRequired: slots, unitQuantity }
  }

  /** Candidate materials for a pool-mode repair, from this item's crafting recipe or junk. */
  _repairMaterialPool() {
    const dedupe = (list) => {
      const seen = new Set()
      const out = []
      for (const m of list) {
        const key = m.name?.toLowerCase()
        if (!key || seen.has(key)) continue
        seen.add(key)
        out.push({ uuid: m.uuid ?? '', name: m.name })
      }
      return out
    }

    const craftingMaterials = this.system.crafting?.materials ?? []
    if (craftingMaterials.length) return dedupe(craftingMaterials)

    const junk = this.system.junk
    if (!junk) return []
    const junkMaterials = [1, 2, 3]
      .map((n) => ({ name: junk[`type${n}`] }))
      .filter((m) => m.name)
    return dedupe(junkMaterials)
  }

  applyAmmoCost(cost = 1) {
    if (this.system.ammo.capacity.value < cost) {
      ui.notifications.warn(`Weapon ammo is empty, need to reload`)
      return false
    }

    // Update ammo quantity
    const newWeaponAmmoCapacity = Number(this.system.ammo.capacity.value - cost)
    this.actor.updateEmbeddedDocuments('Item', [
      {
        _id: this._id,
        'system.ammo.capacity.value': newWeaponAmmoCapacity,
      },
    ])
    return true
  }

  async rollAttack({ advantageMode }) {
    const roll = await new AttackRoll(this.actor, this, { advantageMode }, () => { })
    roll.render(true)
  }
}
