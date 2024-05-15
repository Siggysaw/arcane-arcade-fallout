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
	  'systems/arcane-arcade-fallout/templates/actor/parts/actor-armor.hbs',
    // Item partials
    'systems/arcane-arcade-fallout/templates/item/parts/item-effects.hbs',
  ]);
};
