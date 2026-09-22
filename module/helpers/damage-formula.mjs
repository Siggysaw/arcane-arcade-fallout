// Shared by AttackRoll (module/dice/attack-roll.mjs — the attack dialog's
// displayed formula and the actual damage roll) and FalloutZeroActorSheet
// (module/sheets/actor-sheet.mjs — the Combat tab's weapon rows) so both
// places apply the exact same math for a perk-driven "roll N additional
// damage dice" effect (currently just Empowered Energy) instead of
// reimplementing the regex twice and risking the two drifting apart.
//
// This adds to the *number* of dice rolled (e.g. "2d6" -> "3d6" for
// count=1) — distinct from AttackRoll#stepFormula and the standalone
// `UpgradeFormula` Handlebars helper (registerSettings.mjs) elsewhere in
// this codebase, which instead step the *die size* up or down a rank (e.g.
// "2d6" -> "2d8") for weapon-upgrade bonus properties like "DMG Dice Up".
// The two are independent transforms and compose fine when both apply to
// the same weapon (order doesn't matter — neither one looks at what the
// other changed).
export function addDiceCount(formula, count) {
  if (!formula || !count) return formula
  return formula.replace(/(\d+)d(\d+)/gi, (match, diceCount, dieSize) => `${Number(diceCount) + count}d${dieSize}`)
}
