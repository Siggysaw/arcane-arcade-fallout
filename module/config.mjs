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
  radDC: 'Radiation DC',
  radiation: 'Radiation',
  fatigue: 'Fatigue',
}

FALLOUTZERO.maxKarmaCaps = 7

FALLOUTZERO.rules = {
  Addictive:    'If you consume a drink with the Alcoholic property that also has this property, you must succeed an Endurance ability check equal to 5.<br><br> If you fail, you become addicted to alcoholic drinks.<br><br>While you are addicted to alcoholic drinks you always have two levels of exhaustion unless you are drunk.<br><br> You lose your alcohol addiction if you spend a number of weeks equal to 6 minus your Endurance ability ability modifier (minimum 1).<br><br>',
  Alcoholic:    'When you consume a drink with this property, and your Endurance ability score is equal to 5 or higher, you become buzzed for 1d4 hours.<br><br> Endurance ability score is equal to 4 or lower, you become drunk instead.<br><br> If you are already buzzed and you consume another alcoholic or high-proof drink, you become drunk for 1d4 hours.<br><br> If you are drunk, and drink two more alcoholic or high-proof drinks, you become hammered for 1d4 hours.<br><br> If you are hammered, and drink two more alcoholic or high-proof drinks, you become wasted for 1d4 hours.<br><br> ',
  Caffeinated:    'If you consume a food or drink with this property, you no longer suffer the negative effects of the first three levels of exhaustion for the next 6 hours.<br><br> If you have no levels of exhaustion, whenever you roll a d20; add 1 to the result.<br><br> If you drink another Caffeinated drink while under the effects of one already, you gain 1 AP at the start of your turn for the next 6 hours.<br><br> However, at the end of those 6 hours, you gain a level of exhaustion for each additional caffeinated drink you consumed while under the effects of one already.<br><br> ',
  Highproof:   'When you consume a drink with this property, and your Endurance ability score is equal to 5 or higher, you become drunk for 1d4 hours.<br><br> Endurance ability score is equal to 4 or lower, you become hammered instead.<br><br> If you are already drunk and you consume another alcoholic or high-proof drink, you become hammered for 1d4 hours.<br><br> If you are hammered, and drink two more alcoholic or high-proof drinks, you become wasted for 1d4 hours.<br><br>',
  Hydrating:    'When you consume a drink with this property, you remove an additional two levels of dehydration (for a total of three since all drinks remove one level of dehydration).<br><br>',
  Irradiated:    'Some foods arent entirely the safest to eat, but beggars cant be choosers in the wasteland.<br><br> When you consume a food that is irradiated, you gain one irradiated level.<br><br> If you gain ten irradiated levels, you gain one level of rads.<br><br> ',
  Filling: 'If you consume food with this property, you remove another level of hunger.<br><br> ',
  Bland:    'If you consume a food with this property, you heal a number of stamina points equal to half your level.<br><br>',
  Tasty:    'If you consume a food with this property, you heal a number of stamina points equal to your level.<br><br>',
  Flavorsome:    'If you consume a food with this property, you heal a number of stamina points equal to double your level.<br><br>',
  Delicacy:    'If you consume a food with this property, you heal a number of stamina points equal to triple your level.<br><br>',
  Fortifying:    'If you consume food with this property, your radiation DC decreases by 2 for 6 hours.<br><br> ',
  Energizing:    'If you consume a food or drink with this property, you gain 1 AP at the start of your turn for the next 4 hours.<br><br>',
  Empowering:    'If you consume a food or drink with this property, you gain 2 AP at the start of your turn for the next 4 hours.<br><br>',
  Regenerating:    'If you consume a food or drink with this property, you heal a number of hit points equal to your healing rate.<br><br> ',
  Refreshing:    'If you consume a food with this property, you remove one level of dehydration.<br><br>',
  Snack:    'If you consume a food with this property, you do not remove any levels of hunger unless you consume two foods with this property.<br><br>',
  Spicy:    'If you consume a food or drink with this property, whenever you take fire or laser damage in the next 6 hours, your DT is increased by 3 for that damage.<br><br>',
  Hearty:    'If you consume a food or drink with this property, your carry load increases by 50 for the next 6 hours.<br><br>',
  Pungent:    'If you consume a food or drink with this property, your DT increases by 1 for the next 6 hours.<br><br> ',
  Putrid:    'If you consume a food or drink with this property, you become poisoned for the next 4 hours if your Endurance score is 5 or lower.<br><br> ',
  Cleansing: 'If you consume a food or drink with this property, you cure one addiction.<br><br>',
  Strengthening:    'If you consume a food or drink with this property, whenever you attack another creature and roll damage; the damage is increased by 2.<br><br>',
  Lucky:    'If you consume a food or drink with this property, you have advantage on all Luck ability checks for the next 6 hours.<br><br> ',
  Charged:    'If you consume a food or drink with this property, you recycle all of your unspent AP at the beginning of each of your turns for the next hour.<br><br>',
  Anxiolytic:    'If you use a chem with this property, you have advantage on Charisma ability and skill checks, combat sequence rolls, and any checks to resist becoming frightened.<br><br>',
  Extrapolating:    'If you use a chem with this property, you have advantage on all Intelligence and Perception ability and skill checks.<br><br> However, you have disadvantage on all Charisma ability and skill checks.<br><br> ',
  Hallucinogenic:    'If you use a chem with this property, you have advantage on all luck checks and may flip your karma cap.<br><br> ',
  Hyperstimulant:    'If you use a chem with this property, you gain 4 additional AP at the start of your turn (to a maximum of 20).<br><br> You no longer suffer the negative effects of the first eight levels of exhaustion.<br><br> If you have no levels of exhaustion, whenever you roll a d20; add 2 to the result.<br><br> Additionally, you are immune to gaining levels of fatigue.<br><br>',
  Invigorating:    'If you use a chem with this property, you regain stamina points equal to half your level.<br><br> ',
  Painkilling: 'If you use a chem with this property, your DT increases by 3.<br><br>',
  Psychosis:    'If you use a chem with this property, when you deal damage from an attack roll; the damage is increased by 5.<br><br> However, you always attack the nearest hostile creature.<br><br> If there are no creatures that are hostile nearby, you must make an Endurance ability check equal to 15.<br><br> If you fail, you attack the nearest creature.<br><br>',
  Sedative:    'If you use a chem with this property, your passive sense increases by 5 and if you critically hit with an attack roll; the damage is increased by 10.<br><br> ',
  Stimulant:    'If you use a chem with this property, you gain 1 additional AP at the start of your turn (to a maximum of 16).<br><br> You no longer suffer the negative effects of the first three levels of exhaustion.<br><br> If you have no levels of exhaustion, whenever you roll a d20; add 1 to the result.<br><br>',
  Superstimulant:    'If you use a chem with this property, you gain 2 additional AP at the start of your turn (to a maximum of 20).<br><br> You no longer suffer the negative effects of the first five levels of exhaustion.<br><br> If you have no levels of exhaustion, whenever you roll a d20; add 2 to the result.<br><br> Additionally, you are immune to gaining levels of fatigue.<br><br>',
  Blinded: `A blinded creature can't see and automatically fails any ability check that requires sight.<br><br> Attack rolls against a blinded creature have advantage.<br><br> A blinded creature can attack creatures with a blind attack if they are aware of them.<br><br>`,
  Bleeding: `At the start of each of their turns, for each level of bleeding they have, a creature with this condition takes damage to their hit points equal to half their healing rate (rounded down).<br><br> A dying creature with any levels of this condition fails a death save at the start of their turns.<br><br> If a creature who has any levels of bleeding is healed, they do not gain any hit points, instead they remove two levels of bleeding.<br><br>`,
  Burning: `A burning creature takes 1d10 fire damage at the start of their turns.<br><br> They can spend 6 AP to put themselves out.<br><br>`,
  Buzzed: `While buzzed you have disadvantage on all Intelligence and Perception ability and skill checks and advantage on all Endurance and Strength ability and skill checks.<br><br>`,
  Corroded: `While you are corroded, your DT is reduced by 5.<br><br>`,
  Dazed: `While you are dazed, your maximum AP is reduced by half (rounded down) and you do not recycle any unused AP at the start of your next turn.<br><br> `,
  Deafened: `A deafened creature can't hear and automatically fails any ability check that requires hearing.<br><br>`,
  Dehydration: `Whenever you roll a d20, the total is subtracted by 1 for each level of dehydration you have.<br><br> At the end of each day, or every 24 hours, if you did not consume at least three drinks or a drink with the hydrating property, you gain three levels of dehydration.<br><br> When you gain your tenth level of dehydration, you die.<br><br> `,
  Drunk: `While drunk, you gain the effects of buzzed, you have 2 less AP, and your maximum stamina points increase by a number equal to your level.<br><br> `,
  Encumbered: `An encumbered creature moves slowly (2 AP per 5 feet).<br><br> The creature�s travel pace is halved, and you gain a level of Fatigue each hour you are encumbered.<br><br> `,
  Exhaustion: `Whenever you roll a d20, the total is subtracted by 1 for each level of exhaustion you have.<br><br> When you gain your tenth level of exhaustion, you die.<br><br> If you are a human, ghoul, or super mutant; you can remove one level of exhaustion after resting for at least 6 hours.<br><br> If you are a robot or gen-2 synth; you can remove one level of exhaustion after resting for at least 2 hours.<br><br> `,
  Fatigue: `Whenever you roll a d20, the total is subtracted by 1 for each level of fatigue you have.<br><br> You can only ever have a total of nine levels of fatigue.<br><br> At the end of each of your turns you lose one level of fatigue.<br><br> `,
  Frightened:`<p>When a creature becomes frightened, they must succeed an Endurance ability check with the DC equal to 8 + the Intimidation skill bonus of the frightening creature.<br><br> </p><p> If they succeed this check by 5 or more, they are not frightened.<br><br></p><ul><li><p>If they succeed this check, they can choose to become frightened Flight, Fight, Freeze, or Fawn for half (rounded down) the allotted time.<br><br> </p></li><li><p>If they fail this check, they can choose to become frightened Flight, Fight, Freeze, or Fawn for the allotted time.<br><br> </p></li><li><p>If they fail this check by 5 or more, they can choose to become frightened Flight or Freeze for the allotted time.<br><br> </p></li></ul><p>Frightened - Flight.<br><br> A creature with this condition must use their action points on their turn to move as far away from the source of their fear as possible.<br><br> </p><p>Frightened - Fight.<br><br> A creature with this condition must use their action points on their turn to attack with intent to kill towards the source of their fear.<br><br> They cannot spend action points to move away from the source of their fear.<br><br></p><p>Frightened - Freeze.<br><br> A creature with this condition loses half their maximum AP (rounded down) and cannot spend any AP to move.<br><br> </p><p>Frightened - Fawn.<br><br> A creature with this condition uses all their AP on their turn to attack any creatures that are considered enemies to the source of their fear, or takes any other actions that would heal or help the source of their fear.<br><br></p>`,
  Grappled: `A grappled creature cannot spend AP to move.<br><br>`,
  Hammered: `While drunk, you gain the effects of buzzed and drunk.<br><br> Additionally, your maximum stamina points increase by a number equal to your level and whenever you roll a d20 it is subtracted by 5.<br><br> `,
  Heavily_Encumbered: `A heavily encumbered creature moves slowly (3 AP per 5 feet).<br><br> The creature�s travel pace is halved.<br><br> Every hour a heavily encumbered creature travels reduces their maximum stamina points by 2 (resets upon sleeping) Every day a heavily encumbered creature travels reduces their carry load capacity by 10 (resets upon traveling a day without being encumbered)`,
  Hunger: `Whenever you roll a d20, the total is subtracted by 1 for each level of hunger you have.<br><br> At the end of each day, or after 24 hours, if you did not consume at least one food, you gain one level of hunger.<br><br> When you gain your tenth level of hunger, you die.<br><br> `,
  Invisible: `An invisible creature is impossible to see.<br><br> For the purpose of hiding, the creature is heavily obscured.<br><br> The creature's location can be detected by any noise it makes or any tracks it leaves.<br><br> Attack rolls against the creature have disadvantage, and the creature's attack rolls have advantage.<br><br>`,
  Poisoned: `A poisoned creature has disadvantage on all d20 rolls.<br><br>`,
  Prone: `A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition.<br><br> The creature has disadvantage on attack rolls.<br><br> An attack roll against the creature has advantage if the attacker is within 5 feet of the creature.<br><br> Otherwise, the attack roll has disadvantage.<br><br>`,
  Radiation: `Whenever you roll a d20, the total is subtracted by 1 for each level of radiation you have.<br><br> Additionally, each time you gain a level of radiation you take 1d12 radiation damage to your hit points.<br><br> This damage cannot be healed until you are no longer in an irradiated zone.<br><br> If this radiation damage reduces you to 0 hit points, or you would gain your 10th level of radiation; you die.<br><br> Roll a Luck check with a DC of 20.<br><br> If you succeed, you return to life as a ghoul with 1 hit point.<br><br> If you roll below a 5 on this check, you instead return to life as a feral ghoul and the GM controls your character.<br><br> `,
  Restrained: `A restrained creature cannot move.<br><br> When a restrained creature takes damage it cannot be subtracted from their stamina points.<br><br>`,
  Shadowed: `While you are shadowed, you cannot be detected via sight from creatures who do not have night vision.<br><br> If a creature is aware of your presence and does not have night vision, they can attempt to target you with a blind attack.<br><br> `,
  Shock: `A creature who goes into shock has their stamina points immediately drop to 0 and starts their next turn with a maximum of 6 AP.<br><br>`,
  Slowed: `A slowed creature starts their turn with a maximum of 6 AP.<br><br>`,
  Unconscious: `When a creature becomes unconscious, it drops anything it was holding and all of its stamina points drop to 0.<br><br> It can't move or speak, and is unaware of its surroundings.<br><br> `,
  Wasted: `While wasted, you gain the effects of buzzed, drunk, and hammered.<br><br> Additionally, you remember nothing from the time while you�re wasted and you fall unconscious after an hour.<br><br> `,
}
