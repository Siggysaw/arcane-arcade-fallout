/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/arcane-arcade-fallout/templates/actor/parts/actor-features.hbs',
    'systems/arcane-arcade-fallout/templates/actor/parts/actor-items.hbs',
    'systems/arcane-arcade-fallout/templates/actor/parts/actor-effects.hbs',
    'systems/arcane-arcade-fallout/templates/actor/parts/actor-perks.hbs',
    'systems/arcane-arcade-fallout/templates/actor/parts/actor-medicines.hbs',
    'systems/arcane-arcade-fallout/templates/actor/parts/actor-backpack.hbs',
    'systems/arcane-arcade-fallout/templates/actor/parts/actor-crafting.hbs',
    'systems/arcane-arcade-fallout/templates/actor/parts/actor-drdv.hbs',
    'systems/arcane-arcade-fallout/templates/actor/parts/actor-notes.hbs',
    'systems/arcane-arcade-fallout/templates/actor/parts/actor-npc-notes.hbs',
    'systems/arcane-arcade-fallout/templates/actor/parts/npc-status.hbs',
    'systems/arcane-arcade-fallout/templates/actor/dialog/leveledup.hbs',
    'systems/arcane-arcade-fallout/templates/actor/dialog/crafting.hbs',

    // Actor Items
    'systems/arcane-arcade-fallout/templates/actor/items/equipped-armor.hbs',
    'systems/arcane-arcade-fallout/templates/actor/items/ammo.hbs',
    'systems/arcane-arcade-fallout/templates/actor/items/combat-actions.hbs',
    'systems/arcane-arcade-fallout/templates/actor/items/combat-actions-tab.hbs',
    'systems/arcane-arcade-fallout/templates/actor/items/equipped-ranged-weapons.hbs',
    'systems/arcane-arcade-fallout/templates/actor/items/equipped-melee-weapons.hbs',
    'systems/arcane-arcade-fallout/templates/actor/items/equipped-ranged-weapons-npc.hbs',
    'systems/arcane-arcade-fallout/templates/actor/items/equipped-melee-weapons-npc.hbs',
    'systems/arcane-arcade-fallout/templates/actor/items/explosives.hbs',
    'systems/arcane-arcade-fallout/templates/item/item-upgrade-sheet.hbs',
    'systems/arcane-arcade-fallout/templates/item/item-armorUpgrade-sheet.hbs',

    // Actor Heading
    'systems/arcane-arcade-fallout/templates/actor/heading/bio.hbs',
    'systems/arcane-arcade-fallout/templates/actor/heading/status.hbs',
    'systems/arcane-arcade-fallout/templates/actor/heading/image.hbs',
    'systems/arcane-arcade-fallout/templates/actor/heading/karmaCaps.hbs',
    'systems/arcane-arcade-fallout/templates/actor/npc-heading/bio.hbs',
    'systems/arcane-arcade-fallout/templates/actor/npc-heading/status.hbs',
    'systems/arcane-arcade-fallout/templates/actor/npc-heading/image.hbs',
    'systems/arcane-arcade-fallout/templates/actor/npc-heading/karmaCaps.hbs',

    // Actor Status
    'systems/arcane-arcade-fallout/templates/actor/status/special.hbs',
    'systems/arcane-arcade-fallout/templates/actor/status/skills.hbs',
    'systems/arcane-arcade-fallout/templates/actor/status/penalties.hbs',
    'systems/arcane-arcade-fallout/templates/actor/status/passives.hbs',
    'systems/arcane-arcade-fallout/templates/actor/npc-status/special.hbs',
    'systems/arcane-arcade-fallout/templates/actor/npc-status/skills.hbs',
    'systems/arcane-arcade-fallout/templates/actor/npc-status/penalties.hbs',
    'systems/arcane-arcade-fallout/templates/actor/npc-status/passives.hbs',

    // Item partials
    'systems/arcane-arcade-fallout/templates/item/parts/item-effects.hbs',
    'systems/arcane-arcade-fallout/templates/item/parts/item-reactions.hbs',
    'systems/arcane-arcade-fallout/templates/item/parts/item-crafting.hbs',
    'systems/arcane-arcade-fallout/templates/item/parts/item-breakdown.hbs',
    'systems/arcane-arcade-fallout/templates/item/parts/weapon-damage.hbs',
    'systems/arcane-arcade-fallout/templates/item/item-condition-sheet.hbs',

    // Background partials
    'systems/arcane-arcade-fallout/templates/background/parts/grants.hbs',
  ])
}
