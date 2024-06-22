/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/arcane-arcade-fallout/templates/actor/parts/actor-status.hbs',
    'systems/arcane-arcade-fallout/templates/actor/parts/actor-features.hbs',
    'systems/arcane-arcade-fallout/templates/actor/parts/actor-items.hbs',
    'systems/arcane-arcade-fallout/templates/actor/parts/actor-effects.hbs',
    'systems/arcane-arcade-fallout/templates/actor/parts/actor-perks.hbs',
    'systems/arcane-arcade-fallout/templates/actor/parts/actor-medicines.hbs',
    'systems/arcane-arcade-fallout/templates/actor/parts/actor-backpack.hbs',
    'systems/arcane-arcade-fallout/templates/actor/parts/actor-crafting.hbs',
    'systems/arcane-arcade-fallout/templates/actor/parts/npc-status.hbs',
    'systems/arcane-arcade-fallout/templates/actor/dialog/leveledup.hbs',

    // Actor Items
    'systems/arcane-arcade-fallout/templates/actor/items/equipped-armor.hbs',
    'systems/arcane-arcade-fallout/templates/item/item-upgrade-sheet.hbs',

    // Actor Heading
    'systems/arcane-arcade-fallout/templates/actor/heading/bio.hbs',
    'systems/arcane-arcade-fallout/templates/actor/heading/status.hbs',
    'systems/arcane-arcade-fallout/templates/actor/heading/image.hbs',
    'systems/arcane-arcade-fallout/templates/actor/heading/karmaCaps.hbs',

    // Item partials
    'systems/arcane-arcade-fallout/templates/item/parts/item-effects.hbs',
  ])
}
