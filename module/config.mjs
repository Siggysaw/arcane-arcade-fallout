export const FALLOUTZERO = {}

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
    label: 'Strength',
    abbreviation: 'str',
    reference: '',
    modifiers: 0,
    base: 0,
  },
  per: {
    label: 'Perception',
    abbreviation: 'per',
    reference: '',
    modifiers: 0,
    base: 0,
  },
  end: {
    label: 'Endurance',
    abbreviation: 'end',
    reference: '',
    modifiers: 0,
    base: 0,
  },
  cha: {
    label: 'Charisma',
    abbreviation: 'cha',
    reference: '',
    modifiers: 0,
    base: 0,
  },
  int: {
    label: 'Intelligence',
    abbreviation: 'int',
    reference: '',
    modifiers: 0,
    base: 0,
  },
  agi: {
    label: 'Agility',
    abbreviation: 'agi',
    reference: '',
    modifiers: 0,
    base: 0,
  },
  lck: {
    label: 'Luck',
    abbreviation: 'lck',
    reference: '',
    modifiers: 0,
    base: 0,
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
}

FALLOUTZERO.maxKarmaCaps = 7

FALLOUTZERO.rules = {
  Anabolic:
    'If you use a chem with this property, you have advantage on all Strength and Endurance ability and skill checks. Additionally, you gain temporary hit points equal to your level.',
  Addictive:
    'If you consume a drink with the Alcoholic property that also has this property, you must succeed an Endurance ability check equal to 5.<br><br> If you fail, you become addicted to alcoholic drinks.<br><br>While you are addicted to alcoholic drinks you always have two levels of exhaustion unless you are drunk.<br><br> You lose your alcohol addiction if you spend a number of weeks equal to 6 minus your Endurance ability ability modifier (minimum 1).<br><br>',
  Alcoholic:
    'When you consume a drink with this property, and your Endurance ability score is equal to 5 or higher, you become buzzed for 1d4 hours.<br><br> Endurance ability score is equal to 4 or lower, you become drunk instead.<br><br> If you are already buzzed and you consume another alcoholic or high-proof drink, you become drunk for 1d4 hours.<br><br> If you are drunk, and drink two more alcoholic or high-proof drinks, you become hammered for 1d4 hours.<br><br> If you are hammered, and drink two more alcoholic or high-proof drinks, you become wasted for 1d4 hours.<br><br> ',
  Caffeinated:
    'If you consume a food or drink with this property, you no longer suffer the negative effects of the first three levels of exhaustion for the next 6 hours.<br><br> If you have no levels of exhaustion, whenever you roll a d20; add 1 to the result.<br><br> If you drink another Caffeinated drink while under the effects of one already, you gain 1 AP at the start of your turn for the next 6 hours.<br><br> However, at the end of those 6 hours, you gain a level of exhaustion for each additional caffeinated drink you consumed while under the effects of one already.<br><br> ',
  Highproof:
    'When you consume a drink with this property, and your Endurance ability score is equal to 5 or higher, you become drunk for 1d4 hours.<br><br> Endurance ability score is equal to 4 or lower, you become hammered instead.<br><br> If you are already drunk and you consume another alcoholic or high-proof drink, you become hammered for 1d4 hours.<br><br> If you are hammered, and drink two more alcoholic or high-proof drinks, you become wasted for 1d4 hours.<br><br>',
  Hydrating:
    'When you consume a drink with this property, you remove an additional two levels of dehydration (for a total of three since all drinks remove one level of dehydration).<br><br>',
  Irradiated:
    'Some foods arent entirely the safest to eat, but beggars cant be choosers in the wasteland.<br><br> When you consume a food that is irradiated, you gain one irradiated level.<br><br> If you gain ten irradiated levels, you gain one level of rads.<br><br> ',
  Filling: 'If you consume food with this property, you remove another level of hunger.<br><br> ',
  Bland:
    'If you consume a food with this property, you heal a number of stamina points equal to half your level.<br><br>',
  Tasty:
    'If you consume a food with this property, you heal a number of stamina points equal to your level.<br><br>',
  Flavorsome:
    'If you consume a food with this property, you heal a number of stamina points equal to double your level.<br><br>',
  Delicacy:
    'If you consume a food with this property, you heal a number of stamina points equal to triple your level.<br><br>',
  Fortifying:
    'If you consume food with this property, your radiation DC decreases by 2 for 6 hours.<br><br> ',
  Energizing:
    'If you consume a food or drink with this property, you gain 1 AP at the start of your turn for the next 4 hours.<br><br>',
  Empowering:
    'If you consume a food or drink with this property, you gain 2 AP at the start of your turn for the next 4 hours.<br><br>',
  Regenerating:
    'If you consume a food or drink with this property, you heal a number of hit points equal to your healing rate.<br><br> ',
  Refreshing:
    'If you consume a food with this property, you remove one level of dehydration.<br><br>',
  Snack:
    'If you consume a food with this property, you do not remove any levels of hunger unless you consume two foods with this property.<br><br>',
  Spicy:
    'If you consume a food or drink with this property, whenever you take fire or laser damage in the next 6 hours, your DT is increased by 3 for that damage.<br><br>',
  Hearty:
    'If you consume a food or drink with this property, your carry load increases by 50 for the next 6 hours.<br><br>',
  Pungent:
    'If you consume a food or drink with this property, your DT increases by 1 for the next 6 hours.<br><br> ',
  Putrid:
    'If you consume a food or drink with this property, you become poisoned for the next 4 hours if your Endurance score is 5 or lower.<br><br> ',
  Cleansing: 'If you consume a food or drink with this property, you cure one addiction.<br><br>',
  Strengthening:
    'If you consume a food or drink with this property, whenever you attack another creature and roll damage; the damage is increased by 2.<br><br>',
  Lucky:
    'If you consume a food or drink with this property, you have advantage on all Luck ability checks for the next 6 hours.<br><br> ',
  Charged:
    'If you consume a food or drink with this property, you recycle all of your unspent AP at the beginning of each of your turns for the next hour.<br><br>',
  Anxiolytic:
    'If you use a chem with this property, you have advantage on Charisma ability and skill checks, combat sequence rolls, and any checks to resist becoming frightened.<br><br>',
  Extrapolating:
    'If you use a chem with this property, you have advantage on all Intelligence and Perception ability and skill checks.<br><br> However, you have disadvantage on all Charisma ability and skill checks.<br><br> ',
  Hallucinogenic:
    'If you use a chem with this property, you have advantage on all luck checks and may flip your karma cap.<br><br> ',
  Hyperstimulant:
    'If you use a chem with this property, you gain 4 additional AP at the start of your turn (to a maximum of 20).<br><br> You no longer suffer the negative effects of the first eight levels of exhaustion.<br><br> If you have no levels of exhaustion, whenever you roll a d20; add 2 to the result.<br><br> Additionally, you are immune to gaining levels of fatigue.<br><br>',
  Invigorating:
    'If you use a chem with this property, you regain stamina points equal to half your level.<br><br> ',
  Painkilling: 'If you use a chem with this property, your DT increases by 3.<br><br>',
  Psychosis:
    'If you use a chem with this property, when you deal damage from an attack roll; the damage is increased by 5.<br><br> However, you always attack the nearest hostile creature.<br><br> If there are no creatures that are hostile nearby, you must make an Endurance ability check equal to 15.<br><br> If you fail, you attack the nearest creature.<br><br>',
  Sedative:
    'If you use a chem with this property, your passive sense increases by 5 and if you critically hit with an attack roll; the damage is increased by 10.<br><br> ',
  Stimulant:
    'If you use a chem with this property, you gain 1 additional AP at the start of your turn (to a maximum of 16).<br><br> You no longer suffer the negative effects of the first three levels of exhaustion.<br><br> If you have no levels of exhaustion, whenever you roll a d20; add 1 to the result.<br><br>',
  Superstimulant:
    'If you use a chem with this property, you gain 2 additional AP at the start of your turn (to a maximum of 20).<br><br> You no longer suffer the negative effects of the first five levels of exhaustion.<br><br> If you have no levels of exhaustion, whenever you roll a d20; add 2 to the result.<br><br> Additionally, you are immune to gaining levels of fatigue.<br><br>',
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
  Frightened: `<p>When a creature becomes frightened, they must succeed an Endurance ability check with the DC equal to 8 + the Intimidation skill bonus of the frightening creature.<br><br> </p><p> If they succeed this check by 5 or more, they are not frightened.<br><br></p><ul><li><p>If they succeed this check, they can choose to become frightened Flight, Fight, Freeze, or Fawn for half (rounded down) the allotted time.<br><br> </p></li><li><p>If they fail this check, they can choose to become frightened Flight, Fight, Freeze, or Fawn for the allotted time.<br><br> </p></li><li><p>If they fail this check by 5 or more, they can choose to become frightened Flight or Freeze for the allotted time.<br><br> </p></li></ul><p>Frightened - Flight.<br><br> A creature with this condition must use their action points on their turn to move as far away from the source of their fear as possible.<br><br> </p><p>Frightened - Fight.<br><br> A creature with this condition must use their action points on their turn to attack with intent to kill towards the source of their fear.<br><br> They cannot spend action points to move away from the source of their fear.<br><br></p><p>Frightened - Freeze.<br><br> A creature with this condition loses half their maximum AP (rounded down) and cannot spend any AP to move.<br><br> </p><p>Frightened - Fawn.<br><br> A creature with this condition uses all their AP on their turn to attack any creatures that are considered enemies to the source of their fear, or takes any other actions that would heal or help the source of their fear.<br><br></p>`,
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
  Food_and_Drinks:
    '<p>Food and Water Characters who don’t eat or drink suffer the effects of starvation or dehydration (see page 111). </p><p>The amount of food and water your character needs is detailed in their racial traits (see pages 7 - 11) </p><p>If your character is a ghoul or human, or super mutant: </p><p>- You take a level of hunger every 24 hours without food. </p><p>- You take three levels of dehydration every 24 hours without water.</p><p>Every Level of Hunger and Dehydration increases the Penalty Total against D20 rolls',
  Fatigue_and_Exhaustion:
    '<p>Fatigue</p><p>Whenever you roll a d20, the total is subtracted by 1 for each level of fatigue you have. You can only ever have a total of nine levels of fatigue. At the end of each of your turns you lose one level of fatigue.</p><p></p><p>Exhaustion</p><p>Whenever you roll a d20, the total is subtracted by 1 for each level of  exhaustion you have. When you gain your tenth level of exhaustion, you die. If you are a human, ghoul, or super mutant; you can remove one level of exhaustion after resting for at least 6 hours. If you are a robot or gen-2 synth; you can remove one level of exhaustion after resting for at least 2 hours.</p>',
  Irradiation: '10 Levels of Irradiation = 1 added level of Radiation.',
  Area_of_Effect:
    'Each creature and object in the radius of the first range that isn’t behind full cover takes full damage, while each creature and object in the radius of the second range that isn’t behind full cover takes half as much damage.<br><br>If an explosive only has one number listed, each creature or object in the radius takes full damage.',
  Dodge: `You prepare to move quickly out of the way of an attack or explosion. Until the start of your next turn, any attack roll made against you has disadvantage if you can see the attacker. Additionally, you can move up to 15 feet in reaction to any other creature's action one time before the start of your next turn. You lose this benefit if you are dying or you cannot spend AP to move.`,
  Equip_a_Weapon: `. You take a weapon from your inventory and prepare to attack with it with any hands you have free. If you have a weapon in your hands already and have not stowed it, you drop it on the ground. `,
  Escape_a_Grapple: `. If you are grappled, you make a contested Strength or Agility check against your grapplers Strength check to escape.`,
  Grapple: `You use your appendages to hold someone in place, you must contest a Strength check against their Strength or Agility`,
  Help: `You can lend your aid to another creature in the completion of a task. When you use your AP to Help, the creature you aid gains advantage on the next ability check it makes to perform the task you are helping with, provided that it makes the check before the start of your next turn. Alternatively, you can aid a friendly creature in attacking a creature within 5 feet of you. You feint, distract the target, or in some other way team up to make your ally’s attack more effective. If your ally attacks the target before your next turn, the first attack roll is made with advantage.`,
  Hide: `When you take the Hide action, you make a Sneak check with the DC equal to any nearby enemies passive sense scores. In order to hide you must be heavily obscured or within full cover. You are hidden from any enemies that have a lower passive sense compared to your sneak roll. If you succeed, you gain certain benefits, as described in the “Unseen Attackers and Targets” section. While hiding, you are acting unpredictably to confuse your enemy. Enemies still know your general location and can move to try and make line of sight again to notice you. If you are no longer within full cover of an enemy you are hidden from, you are no longer hidden.`,
  Interact_With_Object: `Interacting with an object falls under many categories of things you can do.<ul><li>open or close a door</li><li>pick up a dropped shiv</li><li>take a bottle cap from a table</li><li>pushing a button</li><li>extinguish a small flame</li><li>don a mask</li><li>pull the hood of your jacket up and over your head</li><li>put your ear to a door</li><li>kick a small stone</li><li>turn a key in a lock</li><li>hand an item to another character</li></ul>`,
  Move_5_Feet: `You move 5 feet in any direction so long as your movement isn’t impeded or the area isn’t difficult terrain.`,
  Ready: `You prepare an action with a trigger. You must specify what the trigger is and spend the necessary AP with an additional 2 AP. When the trigger occurs, you may perform the action. You cannot perform the action on a different trigger, nor do you regain the AP if the trigger never occurs. `,
  Search: `You make an active perception check to look for someone or something hidden.`,
  Shove: `You knock a target prone or push it away from you. The target must be no more than one size larger than you and must be within your reach. Instead of making an attack roll, you make an Unarmed check contested by the target’s Unarmed check or Agility check (the target chooses the ability to use). If you win the contest, you either knock the target prone or push it 5 feet away from you.`,
  Sprint: `You can spend 5 action points on your turn to sprint. When you sprint, you move 50 feet in a line. If you stop or are obstructed before you move 50 feet, your movement ends and you do not regain any action points.`,
  Stand_Up_From_Prone: `You stand back up from being prone`,
  Stow_a_Weapon: `You take a weapon you are holding and put it into your inventory`,
  Take_Cover: `If you only have three quarters or half cover, you can spend 3 AP to squat, kneel, or duck into cover to gain full cover. If you attack while taking cover, you no longer have full cover. `,
  Unarmed_Strike: `You punch, kick, jab, slap, or perform any kind of attack to another creature within 5 feet of you.Unarmed and Melee Weapon Attacks.<br><br> Unarmed attacks cost 3 AP. They deal 1d4 + STR or AGI Mod bludgeoning damage.`,
  Use_a_Chem: `When you take this action, you take the chem out of your inventory and use it. You don’t need to interact with the object or equip the chem in order to use it.`,
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
}

FALLOUTZERO.specialammo = {
  '.308': {
    available: ['.308', 'Explosive', 'FMJ', 'Hollow Point', 'JSP'],
  },
  '.50': {
    available: ['.50', 'Explosive', 'Incendiary', 'Match'],
  },
  '.357': {
    available: ['.357', 'FMJ', 'Hollow Point', 'JFP'],
  },
  '.44': {
    available: ['.44', 'Hollow Point'],
  },
  '.45': {
    available: ['.45', 'Hollow Point'],
  },
  '.45-70': {
    available: ['.45-70', 'Hollow Point'],
  },
  '10mm': {
    available: ['10mm', 'FMJ', 'Hollow Point', 'Rubber'],
  },
  '12 gauge': {
    available: [
      '12 gauge',
      'Cap shot',
      'Dragons Breath',
      'Flechette',
      'Magnum',
      'Slug',
      'Pulse Slug',
      'Bean Bag'
    ],
  },
  '12.7mm': {
    available: ['12.7mm', 'FMJ', 'Hollow Point'],
  },
  '20 gauge': {
    available: ['20 gauge', 'Magnum', 'Slug', 'Pulse Slug'],
  },
  '5.56mm': {
    available: ['5.56mm', 'Hollow Point', 'Match'],
  },
  '5mm': {
    available: ['5mm', 'FMJ', 'Hollow Point', 'JSP', 'Rubber'],
  },
  '9mm': {
    available: ['9mm', 'FMJ', 'Hollow Point', 'Rubber'],
  },
  'Energy Cell': {
    available: ['Energy Cell', 'Bulk', 'Optimized', 'Overcharged', 'Max Charge'],
  },
  'Microfusion Cell': {
    available: ['Microfusion Cell', 'Bulk', 'Optimized', 'Overcharged', 'Max Charge'],
  },
  Missile: {
    available: ['Missile', 'Explosive', 'Incendiary'],
  },
  Syringer: {
    available: [
      'Stimpak Loader',
      'ChemLoader',
      'Radscorpion Venom',
      'Endangerol',
      'Yellow Belly',
      'Berserk',
      'Hemorrhage',
      'Lock Joint',
      'Sclerosis',
      'Myopic Serum',
      'Mind Cloud',
      'Tranquilizer',
    ],
  },
  'Cryo Cell': {
    available: ['Cryo Cell'],
  },
  'Gamma Cell': {
    available: ['Gamma Cell'],
  },
  Nails: {
    available: ['Nails'],
  },
  Flares: {
    available: ['Flares'],
  },
  Sunlight: {
    available: ['Sunlight'],
  },
  'Junk Jet': {
    available: ['Any item that is smaller than cubic foot'],
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
