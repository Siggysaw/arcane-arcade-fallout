import { FALLOUTZERO } from '../config.mjs'
import { onManageActiveEffect, prepareActiveEffectCategories } from '../helpers/effects.mjs'
import SkillRoll from '../dice/skill-roll.mjs'
import PerkListApplication from '../applications/components/perk-list.mjs'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export default class FalloutZeroActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['falloutzero', 'sheet', 'actor'],
      width: 800,
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

    const carryLoadSetting = game.settings.get('core', 'CarryLoad')
    const CapsLoad = game.settings.get('core', 'CapsLoad')
    const AmmoLoad = game.settings.get('core', 'AmmoLoad')
    const JunkLoad = game.settings.get('core', 'JunkLoad')
    const VaultTec = game.settings.get('core', 'VaultTec')
    const Language = game.settings.get('core', 'language')
    const PlaySounds = game.settings.get('core', 'PlaySounds')
    const ManualGroupSneak = game.settings.get('core', 'GroupSneak')
    const ManualPartyNerve = game.settings.get('core', 'PartyNerve')

    if (actorData.system.health.value < 1 && !actorData.system.downed) {
      this.actor.update({ 'system.actionPoints.value': 4 })
      this.actor.update({ 'system.downed': true })
    }
    if (actorData.system.health.value > 0 && actorData.system.downed) {
      this.actor.update({ 'system.actionPoints.value': actorData.system.actionPoints.max })
      this.actor.update({ 'system.downed': false })
    }

    // Calculate Carry Load
    const packrat = actorData.items.find((i) => i.name == 'Pack Rat')
    const capsLoad = CapsLoad ? Math.floor(actorData.system.caps / 50) : 0

    actorData.system.carryLoad.base =
      actorData.items.reduce((acc, item) => {
        if (item.system.qty === 0 && !KeepZeroes) {
          console.log("0s need to be deleted")
        }
        let { load = 0, quantity = 1 } = item.system
        if (item.type === "armor" && item.system.itemEquipped === true) {
          load = Math.floor(load / 2)
        }
        if (packrat && load < 3 && load > 1) {
          load = 1
        }
        if (!AmmoLoad && item.type == "ammo" ||
          !JunkLoad && item.type == "junkItem" ||
          !JunkLoad && item.type == "material" ||
          item.system.worn) {
          load = 0
        }
        acc += Math.floor(load * quantity)
        return Math.round(acc * 10) / 10
      }, 0) + capsLoad

    actorData.system.carryLoad.value =
      actorData.system.carryLoad.base + actorData.system.carryLoad.modifiers
    actorData.system.carryLoad.max =
      actorData.system.carryLoad.baseMax + actorData.system.carryLoad.modifiersMax + actorData.system.carryLoad.manualMax

    //Set Group Sneak and Party Nerve
    const characterList = game.actors.filter((entries) => entries.type === 'character')
    const activeCharacterList = characterList.filter(
      (FalloutZeroActor) => FalloutZeroActor.system.activePartymember === true,
    )
    let charismaModtotal = 0
    let groupSneaktotal = 0
    for (let character of activeCharacterList) {
      charismaModtotal += character.system.abilities.cha.mod
      groupSneaktotal +=
        character.system.skills.sneak.base +
        character.system.skills.sneak.modifiers +
        character.system.abilities.agi.mod +
        character.getAbilityMod(CONFIG.FALLOUTZERO.abilities.lck.id)
    }
    const activePlayercount = activeCharacterList.length
    ManualPartyNerve > 0 ? actorData.system.partyNerve.base = ManualPartyNerve : actorData.system.partyNerve.base = Math.floor(charismaModtotal / 2)
    ManualGroupSneak > 0 ? actorData.system.groupSneak.base = ManualGroupSneak : actorData.system.groupSneak.base = Math.floor(groupSneaktotal / activePlayercount)


    //PowerArmor Setup
    const PowerArmor = actorData.items.filter((i) => i.type == 'powerArmor').filter((i) => i.system.itemEquipped === true)
    if (PowerArmor.length > 0) {
      const ArmorID = PowerArmor[0]._id
      this.actor.PowerArmorHealth(ArmorID)
    }

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
  _prepareCharacterData() { }

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
    const powerArmors = []
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
    const conditions = []
    const properties = []
    const upgrades = []
    const armorUpgrades = []

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
      } else if (i.type === 'powerArmor') {
        powerArmors.push(i)
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
      } else if (i.type === 'condition') {
        conditions.push(i)
      } else if (i.type === 'property') {
        properties.push(i)
      } else if (i.type === 'weaponUpgrade') {
        upgrades.push(i)
      } else if (i.type === 'armorUpgrade') {
        if (!i.system.equipped) {
          armorUpgrades.push(i)
        }
      }
    }

    // Assign and return
    context.armorUpgrades = armorUpgrades
    context.upgrades = upgrades
    context.gear = gear
    context.features = features
    context.perks = perks
    context.armors = armors
    context.powerArmors = powerArmors
    context.medicines = medicines
    context.foodAnddrinks = foodAnddrinks
    context.ammos = ammos
    context.junk = junk
    context.materials = materials
    context.traits = traits
    context.chems = chems
    context.races = races
    context.conditions = conditions
    context.properties = properties
    context.backgrounds = backgrounds
    context.explosives = explosives.map((weapon) => {
      weapon.system.thrown = this.actor.system.abilities['str'].value * weapon.system.range.short
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
      if (!weapon.system.ammo.assigned) {
        this.actor.updateEmbeddedDocuments('Item', [
          { _id: weapon._id, 'system.ammo.assigned': weapon.system.ammo.type },
        ])
      }
      weapon.ammos = ammos.filter((ammo) => ammo.name === weapon.system.ammo.assigned)
      if (this.actor.type != 'npc') {
        weapon.system.range.short =
          this.actor.system.abilities['str'].value * weapon.system.range.short
        weapon.system.range.long =
          this.actor.system.abilities['str'].value * weapon.system.range.long
      }
      return weapon
    })
    context.canAddCaps = this.actor.system.karmaCaps.length < FALLOUTZERO.maxKarmaCaps
    context.canRemoveCaps = this.actor.system.karmaCaps.length > 1
    if (this.actor.type == "character") {
      this.actor.update({ 'prototypeToken.actorLink': true })
    }
    const drdv = Object.values(FALLOUTZERO.damageTypes).reduce(
      (acc, type) => {
        acc.dr.push({
          ...type,
          selected: this.actor.system.dr.includes(type.id),
        })
        acc.dv.push({
          ...type,
          selected: this.actor.system.dv.includes(type.id),
        })
        return acc
      },
      { dr: [], dv: [] },
    )
    context.dr = drdv.dr
    context.dv = drdv.dv
  }

  /* -------------------------------------------- */
  /** @override */
  activateListeners(html) {
    super.activateListeners(html)

    // context list
    const itemContextMenu = [
      {
        name: 'View',
        icon: '<i class="fas fa-edit"></i>',
        condition: (element) => element.closest('.context-menu').data('item-id'),
        callback: (element) => {
          const itemId = element.closest('.context-menu').data('item-id')
          const item = this.actor.items.get(itemId)
          item.sheet.render(true)
        },
      },
      {
        name: 'Swap Ammo',
        icon: '<i class="fas fa-swap"></i>',
        condition: (element) => {
          const itemId = element.closest('.context-menu').data('item-id')
          const item = this.actor.items.get(itemId)
          if (item.type == 'rangedWeapon' || item.type == 'meleeWeapon' && item.system.ammo.assigned) {
            return true
          }
        },
        callback: (element) => {
          const itemId = element.closest('.context-menu').data('item-id')
          this.actor.ammoswap(itemId)
        },
      },
      {
        name: 'Attack',
        icon: '<i class="fa fa-solid fa-crosshairs"></i>',
        condition: (element) => {
          const itemId = element.closest('.context-menu').data('item-id')
          const item = this.actor.items.get(itemId)
          if (item.type == 'rangedWeapon' || item.type == 'meleeWeapon' && item.system.ammo.assigned || item.type=='explosive') {
            return true
          }
        },
        callback: (element) => {
          const weaponId = element.closest('.context-menu').data('item-id')
          const advantageMode = '1'
          const weapon = this.actor.items.get(weaponId)

          weapon.rollAttack({ advantageMode })
        },
      },
      {
        name: '3AP Stow/Equip',
        icon: '',
        condition: (element) => {
          const itemId = element.closest('.context-menu').data('item-id')
          const item = this.actor.items.get(itemId)
          if (
            item.type === 'rangedWeapon' ||
            item.type === 'meleeWeapon' ||
            item.type === 'armor' ||
            item.type === 'powerArmor'
          ) {
            return true
          }
        },
        callback: (element) => {
          const itemId = element.closest('.context-menu').data('item-id')
          const item = this.actor.items.get(itemId)
          let cost = 3
          item.type == "powerArmor" ? cost = 6 : cost = cost
          if (this.actor.applyApCost(cost)) {
            if (item.system.itemEquipped) {
              this.actor.unEquipArmor(item.uuid)
            } else {
              this.actor.equipArmor(item.uuid)
            }
          }
        },
      },
      {
        name: 'Attach/Detach upgrade',
        icon: '',
        condition: (element) => {
          const itemId = element.closest('.context-menu').data('item-id')
          const item = this.actor.items.get(itemId)
          if (
            item.type === 'armor' ||
            item.type === 'powerArmor'
          ) {
            return true
          }
        },
        callback: (element) => {
          const itemId = element.closest('.context-menu').data('item-id')
          new game.falloutzero.applications.components.SelectUpgrade(this.actor.id, itemId).render(true)
        },
      },
      {
        name: 'Eat/Drink',
        icon: '<i class="fas fa-drumstick-bite"></i>',
        condition: (element) => {
          const itemId = element.closest('.context-menu').data('item-id')
          const item = this.actor.items.get(itemId)
          if (item.type == 'foodAnddrink' && item.system.quantity > 0) {
            return true
          }
        },
        callback: (element) => {
          const itemId = element.closest('.context-menu').data('item-id')
          const item = this.actor.items.get(itemId)
          this.actor.lowerInventory(itemId)
        },
      },
      {
        name: '4AP Use Chem',
        icon: '<i class="fas fa-syringe"></i>',
        condition: (element) => {
          const itemId = element.closest('.context-menu').data('item-id')
          const item = this.actor.items.get(itemId)
          if (item.type == 'chem' && item.system.quantity > 0) {
            return true
          }
        },
        callback: (element) => {
          const itemId = element.closest('.context-menu').data('item-id')
          const item = this.actor.items.get(itemId)
          this.actor.applyApCost(4) ? this.actor.lowerInventory(itemId) : console.log("Failed To Apply Cost")
        },
      },
      {
        name: '4AP Use Med',
        icon: '<i class="fas fa-medkit"></i>',
        condition: (element) => {
          const itemId = element.closest('.context-menu').data('item-id')
          const item = this.actor.items.get(itemId)
          if (item.type == 'medicine' && item.system.quantity > 0) {
            return true
          }
        },
        callback: (element) => {
          const itemId = element.closest('.context-menu').data('item-id')
          const item = this.actor.items.get(itemId)
          this.actor.applyApCost(4) ? this.actor.lowerInventory(itemId) : console.log("Failed To Apply Cost")
        },
      },
      {
        name: 'Send to Chat',
        icon: '<i class="fa-solid fa-comment"></i>',
        condition: (element) => {
          const itemId = element.closest('.context-menu').data('item-id')
          const item = this.actor.items.get(itemId)
          if (item.system.description && item.system.description.length > 0) {
            return true
          }
        },
        callback: (element) => {
          const itemId = element.closest('.context-menu').data('item-id')
          const item = this.actor.items.get(itemId)
          let theContent = item.system.description
          if (item.type == 'explosive') {
            theContent = item.system.properties
          }
          let chatData = {
            author: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            flavor: `${item.name} description :`,
            content: theContent,
          }
          ChatMessage.create(chatData, {})
        },
      },
      {
        name: 'Break Down',
        icon: '<i class="fa-solid fa-screwdriver-wrench"></i>',
        condition: (element) => {
          const itemId = element.closest('.context-menu').data('item-id')
          const item = this.actor.items.get(itemId)
          if (
            (item.type == 'junkItem' ||
              item.type == 'rangedWeapon' ||
              item.type == 'meleeWeapon' ||
              item.type == 'armor' ||
              item.type == 'powerArmor') &&
            item.system.quantity > 0
          ) {
            return true
          }
          if (item.type == 'ammo' && item.system.quantity > 4) {
            return true
          }
        },
        callback: (element) => {
          const itemId = element.closest('.context-menu').data('item-id')
          const item = this.actor.items.get(itemId)
          this.actor.checkConvert(itemId)
        },
      },
      {
        name: 'Delete',
        icon: '<i class="fas fa-trash"></i>',
        condition: (element) => element.closest('.context-menu').data('item-id'),
        callback: (element) => {
          const itemId = element.closest('.context-menu').data('item-id')
          const item = this.actor.items.get(itemId)
          if (item.type == 'background') {
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
          } else {
            this.actor.deleteEmbeddedDocuments('Item', [itemId])
          }
        },
      },
    ]

    const combatContextMenu = [
      {
        name: 'Move 5 Ft (1 AP)',
        icon: '<i class=""></i>',
        title: 'Move 1 Square',
        condition: (element) => element.closest('.combat-menu'),
        callback: (element) => {
          this.actor.applyApCost(1)
        },
      },
      {
        name: 'Sprint 50 Ft In a Line (5 AP)',
        icon: '<i class=""></i>',
        condition: (element) => element.closest('.combat-menu'),
        callback: (element) => {
          this.actor.applyApCost(5)
        },
      }, {
        name: 'Use Med/Chem (4 AP)',
        icon: '<i class=""></i>',
        condition: (element) => element.closest('.combat-menu'),
        callback: (element) => {
          this.actor.applyApCost(4)
        },
      },
      {
        name: 'Grapple (3 AP)',
        icon: '<i class=""></i>',
        condition: (element) => element.closest('.combat-menu'),
        callback: (element) => {
          this.actor.applyApCost(3)
        },
      }, {
        name: 'Block (3 AP)',
        icon: '<i class=""></i>',
        condition: (element) => element.closest('.combat-menu'),
        callback: (element) => {
          this.actor.applyApCost(3)
        },
      },
      {
        name: 'Escape Grapple (5 AP)',
        icon: '<i class=""></i>',
        condition: (element) => element.closest('.combat-menu'),
        callback: (element) => {
          this.actor.applyApCost(5)
        },
      },
      {
        name: 'Help (6 AP)',
        icon: '<i class=""></i>',
        condition: (element) => element.closest('.combat-menu'),
        callback: (element) => {
          this.actor.applyApCost(6)
        },
      },
      {
        name: 'Unarmed Strike (3 AP)',
        icon: '<i class=""></i>',
        condition: (element) => element.closest('.combat-menu'),
        callback: (element) => {
          this.actor.applyApCost(3)
        },
      },
      {
        name: 'Hide (6 AP)',
        icon: '<i class=""></i>',
        condition: (element) => element.closest('.combat-menu'),
        callback: (element) => {
          this.actor.applyApCost(6)
        },
      },
      {
        name: 'Interact With Object (3 AP)',
        icon: '<i class=""></i>',
        condition: (element) => element.closest('.combat-menu'),
        callback: (element) => {
          this.actor.applyApCost(3)
        },
      },
      {
        name: 'Search (3 AP)',
        icon: '<i class=""></i>',
        condition: (element) => element.closest('.combat-menu'),
        callback: (element) => {
          this.actor.applyApCost(3)
        },
      },
      {
        name: 'Shove (4 AP)',
        icon: '<i class=""></i>',
        condition: (element) => element.closest('.combat-menu'),
        callback: (element) => {
          this.actor.applyApCost(4)
        },
      },
      {
        name: 'Dodge (6 AP)',
        icon: '<i class=""></i>',
        condition: (element) => element.closest('.combat-menu'),
        callback: (element) => {
          this.actor.applyApCost(6)
        },
      },
      {
        name: 'Stand Up (5 AP)',
        icon: '<i class=""></i>',
        condition: (element) => element.closest('.combat-menu'),
        callback: (element) => {
          this.actor.applyApCost(5)
        },
      },
      {
        name: 'Ready (+2 AP)',
        icon: '<i class=""></i>',
        condition: (element) => element.closest('.combat-menu'),
        callback: (element) => {
          this.actor.applyApCost(2)
        },
      },
      {
        name: 'Take Cover (3 AP)',
        icon: '<i class=""></i>',
        condition: (element) => element.closest('.combat-menu'),
        callback: (element) => {
          this.actor.applyApCost(3)
        },
      }
    ]

    new ContextMenu(html, '.context-menu', itemContextMenu, { eventName: 'click', _expandUp: true })
    new ContextMenu(html, '.combat-menu', combatContextMenu, { eventName: 'click', _expandUp: true })

    //Death Saves
    html.on('click', '[data-rolldeathsave]', (ev) => {
      this.actor.deathSave()
    })

    //==============Audio Triggers
    //MUTE and UNMUTE
    html.on('click', '[data-audioToggle]', (ev) => {
      const PlaySounds = game.settings.get('core', 'PlaySounds')
      game.settings.set('core', 'PlaySounds', !PlaySounds)
      this.render(true)
    })
    //SPECIAL and SKILLS
    html.on('click', '[data-pipboyselect]', (ev) => {
      let randomNum = Math.floor(Math.random() * 2) + 1
      var audio = new Audio(`/systems/arcane-arcade-fallout/assets/sounds/ui/select_pipboy_${randomNum}.mp3`);
      if (game.settings.get('core', 'PlaySounds')) {
        audio.play()
      }
    })
    //TABS
    html.on('click', '[data-tabs]', (ev) => {
      let randomNum = Math.floor(Math.random() * 3) + 1
      var audio = new Audio(`/systems/arcane-arcade-fallout/assets/sounds/ui/change-tab_pipboy_${randomNum}.mp3`);
      if (game.settings.get('core', 'PlaySounds')) {
        audio.play()
      }
    })

    //===============END Audio Triggers

    //show rule information
    html.on('click', '[data-condition]', (ev) => {
      const condition = ev.currentTarget.dataset.condition

    })
    //show Combat Action Information
    html.on('click', '[data-combatActions]', (ev) => {
      this.actor.openDialog("/templates/dialog/combat-actions.hbs", "Combat Actions")
    })

    // Actor Rest Buttons
    html.on('click', '[data-rest]', (ev) => {
      const rest = ev.currentTarget.dataset.rest
      this.actor.restRecovery(rest)
    })

    // View Perks Button
    html.on('click', '[data-view-perks]', async (ev) => {
      const perkApp = new PerkListApplication()
      await perkApp.init()
      perkApp.render(true)
    })

    // Custom Roll Button
    html.on('click', '[data-custom-roll]', (ev) => {
      this.actor.customRoll()
    })
    // Ability Roll Button
    html.on('click', '[data-abilityroll]', (ev) => {
      const ability = ev.currentTarget.dataset.abilityroll
      this.actor.abilityRoll(ability)
    })

    // Toggle Edit Mode
    html.on('click', '[data-editToggle]', (ev) => {
      this.actor.update({ 'system.editToggle': !this.actor.system.editToggle })
    })
    // Toggle Sheet Mode
    html.on('click', '[data-showEquipped]', (ev) => {
      this.actor.update({ 'system.showEquipped': !this.actor.system.showEquipped })
    })

    // Toggle Active Party Member
    html.on('click', '[data-activeCheck]', (ev) => {
      this.actor.update({ 'system.activePartymember': !this.actor.system.activePartymember })
    })

    // Toggle Equipped Items
    html.on('click', '[data-equipToggle]', (ev) => {
      const itemId = ev.currentTarget.dataset.itemId
      const item = this.actor.items.get(itemId)
      let cost = 3
      item.type == "powerArmor" ? cost = 6 : cost = cost

      if (item.type === 'armor') {
        return item.system.itemEquipped ? this.actor.unEquipArmor(item.uuid) : this.actor.equipArmor(item.uuid)
      }

      if (this.actor.applyApCost(cost)) {
        item.update({ 'system.itemEquipped': !item.system.itemEquipped })
        item.update({ 'system.worn': !item.system.worn })
      }
    })

    // Consume an Item
    html.on('click', '[data-lowerInventory]', (ev) => {
      const item = ev.currentTarget.dataset.lowerinventory
      this.actor.lowerInventory(item)
    })
    // Carry Load Breakdown
    html.on('click', '[data-inspect-carryload]', (ev) => {
      this.actor.inspectCarryload()
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

    //Any other stat updated
    html.on('click', '[data-statSubtraction]', (ev) => {
      const stat = ev.currentTarget.dataset.stat
      const statType = ev.currentTarget.dataset.type
      const statField = ev.currentTarget.dataset.field
      this.actor.statSubtraction(stat, statType, statField)
    })

    html.on('click', '[data-statAddition]', (ev) => {
      const stat = ev.currentTarget.dataset.stat
      const statType = ev.currentTarget.dataset.type
      const statField = ev.currentTarget.dataset.field
      this.actor.statAddition(stat, statType, statField)
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

    // skill roll

    html.on('click', '[data-skill-roll]', async (ev) => {
      const skillKey = ev.currentTarget.dataset.skillRoll
      const roll = await new SkillRoll(this.actor, skillKey, () => { })
      roll.render(true)
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
    })

    // Send an item's description to Chat.
    html.on('click', '[data-sendToChat]', (ev) => {
      const itemId = ev.currentTarget.dataset.itemId
      const item = this.actor.items.get(itemId)
      let theContent = item.system.description
      if (item.type == 'explosive') {
        theContent = item.system.properties
      }
      let chatData = {
        author: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        flavor: `${item.name} description :`,
        content: theContent,
      }
      ChatMessage.create(chatData, {})
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
    // Updates Weapon Decay
    html.on('click', '[data-add-decay]', (ev) => {
      const weaponId = ev.currentTarget.dataset.weaponId
      let newDecay = Number(ev.target.dataset.fieldvalue) + 1
      console.log(newDecay)
      this.actor.updateEmbeddedDocuments('Item', [{ _id: weaponId, 'system.decay': newDecay }])
    })
    // Updates Weapon Decay
    html.on('click', '[data-reduce-decay]', (ev) => {
      const weaponId = ev.currentTarget.dataset.weaponId
      let newDecay = Number(ev.target.dataset.fieldvalue) - 1
      console.log(newDecay)
      this.actor.updateEmbeddedDocuments('Item', [{ _id: weaponId, 'system.decay': newDecay }])
    })

    // Updates Armor DP
    html.on('change', '[data-set-defense]', (ev) => {
      const item = ev.currentTarget.dataset.itemId
      this.actor.updateEmbeddedDocuments('Item', [
        { _id: item, 'system.defensePoint.value': ev.target.value },
      ])
    })

    // Updates Expand Item Field
    html.on('change', '[data-set-itemOpen]', (ev) => {
      const weaponId = ev.currentTarget.dataset.weaponId
      this.actor.updateEmbeddedDocuments('Item', [
        { _id: weaponId, 'system.itemOpen': ev.target.value },
      ])
    })
    // Updates Power Armor HP
    html.on('change', '[data-powerarmorhp]', (ev) => {
      const armorId = ev.currentTarget.dataset.powerarmorhp
      this.actor.updateEmbeddedDocuments('Item', [
        { _id: armorId, 'system.armorHP.value': ev.target.value },
      ])
    })

    //Sort Junk items
    html.on('click', '[sortJunk]', () => {
      this.actor.sortTable('junkTable')
    })

    //Sort Materials
    html.on('click', '[sortMat]', () => {
      this.actor.sortTable('matsTable')
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
    html.on('click', '[data-roll-save]', this._onRollSave.bind(this))

    html.on('click', '[data-crafting-bench]', async () => {
      const bench = new game.falloutzero.applications.components.CraftingBench(this.actor.id)
      await bench.init()
      bench.render(true)
    })

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
        if (itemData.system.itemEquipped) {
          itemData.system.itemEquipped = false
        }
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
      itemsToGrant
        .map(async (grant) => {
          try {
            const newItem = await fromUuid(grant.key)
            const itemClone = newItem.clone()
            const createdItems = await super._onDropItemCreate(itemClone)
            await createdItems[0].update({ 'system.quantity': grant.quantity })
            return createdItems[0].id
          } catch (error) {
            ui.notifications.warn(`error creating item from ${grant.name}`)
            console.error(`error creating item from ${grant.name}`, error)
            return false
          }
        })
        .filter(Boolean),
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
      if (typeof dataset.advantage != 'undefined' && !dataset.roll.includes('2d20')) {
        if (Number(dataset.advantage) > 0) {
          dataset.roll = dataset.roll.split('d20').join('2d20kh')
        }
        if (Number(dataset.advantage) < 0) {
          dataset.roll = dataset.roll.split('d20').join('2d20kl')
        }
      }
      let roll = new Roll(dataset.roll, this.actor.getRollData())
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      })
      return roll
    }
  }

  async _onRollSave(event) {
    const element = event.currentTarget
    const dataset = element.dataset
    const saveDC = dataset.rollSave
    const saveType = dataset.saveType

    this.actor.rollSave({
      formula: '1d20',
      saveDC,
      type: saveType,
    })
  }
}
