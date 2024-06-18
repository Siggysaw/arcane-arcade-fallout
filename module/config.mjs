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


FALLOUTZERO.rules = {
  Addictive: 'If you consume a drink with the Alcoholic property that also has this property, you must succeed an Endurance ability check equal to 5. If you fail, you become addicted to alcoholic drinks. While you are addicted to alcoholic drinks you always have two levels of exhaustion unless you are drunk. You lose your alcohol addiction if you spend a number of weeks equal to 6 minus your Endurance ability ability modifier (minimum 1).',
  Alcoholic: 'When you consume a drink with this property, and your Endurance ability score is equal to 5 or higher, you become buzzed for 1d4 hours. Endurance ability score is equal to 4 or lower, you become drunk instead. If you are already buzzed and you consume another alcoholic or high-proof drink, you become drunk for 1d4 hours. If you are drunk, and drink two more alcoholic or high-proof drinks, you become hammered for 1d4 hours. If you are hammered, and drink two more alcoholic or high-proof drinks, you become wasted for 1d4 hours. ',
  Caffeinated:'If you consume a food or drink with this property, you no longer suffer the negative effects of the first three levels of exhaustion for the next 6 hours. If you have no levels of exhaustion, whenever you roll a d20; add 1 to the result. If you drink another Caffeinated drink while under the effects of one already, you gain 1 AP at the start of your turn for the next 6 hours. However, at the end of those 6 hours, you gain a level of exhaustion for each additional caffeinated drink you consumed while under the effects of one already. ',
  Highproof:'When you consume a drink with this property, and your Endurance ability score is equal to 5 or higher, you become drunk for 1d4 hours. Endurance ability score is equal to 4 or lower, you become hammered instead. If you are already drunk and you consume another alcoholic or high-proof drink, you become hammered for 1d4 hours. If you are hammered, and drink two more alcoholic or high-proof drinks, you become wasted for 1d4 hours.',
  Hydrating:'When you consume a drink with this property, you remove an additional two levels of dehydration (for a total of three since all drinks remove one level of dehydration).',
  Irradiated:'Some foods arent entirely the safest to eat, but beggars cant be choosers in the wasteland. When you consume a food that is irradiated, you gain one irradiated level. If you gain ten irradiated levels, you gain one level of rads. ',
  Filling:'If you consume food with this property, you remove another level of hunger. ',
  Bland:'If you consume a food with this property, you heal a number of stamina points equal to half your level.',
  Tasty:'If you consume a food with this property, you heal a number of stamina points equal to your level.',
  Flavorsome:'If you consume a food with this property, you heal a number of stamina points equal to double your level.',
  Delicacy:'If you consume a food with this property, you heal a number of stamina points equal to triple your level.',
  Fortifying:'If you consume food with this property, your radiation DC decreases by 2 for 6 hours. ',
  Energizing:'If you consume a food or drink with this property, you gain 1 AP at the start of your turn for the next 4 hours.',
  Empowering:'If you consume a food or drink with this property, you gain 2 AP at the start of your turn for the next 4 hours.',
  Regenerating:'If you consume a food or drink with this property, you heal a number of hit points equal to your healing rate. ',
  Refreshing:'If you consume a food with this property, you remove one level of dehydration.',
  Snack:'If you consume a food with this property, you do not remove any levels of hunger unless you consume two foods with this property.',
  Spicy:'If you consume a food or drink with this property, whenever you take fire or laser damage in the next 6 hours, your DT is increased by 3 for that damage.',
  Hearty:'If you consume a food or drink with this property, your carry load increases by 50 for the next 6 hours.',
  Pungent:'If you consume a food or drink with this property, your DT increases by 1 for the next 6 hours. ',
  Putrid:'If you consume a food or drink with this property, you become poisoned for the next 4 hours if your Endurance score is 5 or lower. ',
  Cleansing:'If you consume a food or drink with this property, you cure one addiction.',
  Strengthening:'If you consume a food or drink with this property, whenever you attack another creature and roll damage; the damage is increased by 2.',
  Lucky:'If you consume a food or drink with this property, you have advantage on all Luck ability checks for the next 6 hours. ',
  Charged:'If you consume a food or drink with this property, you recycle all of your unspent AP at the beginning of each of your turns for the next hour.',
}

