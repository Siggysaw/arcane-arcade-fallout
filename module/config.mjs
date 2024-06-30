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
  Addictive:'If you consume a drink with the Alcoholic property that also has this property, you must succeed an Endurance ability check equal to 5.<br><br> If you fail, you become addicted to alcoholic drinks.<br><br>While you are addicted to alcoholic drinks you always have two levels of exhaustion unless you are drunk.<br><br> You lose your alcohol addiction if you spend a number of weeks equal to 6 minus your Endurance ability ability modifier (minimum 1).<br><br>',
  Alcoholic:'When you consume a drink with this property, and your Endurance ability score is equal to 5 or higher, you become buzzed for 1d4 hours.<br><br> Endurance ability score is equal to 4 or lower, you become drunk instead.<br><br> If you are already buzzed and you consume another alcoholic or high-proof drink, you become drunk for 1d4 hours.<br><br> If you are drunk, and drink two more alcoholic or high-proof drinks, you become hammered for 1d4 hours.<br><br> If you are hammered, and drink two more alcoholic or high-proof drinks, you become wasted for 1d4 hours.<br><br> ',
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
  Cleansing: 'If you consume a food or drink with this property, you cure one addiction.<br><br>',
  Strengthening:'If you consume a food or drink with this property, whenever you attack another creature and roll damage; the damage is increased by 2.<br><br>',
  Lucky:'If you consume a food or drink with this property, you have advantage on all Luck ability checks for the next 6 hours.<br><br> ',
  Charged:'If you consume a food or drink with this property, you recycle all of your unspent AP at the beginning of each of your turns for the next hour.<br><br>',
  Anxiolytic:'If you use a chem with this property, you have advantage on Charisma ability and skill checks, combat sequence rolls, and any checks to resist becoming frightened.<br><br>',
  Extrapolating:'If you use a chem with this property, you have advantage on all Intelligence and Perception ability and skill checks.<br><br> However, you have disadvantage on all Charisma ability and skill checks.<br><br> ',
  Hallucinogenic:'If you use a chem with this property, you have advantage on all luck checks and may flip your karma cap.<br><br> ',
  Hyperstimulant:'If you use a chem with this property, you gain 4 additional AP at the start of your turn (to a maximum of 20).<br><br> You no longer suffer the negative effects of the first eight levels of exhaustion.<br><br> If you have no levels of exhaustion, whenever you roll a d20; add 2 to the result.<br><br> Additionally, you are immune to gaining levels of fatigue.<br><br>',
  Invigorating:'If you use a chem with this property, you regain stamina points equal to half your level.<br><br> ',
  Painkilling:'If you use a chem with this property, your DT increases by 3.<br><br>',
  Psychosis:'If you use a chem with this property, when you deal damage from an attack roll; the damage is increased by 5.<br><br> However, you always attack the nearest hostile creature.<br><br> If there are no creatures that are hostile nearby, you must make an Endurance ability check equal to 15.<br><br> If you fail, you attack the nearest creature.<br><br>',
  Sedative:'If you use a chem with this property, your passive sense increases by 5 and if you critically hit with an attack roll; the damage is increased by 10.<br><br> ',
  Stimulant:'If you use a chem with this property, you gain 1 additional AP at the start of your turn (to a maximum of 16).<br><br> You no longer suffer the negative effects of the first three levels of exhaustion.<br><br> If you have no levels of exhaustion, whenever you roll a d20; add 1 to the result.<br><br>',
  Superstimulant:'If you use a chem with this property, you gain 2 additional AP at the start of your turn (to a maximum of 20).<br><br> You no longer suffer the negative effects of the first five levels of exhaustion.<br><br> If you have no levels of exhaustion, whenever you roll a d20; add 2 to the result.<br><br> Additionally, you are immune to gaining levels of fatigue.<br><br>',
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
  Food_and_Drinks: '<p>Food and Water Characters who don’t eat or drink suffer the effects of starvation or dehydration (see page 111). </p><p>The amount of food and water your character needs is detailed in their racial traits (see pages 7 - 11) </p><p>If your character is a ghoul or human, or super mutant: </p><p>- You take a level of hunger every 24 hours without food. </p><p>- You take three levels of dehydration every 24 hours without water.</p><p>Every Level of Hunger and Dehydration increases the Penalty Total against D20 rolls',
  Fatigue_and_Exhaustion: '<p>Fatigue</p><p>Whenever you roll a d20, the total is subtracted by 1 for each level of fatigue you have. You can only ever have a total of nine levels of fatigue. At the end of each of your turns you lose one level of fatigue.</p><p></p><p>Exhaustion</p><p>Whenever you roll a d20, the total is subtracted by 1 for each level of  exhaustion you have. When you gain your tenth level of exhaustion, you die. If you are a human, ghoul, or super mutant; you can remove one level of exhaustion after resting for at least 6 hours. If you are a robot or gen-2 synth; you can remove one level of exhaustion after resting for at least 2 hours.</p>',
  Irradiation: '10 Levels of Irradiation = 1 added level of Radiation.'
}

FALLOUTZERO.armorUpgrades = [
  {
    name: 'Camouflage',
    short: 'Camo',
    cost: 125,
    craftingTime: '1 hour',
    rank: {
      1: {
        desc: 'You gain advantage on sneak checks relying on sight. Your passive sneak increases by 3.',
        auto: '+3 Sneak',
        craftingDC: '+6',
        craftingMat: 'x4 paint',
        charMod: { 'system.skills.sneak.modifiers': 9 },
      },
      2: {
        desc: 'You gain advantage on sneak checks relying on sight and sound. Your passive sneak increases by 6.',
        auto: '+6 Sneak',
        craftingDC: '+10',
        craftingMat: 'x5 paint, x4 rubber',
        charMod: { 'system.skills.sneak.modifiers': 9 },
      },
      3: {
        desc: 'You gain advantage on sneak checks relying on sight and sound. While in dim light, you become shadowed. Your passive sneak increases by 9.',
        auto: '+9 Sneak',
        craftingDC: '+16, or sneak skill bonus equal to +8',
        craftingMat: 'x3 adhesive, x5 leather, x3 paint',
        charMod: { 'system.skills.sneak.modifiers': 9 },
      },
    },
  },
  {
    name: 'Light',
    short: 'Light',
    cost: 75,
    craftingTime: '1 hour',
    rank: {
      1: {
        desc: 'Load reduced by 5. Strength requirement reduced by 1. DT reduced by 1.',
        auto: 'Load-5, Str Req -1, DT-1',
        craftingDC: '+8',
        craftingMat: 'None',
        upgrades: {
          'system.originalLoad': '@load',
          'system.strReq.value': -1,
          'system.damageThreshold.value': -1,
          'system.load': -5,
        },
      },
      2: {
        desc: 'Load reduced by 15 (min of 3). Strength req. reduced by 1. DT reduced by 1.',
        auto: 'Load-15(min3), Str Req -1, DT-1',
        craftingDC: '+13',
        craftingMat: 'None',
        upgrades: {
          'system.strReq.value': -1,
          'system.damageThreshold.value': -1,
          'system.load': -5,
        },
      },
      3: {
        desc: 'Load reduced by 15 (min of 3). Strength req. reduced by 1. DT reduced by 1. If you spend at least 4 AP on your turn to move, you can move an additional 10 feet.',
        auto: 'Load-15(min3), Str Req -1, DT-1',
        craftingDC: '+18',
        craftingMat: 'x6 adhesive, x5 rubber, x4 springs',
        upgrades: {
          'system.strReq.value': -1,
          'system.damageThreshold.value': -1,
          'system.load': -5,
        },
      },
    },
  },
  {
    name: 'Fitted',
    short: 'Fit',
    cost: 175,
    craftingTime: '1 hour',
    rank: {
      1: {
        desc: 'When you take damage from an area of effect, your DT is doubled.',
        auto: 'No automated effect',
        craftingDC: '+6',
        craftingMat: 'x5 of each material required to craft the type armor you are modifying',
        charMod: { 'system.stamina.modifiers': 0 },
      },
      2: {
        desc: 'When you take damage from an area of effect, your DT is doubled. Your maximum stamina points increase by a number equal to your level.',
        auto: 'Max STA + @level',
        craftingDC: '+6',
        craftingMat: 'x5 of each material required to craft the type armor you are modifying',
        charMod: { 'system.stamina.modifiers': '@level' },
      },
      3: {
        desc: 'When you take damage from an area of effect, your DT is doubled. Your maximum stamina points increase by a number equal to your level. You have advantage on combat sequence rolls. If you already have advantage, you gain a +5.',
        auto: 'Max STA + @level',
        craftingDC: '+6',
        craftingMat: 'x8 of each material required to craft the type armor you are modifying',
        charMod: { 'system.stamina.modifiers': '@level' },
      },
    },
  },
  {
    name: 'Lead Lined',
    short: 'Lead',
    cost: 125,
    craftingTime: '1 hour',
    rank: {
      1: {
        desc: 'Radiation DC decreases by -2',
        auto: 'RadDC -2',
        craftingDC: '+10',
        craftingMat: 'x6 lead, x6 adhesive',
        charMod: { 'system.penalties.radDC.value': -2 },
      },
      2: {
        desc: 'Radiation DC decreases by -4',
        auto: 'RadDC -4',
        craftingDC: '+15',
        craftingMat: 'x6 lead, x6 adhesive',
        charMod: { 'system.penalties.radDC.value': -4 },
      },
      3: {
        desc: 'Radiation DC decreases by -6',
        auto: 'RadDC -6',
        craftingDC: '+20',
        craftingMat: 'x6 lead, x6 adhesive',
        charMod: { 'system.penalties.radDC.value': -6 },
      },
    },
  },
  {
    name: 'Strengthened',
    short: 'Str',
    cost: 410,
    craftingTime: '1 hour',
    rank: {
      1: {
        desc: 'When you take damage from a critical hit, your DT increases by 3.',
        auto: 'No automated effect',
        craftingDC: '+6',
        craftingMat:
          'x5 of each material required to craft the type armor you are modifying, x5 adhesive',
      },
      2: {
        desc: 'When you take damage from a critical hit, your DT increases by 8.',
        auto: 'No automated effect',
        craftingDC: '+12',
        craftingMat:
          'x5 of each material required to craft the type armor you are modifying, x5 adhesive',
      },
      3: {
        desc: 'When you take damage from a critical hit, your DT increases by 8. If you would gain a severe injury, you instead gain a random limb condition.',
        auto: 'No automated effect',
        craftingDC: '+18',
        craftingMat:
          'x5 of each material required to craft the type armor you are modifying, x5 adhesive',
      },
    },
  },
  {
    name: 'Sturdy',
    short: 'Sturd',
    cost: 475,
    craftingTime: '1 hour',
    rank: {
      1: {
        desc: 'You ignore the negative effects of the first 2 levels of decay for the armor.',
        auto: 'No automated effect',
        craftingDC: '+6',
        craftingMat:
          'x3 of each material required to craft the type armor you are modifying, x3 adhesive',
      },
      2: {
        desc: 'You ignore the negative effects of the first 4 levels of decay for the armor.',
        auto: 'No automated effect',
        craftingDC: '+12',
        craftingMat:
          'x3 of each material required to craft the type armor you are modifying, x3 adhesive',
      },
      3: {
        desc: 'You ignore the negative effects of the first 4 levels of decay for the armor. Your armor no longer decays from being damaged by a critical hit.',
        auto: 'No automated effect',
        craftingDC: '+18',
        craftingMat:
          'x3 of each material required to craft the type armor you are modifying, x3 adhesive',
      },
    },
  },
  {
    name: 'Pocketed',
    short: 'Pocket',
    cost: 210,
    craftingTime: '1 hour',
    rank: {
      1: {
        desc: 'Your carry load is increased by 10.',
        auto: 'Carry Load + 10',
        craftingDC: '+4',
        craftingMat: 'x4 cloth, x5 leather, x3 adhesive',
        charMod: { 'system.carryLoad.max': 10 },
      },
      2: {
        desc: 'Your carry load is increased by 25.',
        auto: 'Carry Load + 25',
        craftingDC: '+8',
        craftingMat: 'x6 cloth, x8 leather, x3 adhesive',
        charMod: { 'system.carryLoad.max': 25 },
      },
      3: {
        desc: 'Your carry load is increased by 50.',
        auto: 'Carry Load + 50',
        craftingDC: '+12',
        craftingMat: 'x8 cloth, x10 leather, x4 adhesive',
        charMod: { 'system.carryLoad.max': 50 },
      },
    },
  },
  {
    name: 'Reinforced',
    short: 'Reinf',
    cost: 125,
    craftingTime: '1 hour',
    rank: {
      1: {
        desc: '+1 bonus to DT',
        auto: '+1 DT',
        craftingDC: '+12',
        craftingMat:
          'x5 of each material required to craft the type armor you are modifying, x5 adhesive, 5 screws',
        upgrades: { 'system.damageThreshold.value': 1 },
      },
      2: {
        desc: '+2 bonus to DT',
        auto: '+2 DT',
        craftingDC: '+17',
        craftingMat:
          'x5 of each material required to craft the type armor you are modifying, x5 adhesive, 5 screws',
        upgrades: { 'system.damageThreshold.value': 2 },
      },
      3: {
        desc: '+4 bonus to DT',
        auto: '+4 DT',
        craftingDC: '+22',
        craftingMat:
          'x8 of each material required to craft the type armor you are modifying, x8 adhesive, 8 screws',
        upgrades: { 'system.damageThreshold.value': 4 },
      },
    },
  },
  {
    name: 'Hardened',
    short: 'Hard',
    cost: 800,
    craftingTime: '1 hour',
    rank: {
      1: {
        desc: '1 bonus to AC',
        auto: '1 AC',
        craftingDC: '+14',
        craftingMat:
          'x6 of each material required to craft the type armor you are modifying, x6 adhesive, 6 screws',
        upgrades: { 'system.armorClass.value': 1 },
      },
      2: {
        desc: '2 bonus to AC',
        auto: '2 AC',
        craftingDC: '+19',
        craftingMat:
          'x6 of each material required to craft the type armor you are modifying, x6 adhesive, 6 screws',
        upgrades: { 'system.armorClass.value': 2 },
      },
      3: {
        desc: '3 bonus to AC',
        auto: '3 AC',
        craftingDC: '+25',
        craftingMat:
          'x6 of each material required to craft the type armor you are modifying, x6 adhesive, 6 screws',
        upgrades: { 'system.armorClass.value': 3 },
      },
    },
  },
]

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
  { name: 'Mutated Bear', dice: 'All', loot: [{ all: [['material', 'Bear Meat']] }] },
  {
    name: 'Deathclaw',
    dice: 'All',
    loot: [
      {
        all: [
          ['material', 'Deathclaw Meat'],
          ['material', 'Deathclaw Hide'],
          ['material', 'Deathclaw Hand'],
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
        ],
      },
      { dc: [['material', 'Radscorpion Egg']] },
    ],
  },
  { name: 'Radroach', dice: 'All', loot: [{ all: [['material', 'Radroach Meat']] }] },
  { name: 'Rattler', dice: 'All', loot: [{ all: [['material', 'Rattler Poison Gland']] }] },
  { name: 'Stingwing', dice: 'All', loot: [{ all: [['material', 'Stingwing Meat']] }] },
  { name: 'Stingwing Skimmer', dice: 'All', loot: [{ all: [['material', 'Stingwing Meat']] }] },
  { name: 'Stingwing Chaser', dice: 'All', loot: [{ all: [['material', 'Stingwing Meat']] }] },
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
