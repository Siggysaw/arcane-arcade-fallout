// Shared check of this system's per-skill/per-ability "advantage counter"
// data model (system.skills[x].advantage / system.abilities[x].advantage -
// signed NumberFields that a perk, trait, or consumed item can push up or
// down, see module/data/actorBase.mjs and the Mentats/"Extrapolating"
// condition effect) against the same three-state Normal/Advantage/
// Disadvantage split the attack dialog's manual selector already uses
// (AttackRoll.ADV_MODE: NORMAL=1, ADVANTAGE=2, DISADVANTAGE=3).
//
// Used by AttackRoll (module/dice/attack-roll.mjs - the placed-explosive
// arming check and the thrown-explosive roll) and CraftingBench
// (module/applications/components/crafting-bench.mjs - crafting skill
// checks). Both previously only ever consulted a roll dialog's manual
// Normal/Advantage/Disadvantage selection (or, for crafting, nothing at
// all) and never looked at this automatic counter.

/**
 * True if either the given skill's or the given ability's advantage
 * counter is currently positive. Either one alone is enough - this is a
 * simple presence check per field, not a sum across them.
 */
export function hasAutomaticAdvantage(actor, { skill, ability } = {}) {
  const skillValue = skill ? actor?.system?.skills?.[skill]?.advantage ?? 0 : 0
  const abilityValue = ability ? actor?.system?.abilities?.[ability]?.advantage ?? 0 : 0
  return skillValue > 0 || abilityValue > 0
}

/**
 * True if either the given skill's or the given ability's advantage
 * counter is currently negative (i.e. disadvantage). Either one alone is
 * enough, same as hasAutomaticAdvantage.
 */
export function hasAutomaticDisadvantage(actor, { skill, ability } = {}) {
  const skillValue = skill ? actor?.system?.skills?.[skill]?.advantage ?? 0 : 0
  const abilityValue = ability ? actor?.system?.abilities?.[ability]?.advantage ?? 0 : 0
  return skillValue < 0 || abilityValue < 0
}

/**
 * Converts advantage/disadvantage flags - from any mix of sources (the
 * attack dialog's manual mode, and/or the automatic checks above,
 * OR'd together by the caller) - into an actual d20 dice formula. Having
 * both at once cancels out to a plain roll, same as this system's existing
 * manual Advantage/Disadvantage selection already resolves when they'd
 * otherwise conflict.
 */
export function advantageDiceFormula(hasAdvantage, hasDisadvantage) {
  if (hasAdvantage && !hasDisadvantage) return '2d20kh'
  if (hasDisadvantage && !hasAdvantage) return '2d20kl'
  return '1d20'
}
