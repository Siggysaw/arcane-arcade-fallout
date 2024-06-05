export const FALLOUTZERO = {}

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */
FALLOUTZERO.abilities = {
  str: {
    label: 'Strength',
    abbreviation: 'str',
    reference: '',
  },
  per: {
    label: 'Perception',
    abbreviation: 'per',
    reference: '',
  },
  end: {
    label: 'Endurance',
    abbreviation: 'end',
    reference: '',
  },
  cha: {
    label: 'Charisma',
    abbreviation: 'cha',
    reference: '',
  },
  int: {
    label: 'Intelligence',
    abbreviation: 'int',
    reference: '',
  },
  agi: {
    label: 'Agility',
    abbreviation: 'agi',
    reference: '',
  },
  lck: {
    label: 'Luck',
    abbreviation: 'lck',
    reference: '',
  },
}

FALLOUTZERO.skills = {
  barter: {
  	id: 'barter',
    label: 'Barter',
    ability: ['cha'],
    reference: '',
  },
  breach: {
  	id: 'breach',	  
    label: 'Breach',
    ability: ['per', 'int'],
    reference: '',
  },
  crafting: {
  	id: 'crafting',
    label: 'Crafting',
    ability: ['int'],
    reference: '',
  },
  energy_weapons: {
  	id: 'energy_weapons',
    label: 'Energy Weapons',
    ability: ['per'],
    reference: '',
  },
  explosives: {
  	id: 'explosives',	  
    label: 'Explosives',
    ability: ['per'],
    reference: '',
  },
  guns: {
  	id: 'guns',  
    label: 'Guns',
    ability: ['agi'],
    reference: '',
  },
  intimidation: {
  	id: 'intimidation',
    label: 'Intimidation',
    ability: ['str', 'cha'],
    reference: '',
  },
  medicine: {
	  id: 'medicine',
    label: 'Medicine',
    ability: ['per', 'int'],
    reference: '',
  },
  melee_weapons: {
	  id: 'melee_weapons',
    label: 'Melee Weapons',
    ability: ['str'],
    reference: '',
  },
  science: {
	  id: 'science',  
    label: 'Science',
    ability: ['int'],
    reference: '',
  },
  sneak: {
	  id: 'sneak',  
    label: 'Sneak',
    ability: ['agi'],
    reference: '',
  },
  speech: {
	  id: 'speech',
    label: 'Speech',
    ability: ['cha'],
    reference: '',
  },
  survival: {
	  id: 'survival',
    label: 'Survival',
    ability: ['end'],
    reference: '',
  },
  unarmed: {
	  id: 'unarmed',
    label: 'Unarmed',
    ability: ['str'],
    reference: '',
  },
}

FALLOUTZERO.materials = {
  acid: {
    label: 'Acid',
    load: '.1',
    quantity: '0'
  },
  adhesive: {
    label: 'Adhesive',
    load: '.1',
    quantity: '0'
  },
  aluminum: {
    label: 'Aluminum',
    load: '.1',
    quantity: '0'
  },
  antiseptic: {
    label: 'Antiseptic',
    load: '.1',
    quantity: '0'
  },
  asbestos: {
    label: 'Asbestos',
    load: '.1',
    quantity: '0'
  },
  ballisticfiber: {
    label: 'Ballistic Fiber',
    load: '.1',
    quantity: '0'
  },
  ceramic: {
    label: 'Ceramic',
    load: '.1',
    quantity: '0'
  },
  circuitry: {
    label: 'Circuitry',
    load: '.1',
    quantity: '0'
  },
  cloth: {
    label: 'Cloth',
    load: '.1',
    quantity: '0'
  },
  copper: {
    label: 'Copper',
    load: '.1',
    quantity: '0'
  },
  crystal: {
    label: 'Crystal',
    load: '.1',
    quantity: '0'
  },
  fertilizer: {
    label: 'Fertilizer',
    load: '.1',
    quantity: '0'
  },
  fiberoptics: {
    label: 'Fiber Optics',
    load: '.1',
    quantity: '0'
  },
  fiberglass: {
    label: 'Fiberglass',
    load: '.1',
    quantity: '0'
  },
  glass: {
    label: 'Glass',
    load: '.1',
    quantity: '0'
  }, lead: {
    label: 'Lead',
    load: '.1',
    quantity: '0'
  },
  leather: {
    label: 'Leather',
    load: '.1',
    quantity: '0'
  },
  nuclearmaterial: {
    label: 'Nuclear Material',
    load: '.1',
    quantity: '0'
  },
  oil: {
    label: 'Oil',
    load: '.1',
    quantity: '0'
  },
  paint: {
    label: 'Paint',
    load: '.1',
    quantity: '0'
  },
  plastic: {
    label: 'Plastic',
    load: '.1',
    quantity: '0'
  },
  rubber: {
    label: 'Rubber',
    load: '.1',
    quantity: '0'
  },
  screw: {
    label: 'Screw',
    load: '.1',
    quantity: '0'
  },
  silver: {
    label: 'Silver',
    load: '.1',
    quantity: '0'
  },
  spring: {
    label: 'Spring',
    load: '.1',
    quantity: '0'
  },
  steel: {
    label: 'Steel',
    load: '.1',
    quantity: '0'
  },
  wood: {
    label: 'Wood',
    load: '.1',
    quantity: '0'
  },
}


FALLOUTZERO.penalties = {
  hunger: 'Hunger',
  dehydration: 'Dehydration',
  exhaustion: 'Exhaustion',
  radDC: 'Radiation DC',
  radiation: 'Radiation',
  fatigue: 'Fatigue',
}



