export const FALLOUTZERO = {
  systemId: 'arcane-arcade-fallout',
}

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */
FALLOUTZERO.races = {
  human: {
    id: 'human',
    label: 'Human',
    reference: '',
  },
  ghoul: {
    id: 'ghoul',
    label: 'Ghoul',
    reference: '',
  },
  superMutant: {
    id: 'superMutant',
    label: 'Super Mutant',
    reference: '',
  },
  gen2Synth: {
    id: 'gen2Synth',
    label: 'Gen-2 Synth',
    reference: '',
  },
  robot: {
    id: 'robot',
    label: 'Robot',
    reference: '',
  },
  custom: {
    id: 'custom',
    label: 'Custom',
    reference: '',
  },
}
FALLOUTZERO.abilities = {
  str: {
    id: 'str',
    label: 'Strength',
    reference: '',
    modifiers: 0,
    base: 0,
    penalties: true,
  },
  per: {
    id: 'per',
    label: 'Perception',
    reference: '',
    modifiers: 0,
    base: 0,
    penalties: true,
  },
  end: {
    id: 'end',
    label: 'Endurance',
    reference: '',
    modifiers: 0,
    base: 0,
    penalties: true,
  },
  cha: {
    id: 'cha',
    label: 'Charisma',
    reference: '',
    modifiers: 0,
    base: 0,
    penalties: true,
  },
  int: {
    id: 'int',
    label: 'Intelligence',
    reference: '',
    modifiers: 0,
    base: 0,
    penalties: true,
  },
  agi: {
    id: 'agi',
    label: 'Agility',
    reference: '',
    modifiers: 0,
    base: 0,
    penalties: true,
  },
  lck: {
    id: 'lck',
    label: 'Luck',
    reference: '',
    modifiers: 0,
    base: 0,
    penalties: false,
  },
}

FALLOUTZERO.skills = {
  barter: {
    id: 'barter',
    label: 'Barter',
    ability: ['cha'],
    reference: '',
    modifiers: 0,
    base: 0,
  },
  breach: {
    id: 'breach',
    label: 'Breach',
    ability: ['per', 'int'],
    reference: '',
    modifiers: 0,
    base: 0,
  },
  crafting: {
    id: 'crafting',
    label: 'Crafting',
    ability: ['int'],
    reference: '',
    modifiers: 0,
    base: 0,
  },
  energy_weapons: {
    id: 'energy_weapons',
    label: 'Energy Weapons',
    ability: ['per'],
    reference: '',
    modifiers: 0,
    base: 0,
  },
  explosives: {
    id: 'explosives',
    label: 'Explosives',
    ability: ['per'],
    reference: '',
    modifiers: 0,
    base: 0,
  },
  guns: {
    id: 'guns',
    label: 'Guns',
    ability: ['agi'],
    reference: '',
    modifiers: 0,
    base: 0,
  },
  intimidation: {
    id: 'intimidation',
    label: 'Intimidation',
    ability: ['str', 'cha'],
    reference: '',
    modifiers: 0,
    base: 0,
  },
  medicine: {
    id: 'medicine',
    label: 'Medicine',
    ability: ['per', 'int'],
    reference: '',
    modifiers: 0,
    base: 0,
  },
  melee_weapons: {
    id: 'melee_weapons',
    label: 'Melee Weapons',
    ability: ['str'],
    reference: '',
    modifiers: 0,
    base: 0,
  },
  science: {
    id: 'science',
    label: 'Science',
    ability: ['int'],
    reference: '',
    modifiers: 0,
    base: 0,
  },
  sneak: {
    id: 'sneak',
    label: 'Sneak',
    ability: ['agi'],
    reference: '',
    modifiers: 0,
    base: 0,
  },
  speech: {
    id: 'speech',
    label: 'Speech',
    ability: ['cha'],
    reference: '',
    modifiers: 0,
    base: 0,
  },
  survival: {
    id: 'survival',
    label: 'Survival',
    ability: ['end'],
    reference: '',
    modifiers: 0,
    base: 0,
  },
  unarmed: {
    id: 'unarmed',
    label: 'Unarmed',
    ability: ['str'],
    reference: '',
    modifiers: 0,
    base: 0,
  },
}

FALLOUTZERO.limbdamage = {
  Eye_Gouged: {
    label: 'Eye Gouged',
    description: `The target’s Perception ability score is reduced by 2. If both eyes are gouged, the target creature is permanently blinded. (But can take the Blind Devil perk!) Concussion. The target has three permanent levels of exhaustion for a number of days equal to the target’s Endurance ability score - 10 (to a minimum of 1).`,
  },
  Broken_Arm: {
    label: 'Broken Arm',
    description: `The target has disadvantage on any ability check, skill check, or attack roll that uses Strength or Agility that require two arms. This condition can be removed with a doctor’s bag.`,
  },
  Severed_Arm_or_Hand: {
    label: 'Severed Arm/Hand',
    description: `The target loses a hand if their Luck score is equal to 6 or higher. The target loses an arm if their Luck score is equal to 5 or lower. If the target loses their hand: they go into shock, gain two levels of bleeding, and their Agility ability score is reduced by 2. If the target loses their arm: they go into shock, gain four levels of bleeding, and their Agility ability score is reduced by 2 and their Strength ability score is reduced by 2. (But can take the Adaptive Reflexes perk!)`,
  },
  Rattled: {
    label: 'Rattled',
    description: `The target becomes frightened for 3 turns`,
  },
  Sliced_Jugular: {
    label: 'Sliced Jugular',
    description: `The target gains four levels of bleeding and gains two at the start of each of their turns until all levels of bleeding are healed.`,
  },
  Temporary_Blindness: {
    label: 'Blindness',
    description: `The target becomes blinded for the next hour or until all of their hit points are healed.`,
  },
  Internal_Bleeding: {
    label: 'Bleeding',
    description: `The target gains one level of bleeding and gains one at the start of each of their turns until all levels of bleeding are healed.`,
  },
  Intense_Agony: {
    label: 'Intense Agony',
    description: `The target goes into shock and is dazed for 2 turns.`,
  },
  Severed_Leg_or_Foot: {
    label: 'Severed Leg/Foot',
    description: `The target loses a foot if their Luck score is equal to 6 or higher. The target loses their leg if their Luck score is equal to 5 or lower. If the target loses their foot: they go into shock, gain two levels of bleeding, and their Agility ability score is reduced by 2. If the target loses their leg: they go into shock, gain four levels of bleeding, and their Agility ability score is reduced by 2 and their Strength ability score is reduced by 2. (But can take the Adaptive Reflexes perk!). Additionally, a creature who loses their foot or leg can only move a maximum of 20 feet on a turn. If the target loses all of their feet or legs, they fall prone and their only movement option is to crawl.`,
  },
  Gut_Wallop: {
    label: 'Gut Wallop',
    description: `The target becomes dazed for the next 2 turns.`,
  },
  Painful_Collapse: {
    label: 'Painful Collapse',
    description: `The target falls prone and becomes dazed until the end of their next turn. Leg Cripple. The target can only move a maximum of 20 feet on a turn until all their hit points are healed.`,
  },
}

FALLOUTZERO.materials = {
  acid: {
    label: 'Acid',
    load: '.1',
    quantity: '0',
  },
  adhesive: {
    label: 'Adhesive',
    load: '.1',
    quantity: '0',
  },
  aluminum: {
    label: 'Aluminum',
    load: '.1',
    quantity: '0',
  },
  antiseptic: {
    label: 'Antiseptic',
    load: '.1',
    quantity: '0',
  },
  asbestos: {
    label: 'Asbestos',
    load: '.1',
    quantity: '0',
  },
  ballisticfiber: {
    label: 'Ballistic Fiber',
    load: '.1',
    quantity: '0',
  },
  ceramic: {
    label: 'Ceramic',
    load: '.1',
    quantity: '0',
  },
  circuitry: {
    label: 'Circuitry',
    load: '.1',
    quantity: '0',
  },
  cloth: {
    label: 'Cloth',
    load: '.1',
    quantity: '0',
  },
  copper: {
    label: 'Copper',
    load: '.1',
    quantity: '0',
  },
  crystal: {
    label: 'Crystal',
    load: '.1',
    quantity: '0',
  },
  fertilizer: {
    label: 'Fertilizer',
    load: '.1',
    quantity: '0',
  },
  fiberoptics: {
    label: 'Fiber Optics',
    load: '.1',
    quantity: '0',
  },
  fiberglass: {
    label: 'Fiberglass',
    load: '.1',
    quantity: '0',
  },
  glass: {
    label: 'Glass',
    load: '.1',
    quantity: '0',
  },
  lead: {
    label: 'Lead',
    load: '.1',
    quantity: '0',
  },
  leather: {
    label: 'Leather',
    load: '.1',
    quantity: '0',
  },
  nuclearmaterial: {
    label: 'Nuclear Material',
    load: '.1',
    quantity: '0',
  },
  oil: {
    label: 'Oil',
    load: '.1',
    quantity: '0',
  },
  paint: {
    label: 'Paint',
    load: '.1',
    quantity: '0',
  },
  plastic: {
    label: 'Plastic',
    load: '.1',
    quantity: '0',
  },
  rubber: {
    label: 'Rubber',
    load: '.1',
    quantity: '0',
  },
  screw: {
    label: 'Screw',
    load: '.1',
    quantity: '0',
  },
  silver: {
    label: 'Silver',
    load: '.1',
    quantity: '0',
  },
  spring: {
    label: 'Spring',
    load: '.1',
    quantity: '0',
  },
  steel: {
    label: 'Steel',
    load: '.1',
    quantity: '0',
  },
  wood: {
    label: 'Wood',
    load: '.1',
    quantity: '0',
  },
}

FALLOUTZERO.penalties = {
  hunger: 'Hunger',
  dehydration: 'Dehydration',
  exhaustion: 'Exhaustion',
  radiation: 'Radiation',
  fatigue: 'Fatigue',
  hypothermia: 'Hypothermia',
  overheating: 'Overheating',
  other: 'Other',
}

FALLOUTZERO.maxKarmaCaps = 7

FALLOUTZERO.rules = {
}

//MONSTER LOOT as described in the book (v2.0)
FALLOUTZERO.monsterLoot = [
  {
    name: 'Glowing One',
    dice: 'LckDC10',
    loot: [
      { all: [['material', 'Radioactive Gland']] },
      {
        dc: [
          ['money', 'Bottlecap'],
          ['medicine', 'Rad-X'],
        ],
      },
    ],
  },
  {
    name: 'Glowing One Putrid',
    dice: 'LckDC10',
    loot: [{ all: [['material', 'Radioactive Gland']] }, { dc: [['money', 'Bottlecap']] }],
  },
  {
    name: 'Glowing One Bloated',
    dice: 'LckDC10',
    loot: [{ all: [['material', 'Radioactive Gland']] }, { dc: [['money', 'Bottlecap']] }],
  },
  {
    name: 'Super Mutant',
    dice: 'All',
    loot: [
      {
        all: [
          ['rangedweapons', 'Hunting Rifle'],
          ['text', ' (3rd-level Decay)'],
          ['qty', '2x'],
          ['ammunition', '.308'],
          ['melee-weapons', 'Board'],
          ['explosives', 'Molotov Cocktail'],
          ['text', ' (Unless it it was used)'],
          ['qty', '3x '],
          ['material', 'Bone'],
        ],
      },
    ],
  },
  {
    name: 'Super Mutant Suicider',
    dice: 'All',
    loot: [
      {
        all: [
          ['ammunition', 'Mini Nuke'],
          ['text', ' (Unless it exploded)'],
        ],
      },
    ],
  },
  {
    name: 'Super Mutant Skirmisher',
    dice: 'All',
    loot: [
      {
        all: [
          ['rangedweapons', 'Thompson SMG'],
          ['text', ' (3rd-level Decay)'],
          ['qty', '2x'],
          ['ammunition', '.308'],
          ['melee-weapons', 'Board'],
          ['explosives', 'Molotov Cocktail'],
          ['text', '(Unless it it was used)'],
          ['qty', '3x '],
          ['material', 'Bones'],
        ],
      },
    ],
  },
  {
    name: 'Super Mutant Brute',
    dice: 'All',
    loot: [
      {
        all: [
          ['rangedweapons', 'Hunting Rifle'],
          ['text', ' (3rd-level Decay)'],
          ['qty', '2x'],
          ['ammunition', '12 gauge'],
          ['melee-weapons', 'Plastic Bumper Sword'],
          ['explosives', 'Frag Grenade'],
          ['text', ' (Unless it it was used)'],
          ['qty', '3x '],
          ['material', 'Bones'],
        ],
      },
    ],
  },
  {
    name: 'Super Mutant Butcher',
    dice: 'All',
    loot: [
      {
        all: [
          ['melee-weapons', 'Fire Axe'],
          ['explosives', 'Frag Grenade'],
          ['text', ' (Unless it it was used)'],
          ['qty', '3x '],
          ['material', 'Bones'],
        ],
      },
    ],
  },
  {
    name: 'Super Mutant Master',
    dice: 'LckDC12',
    loot: [
      {
        all: [
          ['rangedweapons', 'Minigun'],
          ['text', ' (4th-level Decay)'],
          ['rangedweapons', 'Missile Launcher'],
          ['text', ' (5th-level Decay)'],
          ['qty', '3x '],
          ['ammunition', '5mm'],
          ['qty', '3x '],
          ['ammunition', 'Missile'],
        ],
      },
      {
        dc: [
          ['money', '[4d10 Bottlecap'],
          ['qty', '3x '],
          ['medicine', 'Stimpak'],
        ],
      },
    ],
  },
  {
    name: 'Brahmin',
    dice: 'All',
    loot: [
      {
        all: [
          ['material', 'Brahmin Meat'],
          ['material', 'Brahmin Hide'],
        ],
      },
    ],
  },
  { name: 'Dog', dice: 'All', loot: [{ all: [['material', 'Dog Meat']] }] },
  { name: 'Dog', dice: 'All', loot: [{ all: [['material', 'Dog Meat']] }] },
  { name: 'Mongrel', dice: 'All', loot: [{ all: [['material', 'Mongrel Meat']] }] },
  { name: 'Mongrel Alpha', dice: 'All', loot: [{ all: [['material', 'Mongrel Meat']] }] },
  { name: 'Mole Rat', dice: 'All', loot: [{ all: [['material', 'Mole Rat Meat']] }] },
  {
    name: 'Mole Rat Brood Mother',
    dice: 'All',
    loot: [
      {
        all: [
          ['material', 'Mole Rat Meat'],
          ['material', 'Mole Rat Hide'],
        ],
      },
    ],
  },
  {
    name: 'Radstag',
    dice: 'LckDC12',
    loot: [
      {
        all: [
          ['material', 'Radstag Meat'],
          ['material', 'Radstag Hide'],
        ],
      },
      { dc: [['money', '[1d10 Bottlecap']] },
    ],
  },
  {
    name: 'Mutated Bear',
    dice: 'All',
    loot: [
      {
        all: [
          ['material', 'Bear Meat'],
          ['material', 'Bear Skull'],
        ],
      },
    ],
  },
  {
    name: 'Deathclaw',
    dice: 'All',
    loot: [
      {
        all: [
          ['material', 'Deathclaw Meat'],
          ['material', 'Deathclaw Hide'],
          ['material', 'Deathclaw Hand'],
          ['material', 'Deathclaw Egg'],
        ],
      },
    ],
  },
  { name: 'Giant Ant', dice: 'All', loot: [{ all: [['material', 'Ant Meat']] }] },
  { name: 'Giant Ant Soldier', dice: 'All', loot: [{ all: [['material', 'Ant Meat']] }] },
  { name: 'Fire Ant', dice: 'All', loot: [{ all: [['material', 'Fire Ant Meat']] }] },
  {
    name: 'Giant Ant Queen',
    dice: 'All',
    loot: [
      {
        all: [
          ['qty', '3x'],
          ['material', 'Fire Ant Meat'],
          ['qty', '3x '],
          ['material', 'Ant Egg'],
        ],
      },
    ],
  },
  { name: 'Bloatfly', dice: 'All', loot: [{ all: [['material', 'Bloatfly Meat']] }] },
  { name: 'Bloatfly Black', dice: 'All', loot: [{ all: [['material', 'Bloatfly Meat']] }] },
  { name: 'Bloodbug', dice: 'All', loot: [{ all: [['material', 'Bloodbug Meat']] }] },
  {
    name: 'Fog Crawler',
    dice: 'All',
    loot: [
      {
        all: [
          ['qty', '5x '],
          ['material', 'Mirelurk Meat'],
        ],
      },
    ],
  },
  { name: 'Mirelurk', dice: 'All', loot: [{ all: [['material', 'Mirelurk Meat']] }] },
  { name: 'Mirelurk Razorclaw', dice: 'All', loot: [{ all: [['material', 'Mirelurk Meat']] }] },
  {
    name: 'Mirelurk Queen',
    dice: 'All',
    loot: [
      {
        all: [
          ['qty', '5x '],
          ['material', 'Mirelurk Meat'],
        ],
      },
    ],
  },
  {
    name: 'Cazador',
    dice: 'LckDC15',
    loot: [{ all: [['material', 'Cazador Poison Gland']] }, { dc: [['material', 'Cazador Egg']] }],
  },
  { name: 'Cazador Young', dice: 'All', loot: [{ all: [['material', 'Cazador Poison Gland']] }] },
  {
    name: 'Cazador Legendary',
    dice: 'LckDC10',
    loot: [{ all: [['material', 'Cazador Poison Gland']] }, { dc: [['material', 'Cazador Egg']] }],
  },
  {
    name: 'Radscorpion',
    dice: 'LckDC15',
    loot: [
      {
        all: [
          ['material', 'Radscorpion Poison Gland'],
          ['material', 'Radscorpion Meat'],
          ['material', 'Radscorpion Stinger'],
        ],
      },
      { dc: [['material', 'Radscorpion Egg']] },
    ],
  },
  {
    name: 'Radscorpion Glowing',
    dice: 'LckDC15',
    loot: [
      {
        all: [
          ['material', 'Radscorpion Poison Gland'],
          ['material', 'Radscorpion Meat'],
          ['material', 'Radscorpion Stinger'],
        ],
      },
      { dc: [['material', 'Radscorpion Egg']] },
    ],
  },
  {
    name: 'Radscorpion Stalker',
    dice: 'LckDC15',
    loot: [
      {
        all: [
          ['material', 'Radscorpion Poison Gland'],
          ['material', 'Radscorpion Meat'],
          ['material', 'Radscorpion Stinger'],
        ],
      },
      { dc: [['material', 'Radscorpion Egg']] },
    ],
  },
  { name: 'Radroach', dice: 'All', loot: [{ all: [['material', 'Radroach Meat']] }] },
  { name: 'Rattler', dice: 'All', loot: [{ all: [['material', 'Rattler Poison Gland']] }] },
  {
    name: 'Stingwing',
    dice: 'All',
    loot: [
      {
        all: [
          ['material', 'Stingwing Meat'],
          ['material', 'Stingwing Barb'],
        ],
      },
    ],
  },
  {
    name: 'Stingwing Skimmer',
    dice: 'All',
    loot: [
      {
        all: [
          ['material', 'Stingwing Meat'],
          ['material', 'Stingwing Barb'],
        ],
      },
    ],
  },
  {
    name: 'Stingwing Chaser',
    dice: 'All',
    loot: [
      {
        all: [
          ['material', 'Stingwing Meat'],
          ['material', 'Stingwing Barb'],
        ],
      },
    ],
  },
  {
    name: 'Assaultron',
    dice: 'All',
    loot: [
      {
        all: [
          ['qty', `[1d6+totLckMod `],
          ['ammunition', 'Energy Cell'],
          ['qty', '2x '],
          ['material', 'Aluminum'],
          ['medicine', 'RobCo Quick Fix-it 1.0'],
          ['material', 'Assaultron Circuit Board'],
        ],
      },
    ],
  },
  {
    name: 'Assaultron Invader',
    dice: 'All',
    loot: [
      {
        all: [
          ['qty', `[1d6+totLckMod `],
          ['ammunition', 'Energy Cell'],
          ['qty', '2x '],
          ['material', 'Aluminum'],
          ['medicine', 'RobCo Quick Fix-it 1.0'],
          ['material', 'Assaultron Circuit Board'],
        ],
      },
    ],
  },
  {
    name: 'Assaultron Dominator',
    dice: 'All',
    loot: [
      {
        all: [
          ['qty', `[2d6+totLckMod `],
          ['ammunition', 'Energy Cell'],
          ['qty', '2x '],
          ['material', 'Aluminum'],
          ['medicine', 'RobCo Quick Fix-it 2.0'],
          ['material', 'Assaultron Circuit Board'],
        ],
      },
    ],
  },
  {
    name: 'Eyebot',
    dice: 'All',
    loot: [
      {
        all: [
          ['qty', '2x '],
          ['material', 'Steel'],
        ],
      },
    ],
  },
  {
    name: 'Mister Gutsy',
    dice: 'All',
    loot: [
      {
        all: [
          ['qty', '2x '],
          ['material', 'Steel'],
          ['qty', `[1d4+totLckMod`],
          ['ammunition', '10mm'],
        ],
      },
    ],
  },
  {
    name: 'Major Gutsy',
    dice: 'All',
    loot: [
      {
        all: [
          ['qty', '2x '],
          ['material', 'Steel'],
          ['qty', `[1d4+totLckMod`],
          ['ammunition', 'Energy Cell'],
        ],
      },
    ],
  },
  {
    name: 'Mister Handy',
    dice: 'All',
    loot: [
      {
        all: [
          ['qty', '2x '],
          ['material', 'Steel'],
          ['qty', `[1d4+totLckMod`],
          ['ammunition', '10mm'],
        ],
      },
    ],
  },
  {
    name: 'Protectron',
    dice: 'All',
    loot: [
      {
        all: [
          ['qty', `[1d6+totLckMod `],
          ['ammunition', 'Energy Cell'],
          ['qty', '2x '],
          ['material', 'Steel'],
          ['medicine', 'RobCo Quick Fix-it 1.0'],
        ],
      },
    ],
  },
  {
    name: 'Protectron Medic',
    dice: 'All',
    loot: [
      {
        all: [
          ['qty', `[1d6+totLckMod `],
          ['ammunition', 'Energy Cell'],
          ['qty', '2x '],
          ['material', 'Steel'],
          ['medicine', 'RobCo Quick Fix-it 1.0'],
        ],
      },
    ],
  },
  {
    name: 'Protectron Fire Brigadier',
    dice: 'All',
    loot: [
      {
        all: [
          ['qty', `[1d6+totLckMod `],
          ['ammunition', 'Energy Cell'],
          ['qty', '2x '],
          ['material', 'Steel'],
          ['medicine', 'RobCo Quick Fix-it 1.0'],
        ],
      },
    ],
  },
  {
    name: 'Protectron Utility',
    dice: 'All',
    loot: [
      {
        all: [
          ['qty', `[1d6+totLckMod `],
          ['ammunition', 'Energy Cell'],
          ['qty', '2x '],
          ['material', 'Steel'],
          ['medicine', 'RobCo Quick Fix-it 2.0'],
        ],
      },
    ],
  },
  {
    name: 'Protectron Police',
    dice: 'All',
    loot: [
      {
        all: [
          ['qty', `[1d6+totLckMod `],
          ['ammunition', 'Energy Cell'],
          ['qty', '2x '],
          ['material', 'Steel'],
          ['medicine', 'RobCo Quick Fix-it 1.0'],
        ],
      },
    ],
  },
  {
    name: 'Sentry Bot',
    dice: 'All',
    loot: [
      {
        all: [
          ['qty', '2x '],
          ['ammunition', 'Fusion Core'],
          ['qty', '4x '],
          ['material', 'Steel'],
          ['qty', '2x '],
          ['material', 'Gear'],
        ],
      },
    ],
  },
  {
    name: 'Robobrain',
    dice: 'All',
    loot: [
      {
        all: [
          ['qty', '4x '],
          ['material', 'Steel'],
          ['qty', '2x '],
          ['ammunition', 'Energy Cell'],
        ],
      },
    ],
  },
  {
    name: 'Brotherhood Initiate',
    dice: 'All',
    loot: [
      {
        all: [
          ['armor', 'Leather Armor'],
          ['melee-weapons', 'Police Baton'],
          ['rangedweapons', 'Laser pistol'],
          ['qty', '[2d8 '],
          ['ammunition', 'Fusion Cell'],
          ['money', `[2d4+totLckMod Bottlecap`],
        ],
      },
    ],
  },
  {
    name: 'Brotherhood Knight',
    dice: 'All',
    loot: [
      {
        all: [
          ['armor', 'Steel Armor'],
          ['melee-weapons', 'Police Baton'],
          ['rangedweapons', 'Laser rifle'],
          ['qty', '[2d8 '],
          ['ammunition', 'Fusion Cell'],
          ['money', `[3d4+totLckMod Bottlecap`],
        ],
      },
    ],
  },
  {
    name: 'Brotherhood Scribe',
    dice: 'All',
    loot: [
      {
        all: [
          ['armor', 'Cloth Armor'],
          ['text', ' (reinforced)'],
          ['melee-weapons', 'Power Fist'],
          ['explosives', 'Pulse Grenade'],
          ['text', ' (if available)'],
          ['qty', '2x '],
          ['medicine', 'Stimpak'],
          ['text', ' (if available)'],
          ['qty', '[2d8 '],
          ['ammunition', 'Microfusion Cell'],
          ['money', `[4d4+totLckMod Bottlecap`],
        ],
      },
    ],
  },
  {
    name: 'Brotherhood Paladin',
    dice: 'All',
    loot: [
      {
        all: [
          ['powerarmor', 'T-60'],
          ['text', ' (reinforced)'],
          ['melee-weapons', 'Power Fist'],
          ['rangedweapons', 'Gatling laser'],
          ['qty', '2x '],
          ['explosives', 'Pulse Grenade'],
          ['text', ' (if available)'],
          ['qty', '2x '],
          ['medicine', 'Auto-Inject Stimpak'],
          ['text', ' (if available)'],
          ['qty', '3x '],
          ['ammunition', 'Fusion Core'],
          ['money', `[5d4+totLckMod Bottlecap`],
        ],
      },
    ],
  },
  {
    name: 'Civilian',
    dice: 'All',
    loot: [
      {
        all: [
          ['money', `[1d6+totLckMod Bottlecap`],
          ['melee-weapons', 'Knife'],
          ['rangedweapons', '9mm pistol'],
          ['text', ' (2nd-level Decay)'],
          ['qty', '6x '],
          ['ammunition', '9mm'],
          ['armor', 'Cloth Armor'],
          ['food-and-drinks', 'Salisbury Steak'],
          ['qty', '2x '],
          ['food-and-drinks', 'Purified water'],
        ],
      },
    ],
  },
  {
    name: 'Doctor',
    dice: 'All',
    loot: [
      {
        all: [
          ['money', `[4d10+totLckMod Bottlecap`],
          ['melee-weapons', 'Knife'],
          ['armor', 'Cloth Armor'],
          ['qty', '2x '],
          ['medicine', 'Stimpak'],
          ['medicine', 'First Aid Kit'],
          ['qty', '2x '],
          ['food-and-drinks', 'Purified water'],
          ['food-and-drinks', 'Salisbury Steak'],
        ],
      },
    ],
  },
  {
    name: 'Guard',
    dice: 'All',
    loot: [
      {
        all: [
          ['money', `[2d10+totLckMod Bottlecap`],
          ['melee-weapons', 'Police Baton'],
          ['rangedweapons', '10mm pistol'],
          ['text', ' (2nd-level Decay)'],
          ['rangedweapons', 'Hunting Shotgun'],
          ['text', ' (4th-level Decay)'],
          ['armor', 'Leather Armor'],
          ['text', ' (Hardened)'],
          ['medicine', 'First Aid Kit'],
          ['food-and-drinks', 'Brahmin Steak'],
          ['qty', '2x '],
          ['food-and-drinks', 'Purified water'],
        ],
      },
    ],
  },
  {
    name: 'junkie',
    dice: 'All',
    loot: [{ all: [['text', 'Nothing']] }],
  },
] //end of list of offical monster loot (without roll tables)

FALLOUTZERO.conditions = {
  blinded: {
    id: 'blinded',
    label: 'Blinded',
  },
  bleeding: {
    id: 'bleeding',
    label: 'Bleeding',
    levels: 10,
  },
  burning: {
    id: 'burning',
    label: 'Burning',
  },
  buzzed: {
    id: 'buzzed',
    label: 'Buzzed',
  },
  corroded: {
    id: 'corroded',
    label: 'Corroded',
  },
  dazed: {
    id: 'dazed',
    label: 'Dazed',
  },
  deafened: {
    id: 'deafened',
    label: 'Deafened',
  },
  dehydration: {
    id: 'dehydration',
    label: 'Dehydration',
    levels: 10,
  },
  drunk: {
    id: 'drunk',
    label: 'Drunk',
    riders: ['buzzed'],
  },
  encumbered: {
    id: 'encumbered',
    label: 'Encumbered',
  },
  exhaustion: {
    id: 'exhaustion',
    label: 'Exhaustion',
    levels: 10,
  },
  fatigue: {
    id: 'fatigue',
    label: 'Fatigue',
    levels: 9,
  },
  frightened: {
    id: 'frightened',
    label: 'Frightened',
  },
  grappled: {
    id: 'grappled',
    label: 'Grappled',
  },
  hammered: {
    id: 'hammered',
    label: 'Hammered',
    riders: ['buzzed', 'drunk'],
  },
  heavilyEncumbered: {
    id: 'heavilyEncumbered',
    label: 'Heavily Encumbered',
  },
  hunger: {
    id: 'hunger',
    label: 'Hunger',
    levels: 10,
  },
  invisible: {
    id: 'invisible',
    label: 'Invisible',
  },
  poisoned: {
    id: 'poisoned',
    label: 'Poisoned',
  },
  prone: {
    id: 'prone',
    label: 'Prone',
  },
  radiation: {
    id: 'radiation',
    label: 'Radiation',
    levels: 10,
  },
  restrained: {
    id: 'restrained',
    label: 'Restrained',
  },
  shadowed: {
    id: 'shadowed',
    label: 'Shadowed',
  },
  shock: {
    id: 'shock',
    label: 'Shock',
  },
  slowed: {
    id: 'slowed',
    label: 'Slowed',
  },
  unconscious: {
    id: 'unconscious',
    label: 'Unconscious',
    riders: ['prone'],
  },
  wasted: {
    id: 'wasted',
    label: 'Wasted',
    riders: ['buzzed', 'drunk', 'hammered'],
  },
}

FALLOUTZERO.damageTypes = {
  slashing: {
    id: 'slashing',
    label: 'Slashing',
  },
  piercing: {
    id: 'piercing',
    label: 'Piercing',
  },
  ballistic: {
    id: 'ballistic',
    label: 'Ballistic',
  },
  bludgeoning: {
    id: 'bludgeoning',
    label: 'Bludgeoning',
  },
  impact: {
    id: 'impact',
    label: 'Impact',
  },
  electricity: {
    id: 'electricity',
    label: 'Electricity',
  },
  plasma: {
    id: 'plasma',
    label: 'Plasma',
  },
  poison: {
    id: 'poison',
    label: 'Poison',
  },
  fire: {
    id: 'fire',
    label: 'Fire',
  },
  acid: {
    id: 'acid',
    label: 'Acid',
  },
  explosive: {
    id: 'explosive',
    label: 'Explosive',
  },
  laser: {
    id: 'laser',
    label: 'Laser',
  },
  radiation: {
    id: 'radiation',
    label: 'Radiation',
  },
  cryo: {
    id: 'cryo',
    label: 'Cryo',
  },
  sonic: {
    id: 'sonic',
    label: 'Sonic',
  },
  psychic: {
    id: 'psychic',
    label: 'Psychic',
  },
}


/**
 * Colors used to visualize temporary and temporary maximum HP in token health bars.
 * @enum {number}
 */
FALLOUTZERO.tokenHPColors = {
  damage: 0xff0000,
  healing: 0x00ff00,
  temp: 0x66ccff,
  tempmax: 0x440066,
  negmax: 0x550000,
}

FALLOUTZERO.craftingTypes = {
  ammunition: {
    id: 'ammunition',
    label: 'Ammo',
  },
  armor: {
    id: 'armor',
    label: 'Armor',
  },
  armor_upgrade: {
    id: 'armor_upgrade',
    label: 'Armor Upgrade',
  },
  big_guns: {
    id: 'big_guns',
    label: 'Big guns',
  },
  blades: {
    id: 'blades',
    label: 'Bladed weapons',
  },
  blunt: {
    id: 'blunt',
    label: 'Blunt weapons',
  },
  chems: {
    id: 'chems',
    label: 'Chems',
  },
  drinks: {
    id: 'drinks',
    label: 'Drinks',
  },
  energy_ammo: {
    id: 'energy_ammo',
    label: 'Energy ammo',
  },
  energy_weapons: {
    id: 'energy_weapons',
    label: 'Energy weapons',
  },
  fist: {
    id: 'fist',
    label: 'Fist weapons',
  },
  food: {
    id: 'food',
    label: 'Food',
  },
  gear: {
    id: 'gear',
    label: 'Gear',
  },
  heavy_ammo: {
    id: 'heavy_ammo',
    label: 'Heavy ammo',
  },
  medicines: {
    id: 'medicines',
    label: 'Medicines',
  },
  mechanical: {
    id: 'mechanical',
    label: 'Mechanical weapons',
  },
  pistols: {
    id: 'pistols',
    label: 'Pistols',
  },
  placed_explosives: {
    id: 'placed_explosives',
    label: 'Placed explosives',
  },
  power_armor: {
    id: 'power_armor',
    label: 'Power armor',
  },
  ranged_weapon_mods: {
    id: 'ranged_weapon_mods',
    label: 'Ranged weapon mods',
  },
  rifles: {
    id: 'rifles',
    label: 'Rifles',
  },
  shotguns: {
    id: 'shotguns',
    label: 'Shotguns',
  },
  special_ammo: {
    id: 'special_ammo',
    label: 'Special ammo',
  },
  special_energy_ammo: {
    id: 'special_energy_ammo',
    label: 'Special energy ammo',
  },
  sub_machine_guns: {
    id: 'sub_machine_guns',
    label: 'Sub-Machine guns',
  },
  syringe_ammo: {
    id: 'syringe_ammo',
    label: 'Syringe ammo',
  },
  thrown_explosives: {
    id: 'thrown_explosives',
    label: 'Thrown explosives',
  },
  unique: {
    id: 'unique',
    label: 'Unique',
  },
}


// Must match the actual Item document `type` values (see template.json's
// Item.types), not the crafting-category labels above or the compendium
// pack name suffixes below (packsWithCraftables) — those use a different
// naming convention (e.g. 'ammunition'/'food-and-drinks') and don't match
// any real item.type, which silently excluded ammo, explosives, food and
// drink, melee/ranged weapons, junk, and misc items from
// actor.craftingMaterials (an item held by the actor whose type didn't
// literally match one of these strings was never counted as an owned
// crafting material, regardless of how many the actor had).
FALLOUTZERO.craftingItemTypes = [
  'junkItem',
  'material',
  'armor',
  'ammo',
  'explosive',
  'foodAnddrink',
  'meleeWeapon',
  'rangedWeapon',
  'miscItem',
  'medicine',
  'armorUpgrade',
  'chem',
]

// The item types that carry a decay bar today (see the equipped-* item
// templates) and are therefore the ones the Repair Bench / item context
// menu's "Repair" entry can act on. powerArmor is excluded — it has no
// decay bar of its own in the current templates.
FALLOUTZERO.repairableTypes = ['armor', 'meleeWeapon', 'rangedWeapon']

FALLOUTZERO.packsWithCraftables = [
  'arcane-arcade-fallout.armor',
  'arcane-arcade-fallout.ammunition',
  'arcane-arcade-fallout.explosives',
  'arcane-arcade-fallout.chems',
  'arcane-arcade-fallout.medicine',
  'arcane-arcade-fallout.food-and-drinks',
  'arcane-arcade-fallout.melee-weapons',
  'arcane-arcade-fallout.rangedweapons',
  'arcane-arcade-fallout.upgrades',
  'arcane-arcade-fallout.miscellaneous',
]

FALLOUTZERO.armorTypes = {
  cloth: {
    id: 'cloth',
    label: 'Cloth',
    uuid: 'Compendium.arcane-arcade-fallout.armor.Item.ofJ31ZteGa6dGhLk',
  },
  leather: {
    id: 'leather',
    label: 'Leather',
    uuid: 'Compendium.arcane-arcade-fallout.armor.Item.9WBMPGzFlVcKfi0O',
  },
  metal: {
    id: 'metal',
    label: 'Metal',
    uuid: 'Compendium.arcane-arcade-fallout.armor.Item.xpO4PovVem4jyIek',
  },
  multilayered: {
    id: 'multilayered',
    label: 'Multilayered',
    uuid: 'Compendium.arcane-arcade-fallout.armor.Item.lO5HdXbJJZea9q3O',
  },
  ballistic: {
    id: 'ballistic',
    label: 'Ballistic weave',
    uuid: 'Compendium.arcane-arcade-fallout.armor.Item.RvlAwPZoxSaPZ5dj',
  },
  steel: {
    id: 'steel',
    label: 'Steel',
    uuid: 'Compendium.arcane-arcade-fallout.armor.Item.ubl4wd7zbO6KMT3z',
  },
  power: {
    id: 'power',
    label: 'Power',
    uuid: 'Compendium.arcane-arcade-fallout.armor.Item.GPl8d41kmcj411Le',
  },
}

// Repair DC bonus/materials/time straight from the Item Blueprint
// Encyclopedia's Armor table (pg 94), keyed by the same armorType id every
// armor item already carries in system.armorType — so every armor piece
// gets book-accurate repair data with no per-item authoring needed.
// "power" is intentionally excluded (power armor isn't a repairable type;
// see FALLOUTZERO.repairableTypes). Multilayered's book entry ("any
// combination of leather and cloth to equal 3 total junk items") is
// approximated here as a fixed x2 leather + x1 cloth.
FALLOUTZERO.armorRepairTable = {
  cloth: { bonus: 0, materials: [{ name: 'Cloth', quantity: 2 }], time: { value: 5, unit: 'minutes' } },
  leather: { bonus: 1, materials: [{ name: 'Leather', quantity: 2 }], time: { value: 10, unit: 'minutes' } },
  metal: { bonus: 1, materials: [{ name: 'Steel', quantity: 2 }, { name: 'Screws', quantity: 1 }], time: { value: 10, unit: 'minutes' } },
  multilayered: { bonus: 3, materials: [{ name: 'Leather', quantity: 2 }, { name: 'Cloth', quantity: 1 }], time: { value: 10, unit: 'minutes' } },
  ballistic: { bonus: 10, materials: [{ name: 'Ballistic Fiber', quantity: 2 }], time: { value: 10, unit: 'minutes' } },
  steel: { bonus: 5, materials: [{ name: 'Steel', quantity: 2 }, { name: 'Leather', quantity: 1 }], time: { value: 10, unit: 'minutes' } },
}

// Unlike armor, the book prices every melee/ranged weapon's repair cost as
// "x1 crafting material" repeated N times — N *distinct* materials of the
// player's choosing (from whatever that weapon's own crafting recipe
// uses), not a fixed named list. So these tables (transcribed from the
// Item Blueprint Encyclopedia's weapon tables, pg 97-108) only carry the
// repair DC bonus and that slot count N ("slots") plus repair time; the
// actual material *names* come from the item's own system.crafting.materials
// at runtime (see FalloutZeroItem#getRepairRequirements/_repairMaterialPool).
// Keyed by lowercased item name for a direct, case-insensitive lookup — a
// name not found here (homebrew items, a naming mismatch) falls back to a
// generic default rather than throwing.
//
// A few items have a unique alternate material that repairs extra levels
// of decay (Sharpened Pole/wood, the Bumper Swords, Ski Sword) — that
// bonus-levels mechanic isn't modeled yet; these are listed here using
// just their ordinary "or x1 crafting material" fallback slot count.
FALLOUTZERO.meleeWeaponRepairTable = {
  'knife': { bonus: 1, slots: 2, time: { value: 5, unit: 'minutes' } },
  'switchblade': { bonus: 1, slots: 2, time: { value: 5, unit: 'minutes' } },
  'sharpened pole': { bonus: 1, slots: 1, time: { value: 15, unit: 'minutes' } },
  'combat knife': { bonus: 3, slots: 2, time: { value: 5, unit: 'minutes' } },
  'throwing knife': { bonus: 1, slots: 1, time: { value: 5, unit: 'minutes' } },
  'spear': { bonus: 1, slots: 2, time: { value: 5, unit: 'minutes' } },
  'sword': { bonus: 3, slots: 2, time: { value: 10, unit: 'minutes' } },
  'plastic bumper sword': { bonus: 3, slots: 2, time: { value: 5, unit: 'minutes' } },
  'steel bumper sword': { bonus: 3, slots: 2, time: { value: 5, unit: 'minutes' } },
  'cleaver': { bonus: 1, slots: 2, time: { value: 5, unit: 'minutes' } },
  'fire axe': { bonus: 1, slots: 2, time: { value: 5, unit: 'minutes' } },
  'hatchet': { bonus: 3, slots: 2, time: { value: 5, unit: 'minutes' } },
  'machete': { bonus: 1, slots: 2, time: { value: 5, unit: 'minutes' } },
  'assaultron blade': { bonus: 5, slots: 3, time: { value: 15, unit: 'minutes' } },
  'guitar sword': { bonus: 5, slots: 3, time: { value: 10, unit: 'minutes' } },
  'sickle': { bonus: 1, slots: 2, time: { value: 5, unit: 'minutes' } },
  'ski sword': { bonus: 3, slots: 1, time: { value: 5, unit: 'minutes' } },
  'pickaxe': { bonus: 3, slots: 2, time: { value: 5, unit: 'minutes' } },
  'pitchfork': { bonus: 1, slots: 2, time: { value: 5, unit: 'minutes' } },
  'police baton': { bonus: 3, slots: 2, time: { value: 10, unit: 'minutes' } },
  'wrench': { bonus: 1, slots: 2, time: { value: 5, unit: 'minutes' } },
  'crowbar': { bonus: 1, slots: 1, time: { value: 5, unit: 'minutes' } },
  'sledgehammer': { bonus: 1, slots: 2, time: { value: 5, unit: 'minutes' } },
  'baseball bat': { bonus: 1, slots: 1, time: { value: 5, unit: 'minutes' } },
  'super sledge': { bonus: 3, slots: 3, time: { value: 10, unit: 'minutes' } },
  '9 iron': { bonus: 1, slots: 3, time: { value: 5, unit: 'minutes' } },
  'dress cane': { bonus: 1, slots: 1, time: { value: 5, unit: 'minutes' } },
  'lead pipe': { bonus: 1, slots: 1, time: { value: 5, unit: 'minutes' } },
  'rolling pin': { bonus: 1, slots: 1, time: { value: 5, unit: 'minutes' } },
  'shovel': { bonus: 1, slots: 2, time: { value: 5, unit: 'minutes' } },
  'tire iron': { bonus: 1, slots: 1, time: { value: 5, unit: 'minutes' } },
  'pool cue': { bonus: 1, slots: 1, time: { value: 5, unit: 'minutes' } },
  'bone club': { bonus: 1, slots: 1, time: { value: 5, unit: 'minutes' } },
  'commie whacker': { bonus: 1, slots: 1, time: { value: 5, unit: 'minutes' } },
  'paddle ball': { bonus: 1, slots: 1, time: { value: 5, unit: 'minutes' } },
  'board': { bonus: 0, slots: 1, time: { value: 5, unit: 'minutes' } },
  'board with a nail': { bonus: 0, slots: 1, time: { value: 5, unit: 'minutes' } },
  'protest sign': { bonus: 1, slots: 2, time: { value: 5, unit: 'minutes' } },
  'stop sign': { bonus: 1, slots: 1, time: { value: 5, unit: 'minutes' } },
  'war drum': { bonus: 3, slots: 3, time: { value: 10, unit: 'minutes' } },
  'cattle prod': { bonus: 3, slots: 4, time: { value: 10, unit: 'minutes' } },
  'ripper': { bonus: 3, slots: 4, time: { value: 10, unit: 'minutes' } },
  'mr. handy buzz blade': { bonus: 5, slots: 3, time: { value: 15, unit: 'minutes' } },
  'chainsaw': { bonus: 3, slots: 3, time: { value: 10, unit: 'minutes' } },
  'drill': { bonus: 3, slots: 2, time: { value: 10, unit: 'minutes' } },
  'plasma cutter': { bonus: 5, slots: 3, time: { value: 10, unit: 'minutes' } },
  'shishkebab': { bonus: 3, slots: 3, time: { value: 10, unit: 'minutes' } },
  'brass knuckles': { bonus: 1, slots: 1, time: { value: 5, unit: 'minutes' } },
  'spiked knuckles': { bonus: 1, slots: 1, time: { value: 5, unit: 'minutes' } },
  'boxing gloves': { bonus: 1, slots: 2, time: { value: 5, unit: 'minutes' } },
  'bear skull arm': { bonus: 1, slots: 2, time: { value: 5, unit: 'minutes' } },
  'deathclaw gauntlet': { bonus: 1, slots: 3, time: { value: 5, unit: 'minutes' } },
  'bear trap fist': { bonus: 1, slots: 2, time: { value: 5, unit: 'minutes' } },
  'power fist': { bonus: 1, slots: 4, time: { value: 5, unit: 'minutes' } },
}

FALLOUTZERO.rangedWeaponRepairTable = {
  'flare gun': { bonus: 1, slots: 2, time: { value: 5, unit: 'minutes' } },
  'acid soaker': { bonus: 2, slots: 2, time: { value: 5, unit: 'minutes' } },
  'pipe pistol': { bonus: 1, slots: 2, time: { value: 5, unit: 'minutes' } },
  'bolt-action pipe pistol': { bonus: 2, slots: 2, time: { value: 5, unit: 'minutes' } },
  '10mm pistol': { bonus: 3, slots: 3, time: { value: 10, unit: 'minutes' } },
  '9mm pistol': { bonus: 1, slots: 3, time: { value: 5, unit: 'minutes' } },
  '5.56mm pistol': { bonus: 6, slots: 3, time: { value: 10, unit: 'minutes' } },
  'pipe revolver': { bonus: 3, slots: 2, time: { value: 5, unit: 'minutes' } },
  '.357 magnum revolver': { bonus: 2, slots: 2, time: { value: 5, unit: 'minutes' } },
  '.44 magnum revolver': { bonus: 2, slots: 2, time: { value: 5, unit: 'minutes' } },
  'walther ppk': { bonus: 6, slots: 3, time: { value: 5, unit: 'minutes' } },
  '12.7mm pistol': { bonus: 8, slots: 3, time: { value: 10, unit: 'minutes' } },
  '.45 auto pistol': { bonus: 4, slots: 2, time: { value: 2, unit: 'minutes' } },
  'ranger sequoia': { bonus: 6, slots: 3, time: { value: 10, unit: 'minutes' } },
  'h&h tools nail gun': { bonus: 1, slots: 2, time: { value: 5, unit: 'minutes' } },
  '10mm smg': { bonus: 5, slots: 4, time: { value: 10, unit: 'minutes' } },
  '9mm smg': { bonus: 5, slots: 4, time: { value: 10, unit: 'minutes' } },
  'tommy gun': { bonus: 5, slots: 4, time: { value: 10, unit: 'minutes' } },
  '12.7mm smg': { bonus: 8, slots: 4, time: { value: 10, unit: 'minutes' } },
  'syringer': { bonus: 1, slots: 2, time: { value: 5, unit: 'minutes' } },
  'lever action rifle': { bonus: 1, slots: 3, time: { value: 5, unit: 'minutes' } },
  'cowboy repeater': { bonus: 3, slots: 4, time: { value: 5, unit: 'minutes' } },
  'varmint rifle': { bonus: 1, slots: 3, time: { value: 5, unit: 'minutes' } },
  'trail carbine': { bonus: 3, slots: 4, time: { value: 5, unit: 'minutes' } },
  'railway rifle': { bonus: 3, slots: 4, time: { value: 10, unit: 'minutes' } },
  'junk jet': { bonus: 4, slots: 4, time: { value: 10, unit: 'minutes' } },
  'sniper rifle': { bonus: 3, slots: 4, time: { value: 5, unit: 'minutes' } },
  'assault rifle': { bonus: 5, slots: 4, time: { value: 10, unit: 'minutes' } },
  'anti-material rifle': { bonus: 6, slots: 4, time: { value: 15, unit: 'minutes' } },
  'lever-action shotgun': { bonus: 3, slots: 3, time: { value: 5, unit: 'minutes' } },
  'single shotgun': { bonus: 3, slots: 3, time: { value: 5, unit: 'minutes' } },
  'sawed-off shotgun': { bonus: 3, slots: 3, time: { value: 5, unit: 'minutes' } },
  'double barrel shotgun': { bonus: 3, slots: 3, time: { value: 5, unit: 'minutes' } },
  'combat shotgun': { bonus: 6, slots: 4, time: { value: 5, unit: 'minutes' } },
  'riot shotgun': { bonus: 6, slots: 4, time: { value: 10, unit: 'minutes' } },
  'flamer': { bonus: 3, slots: 4, time: { value: 5, unit: 'minutes' } },
  'missile launcher': { bonus: 5, slots: 4, time: { value: 15, unit: 'minutes' } },
  'minigun': { bonus: 5, slots: 4, time: { value: 15, unit: 'minutes' } },
  'fat-man': { bonus: 3, slots: 4, time: { value: 5, unit: 'minutes' } },
  'solar scorcher': { bonus: 8, slots: 3, time: { value: 5, unit: 'minutes' } },
  'laser pistol': { bonus: 3, slots: 3, time: { value: 5, unit: 'minutes' } },
  'laser rifle': { bonus: 3, slots: 4, time: { value: 5, unit: 'minutes' } },
  'automatic laser rifle': { bonus: 5, slots: 4, time: { value: 15, unit: 'minutes' } },
  'tri-beam laser rifle': { bonus: 5, slots: 4, time: { value: 15, unit: 'minutes' } },
}
