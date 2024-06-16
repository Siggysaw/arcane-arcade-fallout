import { onManageActiveEffect, prepareActiveEffectCategories } from '../helpers/effects.mjs'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class FalloutZeroActorSheet extends ActorSheet {
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
    actorData.system.carryLoad.value = actorData.items.reduce((acc, item) => {
      const { load = 0, quantity = 1 } = item.system;
      acc += Math.floor(load * quantity);
      return Math.round(acc * 10) / 10;
    }, 0) + 
      Math.floor(actorData.system.materials.acid.value * .1) +
      Math.floor(actorData.system.materials.adhesive.value * .1) +
      Math.floor(actorData.system.materials.aluminum.value * .1) +
      Math.floor(actorData.system.materials.antiseptic.value * .1) +
      Math.floor(actorData.system.materials.asbestos.value * .1) +
      Math.floor(actorData.system.materials.ballisticfiber.value * .1) +
      Math.floor(actorData.system.materials.ceramic.value * .1) +
      Math.floor(actorData.system.materials.circuitry.value * .1) +
      Math.floor(actorData.system.materials.cloth.value * .1) +
      Math.floor(actorData.system.materials.copper.value * .1) +
      Math.floor(actorData.system.materials.crystal.value * .1) +
      Math.floor(actorData.system.materials.fertilizer.value * .1) +
      Math.floor(actorData.system.materials.fiberoptics.value * .1) +
      Math.floor(actorData.system.materials.fiberglass.value * .1) +
      Math.floor(actorData.system.materials.glass.value * .1) +
      Math.floor(actorData.system.materials.leather.value * .1) +
      Math.floor(actorData.system.materials.nuclearmaterial.value * .1) +
      Math.floor(actorData.system.materials.oil.value * .1) +
      Math.floor(actorData.system.materials.paint.value * .1) +
      Math.floor(actorData.system.materials.plastic.value * .1) +
      Math.floor(actorData.system.materials.rubber.value * .1) +
      Math.floor(actorData.system.materials.screw.value * .1) +
      Math.floor(actorData.system.materials.silver.value * .1) +
      Math.floor(actorData.system.materials.spring.value * .1) +
      Math.floor(actorData.system.materials.steel.value * .1) +
      Math.floor(actorData.system.materials.wood.value * .1) +
      Math.floor(actorData.system.caps / 50)




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
  _prepareCharacterData(context) {}

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
      }else if (i.type === 'chem') {
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
    context.traits = traits
    context.chems = chems
    context.races = races
    context.backgrounds = backgrounds
    context.explosives = explosives.map((weapon) => {
      weapon.system.thrown = this.actor.system.abilities['str'].value * weapon.system.range
      return weapon
    })
    context.materials = materials	
    context.miscItems = miscItems	
    context.rangedWeapons = rangedWeapons.map((weapon) => {
      weapon.ammos = ammos.filter((ammo) => ammo.system.type === weapon.system.ammo.type)
      // if (!weapon.system.range.flat) {
      weapon.system.range.short =
        this.actor.system.abilities['per'].value * weapon.system.range.short
      weapon.system.range.long = this.actor.system.abilities['per'].value * weapon.system.range.long
      // }
      return weapon
    })
    context.meleeWeapons = meleeWeapons.map((weapon) => {
      weapon.ammos = ammos.filter((ammo) => ammo.system.type === weapon.system.ammo.type)
      return weapon
    })



  }

  /* -------------------------------------------- */
  /** @override */
  activateListeners(html) {
    super.activateListeners(html)

    //ap use
    html.on('click', '[data-ap-used]', (ev) => {
      const weaponId = ev.currentTarget.dataset.weaponId
      this.actor.system.apUsed(weaponId)
    })

    //ap refill
    html.on('click', '[data-refill-ap]', () => {
      this.actor.system.refillAp()
    })

    //ap recycle
    html.on('click', '[data-recycle-ap]', () => {
      this.actor.system.recycleAp()
    })

    //Level Up!
    html.on('click', '[data-leveledup]', () => {
      this.actor.system.levelUp()
    })
    //Skill Updated
    html.on('click', '[data-skilladdition]', (ev) => {
      const skill = ev.currentTarget.dataset.skill
      this.actor.system.skilladdition(skill)
    })
    html.on('click', '[data-skillsubtraction]', (ev) => {
      const skill = ev.currentTarget.dataset.skill
      this.actor.system.skillsubtraction(skill)
    })
    //Monster loot roll
    html.on('click', '[data-npc-loot]', () => {
      this.actor.system.npcLoot();
    })
    //Room loot roll <--- Help! Can't make the button not appear... so at least players can't click it. Signed: Kev
    html.on('click', '[data-pc-loot]', () => {
      if(game.user.role > 3){
        this.actor.system.roomLoot();
      } else{
        alert("Nice try, Player");
      }
    })
    // weapon roll
    html.on('click', '[data-weapon-roll]', (ev) => {
      const weaponId = ev.currentTarget.dataset.weaponId
      const hasDisadvantage = Boolean(ev.currentTarget.dataset.disadvantage)
      this.actor.system.rollWeapon(weaponId, hasDisadvantage)
    })

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '[data-edit]', (ev) => {
      const itemId = ev.currentTarget.dataset.itemId
      const item = this.actor.items.get(itemId)
      item.sheet.render(true)
    })

    // handles weapon reload
    html.on('click', '[data-reload]', (ev) => {
      const weaponId = ev.currentTarget.dataset.weaponId
      this.actor.system.reload(weaponId)
    })

    // handles changing ammo on weapon
    html.on('change', '[data-set-ammo]', (ev) => {
      const weaponId = ev.currentTarget.dataset.weaponId
      this.actor.updateEmbeddedDocuments('Item', [
        { _id: weaponId, 'system.ammo.consumes.target': ev.target.value },
      ])
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

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return

    // Add Inventory Item
    html.on('click', '.item-create', this._onItemCreate.bind(this))

    // Delete Inventory Item
    html.on('click', '.item-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item')
      const item = this.actor.items.get(li.data('itemId'))
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
