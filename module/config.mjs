export const FALLOUTZERO = {};

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */
FALLOUTZERO.abilities = {
  str: {
	label: 'Strength',
	abbreviation: 'str',
	reference: ''
  },
  per: {
	label: 'Perception',
	abbreviation: 'per',
	reference: ''
  },
  end: {
	label: 'Endurance',
	abbreviation: 'end',
	reference: ''
  },
  cha: {
	label: 'Charisma',
	abbreviation: 'cha',
	reference: ''
  },
  int: {
	label: 'Intelligence',
	abbreviation: 'int',
	reference: ''
  },
  agi: {
	label: 'Agility',
	abbreviation: 'agi',
	reference: ''
  },
  lck: {
	label: 'Luck',
	abbreviation: 'lck',
	reference: ''
  },
};

FALLOUTZERO.skills = {
	barter: {
		label: 'Barter',
		ability: ['cha'],
		reference: ''
	},
	breach: {
		label: 'Breach',
		ability: ['per', 'int'],
		reference: ''
	},
	crafting: {
		label: 'Crafting',
		ability: ['int'],
		reference: ''
	},
	energy_weapons: {
		label: 'Energy Weapons',
		ability: ['per'],
		reference: ''
	},
	explosives: {
		label: 'Explosives',
		ability: ['per'],
		reference: ''
	},
	guns: {
		label: 'Guns',
		ability: ['agi'],
		reference: ''
	},
	intimidation: {
		label: 'Intimidation',
		ability: ['str', 'cha'],
		reference: ''
	},
	medicine: {
		label: 'Medicine',
		ability: ['per', 'int'],
		reference: ''
	},
	melee_weapons: {
		label: 'Melee Weapons',
		ability: ['str'],
		reference: ''
	},
	science: {
		label: 'Science',
		ability: ['int'],
		reference: ''
	},
	sneak: {
		label: 'Sneak',
		ability: ['agi'],
		reference: ''
	},
	speech: {
		label: 'Speech',
		ability: ['cha'],
		reference: ''
	},
	survival: {
		label: 'Survival',
		ability: ['end'],
		reference: ''
	},
	unarmed: {
		label: 'Unarmed',
		ability: ['str'],
		reference: ''
	},
};

FALLOUTZERO.penalties = {
	hunger: 'Hunger',
	dehydration: 'Dehydration',
	exhaustion: 'Exhaustion',
	radDC: 'Radiation DC',
	radiation: 'Radiation',
	fatigue: 'Fatigue',
};

