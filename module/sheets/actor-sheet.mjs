import { FALLOUTZERO } from '../config.mjs'
import { onManageActiveEffect, prepareActiveEffectCategories } from '../helpers/effects.mjs'
import FalloutZeroArmor from '../data/armor.mjs'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export default class FalloutZeroActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['falloutzero', 'sheet', 'actor'],
      width: 750,
      height: 750,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'status',
        },
      ],
    })
  }

  /** @override */
  get template() {
    return `systems/arcane-arcade-fallout/templates/actor/actor-${this.actor.type}-sheet.hbs`
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData()

    // Use a safe clone of the actor data for further operations.
    const actorData = context.data

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system
    context.flags = actorData.flags

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context)
      this._prepareCharacterData(context)
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context)
    }

    // Calculate Carry Load
    actorData.system.carryLoad.value =
      actorData.items.reduce((acc, item) => {
        const { load = 0, quantity = 1 } = item.system
        acc += Math.floor(load * quantity)
        return Math.round(acc * 10) / 10
      }, 0) + Math.floor(actorData.system.caps / 50)

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData()

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects(),
    )

    return context
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData() {}

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = []
    const features = []
    const perks = []
    const armors = []
    const rangedWeapons = []
    const meleeWeapons = []
    const medicines = []
    const foodAnddrinks = []
    const ammos = []
    const junk = []
    const traits = []
    const chems = []
    const explosives = []
    const materials = []
    const miscItems = []
    const backgrounds = []
    const races = []

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON
      if (i.type === 'item') {
        gear.push(i)
      } else if (i.type === 'feature') {
        features.push(i)
      } else if (i.type === 'perk') {
        perks.push(i)
      } else if (i.type === 'armor') {
        armors.push(i)
      } else if (i.type === 'rangedWeapon') {
        rangedWeapons.push(i)
      } else if (i.type === 'meleeWeapon') {
        meleeWeapons.push(i)
      } else if (i.type === 'medicine') {
        medicines.push(i)
      } else if (i.type === 'foodAnddrink') {
        foodAnddrinks.push(i)
      } else if (i.type === 'ammo') {
        ammos.push(i)
      } else if (i.type === 'junkItem') {
        junk.push(i)
      } else if (i.type === 'trait') {
        traits.push(i)
      } else if (i.type === 'chem') {
        chems.push(i)
      } else if (i.type === 'explosive') {
        explosives.push(i)
      } else if (i.type === 'material') {
        materials.push(i)
      } else if (i.type === 'miscItem') {
        miscItems.push(i)
      } else if (i.type === 'background') {
        backgrounds.push(i)
      } else if (i.type === 'race') {
        races.push(i)
      }
    }

    // Assign and return
    context.gear = gear
    context.features = features
    context.perks = perks
    context.armors = armors
    context.medicines = medicines
    context.foodAnddrinks = foodAnddrinks
    context.ammos = ammos
    context.junk = junk
    context.materials = materials
    context.traits = traits
    context.chems = chems
    context.races = races
    context.backgrounds = backgrounds
    context.explosives = explosives.map((weapon) => {
      weapon.system.thrown = this.actor.system.abilities['str'].value * weapon.system.range
      return weapon
    })
    context.miscItems = miscItems
    context.rangedWeapons = rangedWeapons.map((weapon) => {
      if (!weapon.system.ammo.assigned) {
        this.actor.updateEmbeddedDocuments('Item', [
          { _id: weapon._id, 'system.ammo.assigned': weapon.system.ammo.type },
        ])
      }
      weapon.ammos = ammos.filter((ammo) => ammo.name === weapon.system.ammo.assigned)
      if (this.actor.type != 'npc') {
        weapon.system.range.short =
          this.actor.system.abilities['per'].value * weapon.system.range.short
        weapon.system.range.long =
          this.actor.system.abilities['per'].value * weapon.system.range.long
      }
      return weapon
    })
    context.meleeWeapons = meleeWeapons.map((weapon) => {
      weapon.ammos = ammos.filter((ammo) => ammo.system.type === weapon.system.ammo.type)
      return weapon
    })
    context.canAddCaps = this.actor.system.karmaCaps.length < FALLOUTZERO.maxKarmaCaps
    context.canRemoveCaps = this.actor.system.karmaCaps.length > 1
  }

  /* -------------------------------------------- */
  /** @override */
  activateListeners(html) {
    super.activateListeners(html)

    // Consume an Item
    html.on('click', '[data-lowerInventory]', (ev) => {
      const item = ev.currentTarget.dataset.lowerinventory
      this.actor.lowerInventory(item)
    })

    // Limb Clicked On
    html.on('click', '[data-limb]', (ev) => {
      const limb = ev.currentTarget.dataset.limb
      this.actor.limbcondition(limb)
    })

    //notes popout
    html.on('click', '[data-opentab]', (ev) => {
      this.actor.opennotes()
    })

    //on change of luck ability
    html.on('change', '[data-set-lck]', (ev) => {
      const newLck = Number(ev.target.value)
      const currentLck = this.actor.system.abilities.lck.value
      if (currentLck === 9 && newLck === 10) {
        this.actor.addCap()
      } else if (currentLck === 10 && newLck === 9) {
        this.actor.removeCap()
      }
    })
    //add to an item quantity
    html.on('click', '[data-itemaddition]', (ev) => {
      const item = ev.currentTarget.dataset.item
      this.actor.itemaddition(item)
    })
    //subtract from an item quantity
    html.on('click', '[data-itemsubtraction]', (ev) => {
      const item = ev.currentTarget.dataset.item
      this.actor.itemsubtraction(item)
    })
    //add to a field quantity
    html.on('click', '[data-added]', (ev) => {
      const field = ev.currentTarget.dataset.field
      const fieldvalue = ev.currentTarget.dataset.fieldvalue
      this.actor.fieldaddition(field, fieldvalue)
    })
    //subtract from a field quantity
    html.on('click', '[data-subtracted]', (ev) => {
      const field = ev.currentTarget.dataset.field
      const fieldvalue = ev.currentTarget.dataset.fieldvalue
      this.actor.fieldsubtraction(field, fieldvalue)
    })
    //Set Expanded
    html.on('click', '[data-expandtoggle]', (ev) => {
      const item = ev.currentTarget.dataset.itemid
      this.actor.expandtoggle(item)
    })
    //Set Expanded
    html.on('click', '[data-combatExpand]', (ev) => {
      this.actor.combatexpandetoggle()
    })
    //show rule information
    html.on('click', '[data-condition]', (ev) => {
      const condition = ev.currentTarget.dataset.condition
      this.actor.ruleinfo(condition)
    })
    //ap use
    html.on('click', '[data-ap-used]', (ev) => {
      const apused = ev.currentTarget.dataset.apused
      console.log(apused)
      this.actor.applyApCost(apused)
    })
    //health update
    html.on('click', '[data-health]', (ev) => {
      const health = ev.currentTarget.dataset.health
      this.actor.healthupdate(health)
    })
    //stamina update
    html.on('click', '[data-stamina]', (ev) => {
      const stamina = ev.currentTarget.dataset.stamina
      this.actor.staminaupdate(stamina)
    })
    //action points +/- functionality
    html.on('click', '[data-action]', (ev) => {
      const action = ev.currentTarget.dataset.action
      this.actor.actionupdate(action)
    })
    //general action points update
    html.on('click', '[data-apusage]', (ev) => {
      const cost = ev.currentTarget.dataset.apusage
      this.actor.applyApCost(cost)
    })

    //ap refill
    html.on('click', '[data-refill-ap]', () => {
      this.actor.refillAp()
    })

    //ap recycle
    html.on('click', '[data-recycle-ap]', () => {
      this.actor.recycleAp()
    })
    //Level Up!
    html.on('click', '[data-leveledup]', () => {
      this.actor.levelUp()
    })
    //Skill Updated
    html.on('click', '[data-skilladdition]', (ev) => {
      const skill = ev.currentTarget.dataset.skill
      this.actor.skilladdition(skill)
    })
    html.on('click', '[data-skillsubtraction]', (ev) => {
      const skill = ev.currentTarget.dataset.skill
      this.actor.skillsubtraction(skill)
    })
    //Add Cap
    html.on('click', '[data-add-cap]', () => {
      this.actor.addCap()
    })
    //Remove Cap
    html.on('click', '[data-remove-cap]', () => {
      this.actor.removeCap()
    })
    //Monster loot roll
    html.on('click', '[data-npc-loot]', () => {
      this.actor.npcLoot()
    })
    //Room loot roll
    html.on('click', '[data-pc-loot]', () => {
      if (game.user.role > 3) {
        this.actor.roomLoot()
      } else {
        alert('Nice try, Player')
      }
    })

    // weapon roll
    html.on('click', '[data-weapon-roll]', async (ev) => {
      const weaponId = ev.currentTarget.dataset.weaponId
      const advantageMode = ev.currentTarget.dataset.disadvantage ? '2' : '1'
      const weapon = this.actor.items.get(weaponId)

      weapon.rollAttack({ advantageMode })
    })

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '[data-edit]', (ev) => {
      const itemId = ev.currentTarget.dataset.itemId
      const item = this.actor.items.get(itemId)
      item.sheet.render(true)
    })

    // Equip or unequip item
    html.on('click', '[data-equip]', (ev) => {
      const itemId = ev.currentTarget.dataset.itemId
      const item = this.actor.items.get(itemId)
      item.update({ 'system.itemEquipped': !item.system.itemEquipped })
      FalloutZeroArmor.prototype.changeEquipStatus(item)
    })

    // handles weapon reload
    html.on('click', '[data-reload]', (ev) => {
      const weaponId = ev.currentTarget.dataset.weaponId
      this.actor.reload(weaponId)
    })

    // handles changing ammo on weapon
    html.on('click', '[data-ammoswap]', (ev) => {
      const weaponId = ev.currentTarget.dataset.weaponId
      this.actor.ammoswap(weaponId)
    })
    html.on('click', '[data-ammochosen]', (ev) => {
      const weaponId = ev.currentTarget.dataset.weaponId
      const ammochoice = ev.currentTarget.dataset.ammochoice
      this.actor.setammo(weaponId)
    })
    // handles changing skill on weapon
    html.on('change', '[data-set-skill]', (ev) => {
      const weaponId = ev.currentTarget.dataset.weaponId
      this.actor.updateEmbeddedDocuments('Item', [
        { _id: weaponId, 'system.skillBonus': ev.target.value },
      ])
    })

    // handles changing ability on weapon
    html.on('change', '[data-set-ability]', (ev) => {
      const weaponId = ev.currentTarget.dataset.weaponId
      this.actor.updateEmbeddedDocuments('Item', [
        { _id: weaponId, 'system.abilityMod': ev.target.value },
      ])
    })

    // Updates Weapon Decay
    html.on('change', '[data-set-decay]', (ev) => {
      const weaponId = ev.currentTarget.dataset.weaponId
      this.actor.updateEmbeddedDocuments('Item', [
        { _id: weaponId, 'system.decay': ev.target.value },
      ])
    })

    // Updates Expand Item Field
    html.on('change', '[data-set-itemOpen]', (ev) => {
      const weaponId = ev.currentTarget.dataset.weaponId
      this.actor.updateEmbeddedDocuments('Item', [
        { _id: weaponId, 'system.itemOpen': ev.target.value },
      ])
    })

    // Convert Junk to Materials
    html.on('click', '[data-junkToMat]', (ev) => {
      const itemID = ev.currentTarget.dataset.itemId
      this.actor.checkConvert(itemID)
    })

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return

    // Add Inventory Item
    html.on('click', '.item-create', this._onItemCreate.bind(this))

    // Delete Inventory Item
    html.on('click', '.item-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item')
      const item = this.actor.items.get(li.data('itemId'))

      switch (item.type) {
        case 'trait':
          this._onItemDeleteTrait(item)
          break
        case 'armor':
          if (item.system.itemEquipped) {
            FalloutZeroArmor.prototype.unequipItemStats(item)
          }
          break
        case 'background':
          return new Dialog({
            title: `Delete background ${item.name}`,
            content: 'Delete starting equipment from background as well?',
            buttons: {
              close: {
                icon: '<i class="fas fa-times"></i>',
                label: 'No',
                callback: () => item.delete(),
              },
              continue: {
                icon: '<i class="fas fa-chevron-right"></i>',
                label: 'Yes',
                callback: () => {
                  item.delete()
                  this._deleteGrantedItems(item)
                },
              },
            },
            default: 'close',
          }).render(true)
      }

      item.delete()
      li.slideUp(200, () => this.render(false))
    })

    // Active Effect management
    html.on('click', '.effect-control', (ev) => {
      const row = ev.currentTarget.closest('li')
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId)
      onManageActiveEffect(ev, document)
    })

    // Rollable abilities.
    html.on('click', '[data-rollable]', this._onRoll.bind(this))

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev)
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return
        li.setAttribute('draggable', true)
        li.addEventListener('dragstart', handler, false)
      })
    }
  }

  _deleteGrantedItems(item) {
    item.system.grantedItems.forEach((itemId) => {
      const item = this.actor.items.get(itemId)
      if (!item) return
      item.delete()
    })
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault()
    const header = event.currentTarget
    // Get the type of item to create.
    const type = header.dataset.type
    // Grab any data associated with this control.
    const data = duplicate(header.dataset)
    // Initialize a default name.
    const name = `New ${type.capitalize()}`
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    }
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type']

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor })
  }

  /**
   * Handle the final creation of dropped Item data on the Actor.
   * @param {Item} itemData     The item or items requested for creation
   * @protected
   */
  async _onDropItemCreate(itemData) {
    switch (itemData.type) {
      case 'trait':
        this._onDropItemCreateTrait(itemData)
        return
      case 'background':
        if (!this.actor.getRaceType()) {
          return ui.notifications.warn('First add race to actor')
        }
        this._onDropItemCreateBackgroundGrants(itemData)
        return
      default:
        super._onDropItemCreate(itemData)
        return
    }
  }

  /**
   * Handle the final creation of dropped background Item data on the Actor.
   * @param {Item} itemData     The item or items requested for creation
   * @protected
   */
  async _onDropItemCreateBackgroundGrants(itemData) {
    const race = this.actor.getRaceType()
    const itemsToGrant = [
      ...itemData.system.races['allRaces'].grants,
      ...itemData.system.races[race].grants,
    ]
    const createdIds = await Promise.all(
      itemsToGrant.map(async (grant) => {
        const newItem = await fromUuid(grant.key)
        const itemClone = newItem.clone()
        try {
          const createdItems = await super._onDropItemCreate(itemClone)
          await createdItems[0].update({ 'system.quantity': grant.quantity })
          return createdItems[0].id
        } catch (error) {
          ui.notifications.warn(`error creating item from ${itemClone.name}`)
          console.error(`error creating item from ${itemClone.name}`, error)
          return
        }
      }),
    )
    itemData.system.grantedItems = [...createdIds]
    super._onDropItemCreate(itemData)
  }

  /**
   * Handle the final creation of dropped trait Item data on the Actor.
   * @param {Item} itemData     The item or items requested for creation
   * @protected
   */
  _onDropItemCreateTrait(itemData) {
    // If trait already exists
    if (this.actor.items.contents.some((item) => item.name === itemData.name)) {
      return ui.notifications.warn('Trait already exists on actor')
    }

    // Else add trait
    super._onDropItemCreate(itemData)

    // If trait is gifted, add cap
    if (itemData.name === 'Gifted') {
      this.actor.addCap()
    }
  }

  _onItemDeleteTrait(itemData) {
    if (itemData.name === 'Gifted') {
      this.actor.removeCap()
    }
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId
        const item = this.actor.items.get(itemId)
        if (item) return item.roll()
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label || ''
      let roll = new Roll(dataset.roll, this.actor.getRollData())
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      })
      return roll
    }
  }
}
