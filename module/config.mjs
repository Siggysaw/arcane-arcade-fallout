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
    modifiers: 0,
    base: 0
  },
  per: {
    label: 'Perception',
    abbreviation: 'per',
    reference: '',
    modifiers: 0,
    base: 0
  },
  end: {
    label: 'Endurance',
    abbreviation: 'end',
    reference: '',
    modifiers: 0,
    base: 0
  },
  cha: {
    label: 'Charisma',
    abbreviation: 'cha',
    reference: '',
    modifiers: 0,
    base: 0
  },
  int: {
    label: 'Intelligence',
    abbreviation: 'int',
    reference: '',
    modifiers: 0,
    base: 0
  },
  agi: {
    label: 'Agility',
    abbreviation: 'agi',
    reference: '',
    modifiers: 0,
    base: 0
  },
  lck: {
    label: 'Luck',
    abbreviation: 'lck',
    reference: '',
    modifiers: 0,
    base: 0
  },
}

FALLOUTZERO.skills = {
  barter: {
  	id: 'barter',
    label: 'Barter',
    ability: ['cha'],
    reference: '',
    modifiers: 0,
    base: 0
  },
  breach: {
  	id: 'breach',	  
    label: 'Breach',
    ability: ['per', 'int'],
    reference: '',
    modifiers: 0,
    base: 0
  },
  crafting: {
  	id: 'crafting',
    label: 'Crafting',
    ability: ['int'],
    reference: '',
    modifiers: 0,
    base: 0
  },
  energy_weapons: {
  	id: 'energy_weapons',
    label: 'Energy Weapons',
    ability: ['per'],
    reference: '',
    modifiers: 0,
    base: 0
  },
  explosives: {
  	id: 'explosives',	  
    label: 'Explosives',
    ability: ['per'],
    reference: '',
    modifiers: 0,
    base: 0
  },
  guns: {
  	id: 'guns',  
    label: 'Guns',
    ability: ['agi'],
    reference: '',
    modifiers: 0,
    base: 0
  },
  intimidation: {
  	id: 'intimidation',
    label: 'Intimidation',
    ability: ['str', 'cha'],
    reference: '',
    modifiers: 0,
    base: 0
  },
  medicine: {
	  id: 'medicine',
    label: 'Medicine',
    ability: ['per', 'int'],
    reference: '',
    modifiers: 0,
    base: 0
  },
  melee_weapons: {
	  id: 'melee_weapons',
    label: 'Melee Weapons',
    ability: ['str'],
    reference: '',
    modifiers: 0,
    base: 0
  },
  science: {
	  id: 'science',  
    label: 'Science',
    ability: ['int'],
    reference: '',
    modifiers: 0,
    base: 0
  },
  sneak: {
	  id: 'sneak',  
    label: 'Sneak',
    ability: ['agi'],
    reference: '',
    modifiers: 0,
    base: 0
  },
  speech: {
	  id: 'speech',
    label: 'Speech',
    ability: ['cha'],
    reference: '',
    modifiers: 0,
    base: 0
  },
  survival: {
	  id: 'survival',
    label: 'Survival',
    ability: ['end'],
    reference: '',
    modifiers: 0,
    base: 0
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
  Addictive: 'If you consume a drink with the Alcoholic property that also has this property, you must succeed an Endurance ability check equal to 5.<br><br> If you fail, you become addicted to alcoholic drinks.<br><br>While you are addicted to alcoholic drinks you always have two levels of exhaustion unless you are drunk.<br><br> You lose your alcohol addiction if you spend a number of weeks equal to 6 minus your Endurance ability ability modifier (minimum 1).<br><br>',
  Alcoholic: 'When you consume a drink with this property, and your Endurance ability score is equal to 5 or higher, you become buzzed for 1d4 hours.<br><br> Endurance ability score is equal to 4 or lower, you become drunk instead.<br><br> If you are already buzzed and you consume another alcoholic or high-proof drink, you become drunk for 1d4 hours.<br><br> If you are drunk, and drink two more alcoholic or high-proof drinks, you become hammered for 1d4 hours.<br><br> If you are hammered, and drink two more alcoholic or high-proof drinks, you become wasted for 1d4 hours.<br><br> ',
  Caffeinated:'If you consume a food or drink with this property, you no longer suffer the negative effects of the first three levels of exhaustion for the next 6 hours.<br><br> If you have no levels of exhaustion, whenever you roll a d20; add 1 to the result.<br><br> If you drink another Caffeinated drink while under the effects of one already, you gain 1 AP at the start of your turn for the next 6 hours.<br><br> However, at the end of those 6 hours, you gain a level of exhaustion for each additional caffeinated drink you consumed while under the effects of one already.<br><br> ',
  Highproof:'When you consume a drink with this property, and your Endurance ability score is equal to 5 or higher, you become drunk for 1d4 hours.<br><br> Endurance ability score is equal to 4 or lower, you become hammered instead.<br><br> If you are already drunk and you consume another alcoholic or high-proof drink, you become hammered for 1d4 hours.<br><br> If you are hammered, and drink two more alcoholic or high-proof drinks, you become wasted for 1d4 hours.<br><br>',
  Hydrating:'When you consume a drink with this property, you remove an additional two levels of dehydration (for a total of three since all drinks remove one level of dehydration).<br><br>',
  Irradiated:'Some foods arent entirely the safest to eat, but beggars cant be choosers in the wasteland.<br><br> When you consume a food that is irradiated, you gain one irradiated level.<br><br> If you gain ten irradiated levels, you gain one level of rads.<br><br> ',
  Filling:'If you consume food with this property, you remove another level of hunger.<br><br> ',
  Bland:'If you consume a food with this property, you heal a number of stamina points equal to half your level.<br><br>',
  Tasty:'If you consume a food with this property, you heal a number of stamina points equal to your level.<br><br>',
  Flavorsome:'If you consume a food with this property, you heal a number of stamina points equal to double your level.<br><br>',
  Delicacy:'If you consume a food with this property, you heal a number of stamina points equal to triple your level.<br><br>',
  Fortifying:'If you consume food with this property, your radiation DC decreases by 2 for 6 hours.<br><br> ',
  Energizing:'If you consume a food or drink with this property, you gain 1 AP at the start of your turn for the next 4 hours.<br><br>',
  Empowering:'If you consume a food or drink with this property, you gain 2 AP at the start of your turn for the next 4 hours.<br><br>',
  Regenerating:'If you consume a food or drink with this property, you heal a number of hit points equal to your healing rate.<br><br> ',
  Refreshing:'If you consume a food with this property, you remove one level of dehydration.<br><br>',
  Snack:'If you consume a food with this property, you do not remove any levels of hunger unless you consume two foods with this property.<br><br>',
  Spicy:'If you consume a food or drink with this property, whenever you take fire or laser damage in the next 6 hours, your DT is increased by 3 for that damage.<br><br>',
  Hearty:'If you consume a food or drink with this property, your carry load increases by 50 for the next 6 hours.<br><br>',
  Pungent:'If you consume a food or drink with this property, your DT increases by 1 for the next 6 hours.<br><br> ',
  Putrid:'If you consume a food or drink with this property, you become poisoned for the next 4 hours if your Endurance score is 5 or lower.<br><br> ',
  Cleansing:'If you consume a food or drink with this property, you cure one addiction.<br><br>',
  Strengthening:'If you consume a food or drink with this property, whenever you attack another creature and roll damage; the damage is increased by 2.<br><br>',
  Lucky:'If you consume a food or drink with this property, you have advantage on all Luck ability checks for the next 6 hours.<br><br> ',
  Charged: 'If you consume a food or drink with this property, you recycle all of your unspent AP at the beginning of each of your turns for the next hour.<br><br>',
  Anxiolytic: 'If you use a chem with this property, you have advantage on Charisma ability and skill checks, combat sequence rolls, and any checks to resist becoming frightened.<br><br>',
  Extrapolating: 'If you use a chem with this property, you have advantage on all Intelligence and Perception ability and skill checks.<br><br> However, you have disadvantage on all Charisma ability and skill checks.<br><br> ',
  Hallucinogenic: 'If you use a chem with this property, you have advantage on all luck checks and may flip your karma cap.<br><br> ',
  Hyperstimulant: 'If you use a chem with this property, you gain 4 additional AP at the start of your turn (to a maximum of 20).<br><br> You no longer suffer the negative effects of the first eight levels of exhaustion.<br><br> If you have no levels of exhaustion, whenever you roll a d20; add 2 to the result.<br><br> Additionally, you are immune to gaining levels of fatigue.<br><br>',
  Invigorating: 'If you use a chem with this property, you regain stamina points equal to half your level.<br><br> ',
  Painkilling: 'If you use a chem with this property, your DT increases by 3.<br><br>',
  Psychosis: 'If you use a chem with this property, when you deal damage from an attack roll; the damage is increased by 5.<br><br> However, you always attack the nearest hostile creature.<br><br> If there are no creatures that are hostile nearby, you must make an Endurance ability check equal to 15.<br><br> If you fail, you attack the nearest creature.<br><br>',
  Sedative: 'If you use a chem with this property, your passive sense increases by 5 and if you critically hit with an attack roll; the damage is increased by 10.<br><br> ',
  Stimulant: 'If you use a chem with this property, you gain 1 additional AP at the start of your turn (to a maximum of 16).<br><br> You no longer suffer the negative effects of the first three levels of exhaustion.<br><br> If you have no levels of exhaustion, whenever you roll a d20; add 1 to the result.<br><br>',
  Superstimulant: 'If you use a chem with this property, you gain 2 additional AP at the start of your turn (to a maximum of 20).<br><br> You no longer suffer the negative effects of the first five levels of exhaustion.<br><br> If you have no levels of exhaustion, whenever you roll a d20; add 2 to the result.<br><br> Additionally, you are immune to gaining levels of fatigue.<br><br>'
}

