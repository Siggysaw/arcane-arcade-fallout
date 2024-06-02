export const FALLOUTZERO = {}

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */
FALLOUTZERO.abilities = {
  str: 'Strength',
  per: 'Perception',
  end: 'Endurance',
  cha: 'Charisma',
  int: 'Intelligence',
  agi: 'Agility',
  lck: 'Luck',
}

FALLOUTZERO.skills = {
  barter: 'Barter',
  breach: 'Breach',
  crafting: 'Crafting',
  energy_weapons: 'Energy Weapons',
  explosives: 'Explosives',
  guns: 'Guns',
  intimidation: 'Intimidation',
  medicine: 'Medicine',
  melee_weapons: 'Melee Weapons',
  science: 'Science',
  sneak: 'Sneak',
  speech: 'Speech',
  survival: 'Surival',
  unarmed: 'Unarmed',
}
FALLOUTZERO.penalties = {
  hunger: 'Hunger',
  dehydration: 'Dehydration',
  exhaustion: 'Exhaustion',
  radiation: 'Radiation',
  fatigue: 'Fatigue',
}

FALLOUTZERO.abilityAbbreviations = {
  str: 'Str',
  per: 'Per',
  end: 'End',
  cha: 'Cha',
  int: 'Int',
  agi: 'Agi',
  lck: 'Lck',
}


FALLOUTZERO.conditions = {
  blinded: {
    label: 'Blinded',
  },
  bleeding: {
    label: 'Bleeding',
    levels: 10,
  },
  burning: {
    label: 'Burning',
  },
  buzzed: {
    label: 'Buzzed',
  },
  corroded: {
    label: 'Corroded',
  },
  dazed: {
    label: 'Dazed',
  },
  deafened: {
    label: 'Deafened',
  },
  dehydration: {
    label: 'Dehydration',
    levels: 10,
  },
  drunk: {
    label: 'Drunk',
    riders: ['buzzed'],
  },
  encumbered: {
    label: 'Encumbered',
  },
  exhaustion: {
    label: 'Exhaustion',
    levels: 10,
  },
  fatigue: {
    label: 'Fatigue',
    levels: 9,
  },
  frightened: {
    label: 'Frightened',
  },
  grappled: {
    label: 'Grappled',
  },
  hammered: {
    label: 'Hammered',
    riders: ['buzzed', 'drunk'],
  },
  heavilyEncumbered: {
    label: 'Heavily Encumbered',
  },
  hunger: {
    label: 'Hunger',
    levels: 10,
  },
  invisible: {
    label: 'Invisible',
  },
  poisoned: {
    label: 'Poisoned',
  },
  prone: {
    label: 'Prone',
  },
  radiation: {
    label: 'Radiation',
    levels: 10,
  },
  restrained: {
    label: 'Restrained',
  },
  shadowed: {
    label: 'Shadowed',
  },
  shock: {
    label: 'Shock',
  },
  slowed: {
    label: 'Slowed',
  },
  unconscious: {
    label: 'Unconscious',
    riders: ['prone'],
  },
  wasted: {
    label: 'Wasted',
    riders: ['buzzed', 'drunk', 'hammered'],
  },
}
