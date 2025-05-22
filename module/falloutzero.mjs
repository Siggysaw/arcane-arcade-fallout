import { FALLOUTZERO } from './config.mjs'
import * as models from './data/_module.mjs'
import * as documents from './documents/_module.mjs'
import * as sheets from './sheets/_module.mjs'
import { preloadHandlebarsTemplates } from './helpers/templates.mjs'
import { registerSystemSettings, registerHbsHelpers } from './registerSettings.mjs'

// Import Submodules
import * as applications from '../module/applications/_module.mjs'
import { registerHooks } from './registerHooks.mjs'

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {

  // Add custom constants for configuration.
  CONFIG.FALLOUTZERO = FALLOUTZERO

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.falloutzero = {
    applications,
    rollItemMacro,
  }

  // Registers system settings
  registerSystemSettings()

  const sheetColor = game.settings.get('core', 'Sheet-Color');
  const r = document.querySelector(':root');
  r.style.setProperty('--sheetcolor', sheetColor);

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d20 + @combatSequence.value - @penaltyTotal',
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
    perk: models.FalloutZeroPerk,
    trait: models.FalloutZeroPerk,
    race: models.FalloutZeroRace,
    armor: models.FalloutZeroArmor,
    powerArmor: models.FalloutZeroPowerArmor,
    armorUpgrade: models.FalloutZeroArmorUpgrade,
    weaponUpgrade: models.FalloutZeroWeaponUpgrade,
    rangedWeapon: models.FalloutZeroRangedWeapon,
    meleeWeapon: models.FalloutZeroMeleeWeapon,
    condition: models.FalloutZeroCondition,
    foodAnddrink: models.FalloutZeroCondition,
    chem: models.FalloutZeroCondition,
    medicine: models.FalloutZeroCondition,
    miscItem: models.FalloutZeroCondition,
    explosive: models.FalloutZeroCondition,
    material: models.FalloutZeroItemBase,
    junkItem: models.FalloutZeroJunkItem,
  }

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet)
  Actors.registerSheet('falloutzero', sheets.FalloutZeroActorSheet, {
    makeDefault: true,
    label: 'Pip-Boy',
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
  Items.registerSheet('falloutzero', sheets.FalloutZeroPerkSheet, {
    makeDefault: true,
    types: ['perk'],
    label: 'FALLOUTZERO.SheetLabels.Perk',
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
registerHbsHelpers()

/* -------------------------------------------- */
/*  Hooks                                  */
/* -------------------------------------------- */
registerHooks()

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
