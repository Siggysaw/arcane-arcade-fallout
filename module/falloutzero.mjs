import { FALLOUTZERO } from './config.mjs'
import * as models from './data/_module.mjs'
import * as documents from './documents/_module.mjs'
import * as sheets from './sheets/_module.mjs'
import { preloadHandlebarsTemplates } from './helpers/templates.mjs'

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.falloutzero = {
    rollItemMacro,
  }

  // Add custom constants for configuration.
  CONFIG.FALLOUTZERO = FALLOUTZERO

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d20 + @combatSequence - @penaltyTotal',
    decimals: 2,
  }

  // Define custom Document classes
  CONFIG.Actor.documentClass = documents.FalloutZeroActor
  CONFIG.Item.documentClass = documents.FalloutZeroItem
  CONFIG.ChatMessage.documentClass = documents.FalloutZeroChatMessage

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.FalloutZeroCharacter,
    npc: models.FalloutZeroNPC,
  }
  CONFIG.Item.dataModels = {
    item: models.FalloutZeroItem,
    ammo: models.FalloutZeroItemAmmo,
    feature: models.FalloutZeroFeature,
    background: models.FalloutZeroBackground,
    race: models.FalloutZeroRace,
    armor: models.FalloutZeroArmor,
    armorUpgrade: models.FalloutZeroArmorUpgrade,
    weaponUpgrade: models.FalloutZeroWeaponUpgrade,
    rangedWeapon: models.FalloutZeroRangedWeapon,
    meleeWeapon: models.FalloutZeroMeleeWeapon,
  }

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet)
  Actors.registerSheet('falloutzero', sheets.FalloutZeroActorSheet, {
    makeDefault: true,
    label: 'FALLOUTZERO.SheetLabels.Actor',
  })
  Items.unregisterSheet('core', ItemSheet)
  Items.registerSheet('falloutzero', sheets.FalloutZeroItemSheet, {
    makeDefault: true,
    label: 'FALLOUTZERO.SheetLabels.Item',
  })
  Items.registerSheet('falloutzero', sheets.FalloutZeroBackgroundSheet, {
    makeDefault: true,
    types: ['background'],
    label: 'FALLOUTZERO.SheetLabels.Background',
  })
  Items.registerSheet('falloutzero', sheets.FalloutZeroRaceSheet, {
    makeDefault: true,
    types: ['race'],
    label: 'FALLOUTZERO.SheetLabels.Race',
  })

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates()
})

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase()
})

Handlebars.registerHelper('setChecked', function (value, test) {
  if (value == undefined) return ''
  return value == test ? 'checked' : ''
})

// If Player is a GM
Handlebars.registerHelper('GM', function (options) {
  if (game.user.role === 4) {
    return options.fn(this)
  }
  return options.inverse(this)
})

// If Character is a NPC
Handlebars.registerHelper('NPC', function (actorType, options) {
  if (actorType == 'npc') {
    return options.fn(this)
  }
  return options.inverse(this)
})

// Greater Than or Equal
Handlebars.registerHelper('GreaterThan', function (v1, v2, options) {
  if (v1 >= v2) {
    return options.fn(this)
  }
  return options.inverse(this)
})
// Less Than
Handlebars.registerHelper('LesserThan', function (v1, v2, options) {
  if (v1 < v2) {
    return options.fn(this)
  }
  return options.inverse(this)
})

// Sum Of
Handlebars.registerHelper('Sum', function (v1, v2) {
  let sum = Number(v1) + Number(v2)
  return sum
})

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot))
})

/* --------------------------------------------  */
/*  Other Hooks                                  */
/* --------------------------------------------  */

Hooks.on('renderPause', (app, [html]) => {
  const img = html.querySelector('img')
  img.src = 'systems/arcane-arcade-fallout/assets/vaultboy/vaultboy.webp'
})

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn('You can only create macro buttons for owned Items')
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data)

  // Create the macro command using the uuid.
  const command = `game.falloutzero.rollItemMacro("${data.uuid}");`
  let macro = game.macros.find((m) => m.name === item.name && m.command === command)
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'falloutzero.itemMacro': true },
    })
  }
  game.user.assignHotbarMacro(macro, slot)
  return false
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  }
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`,
      )
    }

    // Trigger the item roll
    item.roll()
  })
}
