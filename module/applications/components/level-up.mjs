
import ChoosePerk from './choose-perk.mjs'
import ChooseSpecial from './choose-special.mjs'
import ChooseRace from './choose-race.mjs'
import ChooseBackground from './choose-background.mjs'

// Points a level-0 character distributes across SPECIAL at creation (separate from perkOrSpecial).
const CREATION_SPECIAL_POINTS = 3
const MIN_SPECIAL_SCORE = 1

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
export default class LevelUp extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(actor, options = {}) {
        super(options);

        this.actor = actor
        this.skillChanges = Object.values(actor.system.skills).reduce((acc, skill) => {
            acc[skill.id] = skill.base
            return acc
        }, {})

        const initialSkillPoints = this.getSkillPointPool()
        this.hasSkillPoints = initialSkillPoints > 0
        this.skillPointPool = initialSkillPoints
        this.specialBoost = null
        this.newPerk = null

        // needsRace/needsBackground computed once so a mid-flow pick doesn't change shown steps.
        this.isCharacterCreation = this.actor.system.level === 0
        this.needsRace = this.isCharacterCreation && !this.actor.getRaceType()
        this.needsBackground = this.isCharacterCreation && !this.actor.items.some((i) => i.type === 'background')
        this.newRace = null
        this.newBackground = null

        // Tracks every SPECIAL ability's chosen base score, so perkOrSpecial composes with it correctly.
        this.specialChanges = Object.keys(actor.system.abilities).reduce((acc, id) => {
            acc[id] = actor.system.abilities[id].base
            return acc
        }, {})
        this.specialPointPool = this.isCharacterCreation ? CREATION_SPECIAL_POINTS : 0
    }

    static DEFAULT_OPTIONS = {
        form: {
            submitOnChange: false,
            closeOnSubmit: true,
        },
        actions: {
            accept: LevelUp.performLevelup,
            incSkill: LevelUp.onIncSkill,
            decSkill: LevelUp.onDecSkill,
            choosePerk: LevelUp.onChoosePerk,
            chooseSpecial: LevelUp.onChooseSpecial,
            chooseRace: LevelUp.onChooseRace,
            chooseBackground: LevelUp.onChooseBackground,
            incSpecial: LevelUp.onIncSpecial,
            decSpecial: LevelUp.onDecSpecial,
            cancel: LevelUp.onCancel,
        },
        classes: ['pipboy-dialog'],
        position: { width: 400 },
        window: {
            title: 'You leveled up!',
            resizable: true
        }
    }

    static PARTS = {
        main: {
            template: 'systems/arcane-arcade-fallout/templates/level-up/level-up.hbs',
            scrollable: [""]
        },
    }

    get nextLevel() {
        return this.actor.system.level + 1
    }

    get attributeBoost() {
        return this.nextLevel % 2
    }

    get newHPMax() {
        if (!this.attributeBoost) return this.actor.system.health.max
        const currentHPMax = this.actor.system.health.max
        const endMod = this.actor.system.abilities.end.mod
        return currentHPMax + endMod + 5
    }

    get newHPValue() {
        if (!this.attributeBoost) return this.actor.system.health.value
        const currentHPvalue = this.actor.system.health.value
        const endMod = this.actor.system.abilities.end.mod
        return currentHPvalue + endMod + 5
    }

    get newSPMax() {
        if (!this.attributeBoost) return this.actor.system.stamina.max
        const currentSPMax = this.actor.system.stamina.max
        const agiMod = this.actor.system.abilities.agi.mod
        return currentSPMax + agiMod + 5
    }

    get newSPValue() {
        if (!this.attributeBoost) return this.actor.system.stamina.value
        const currentSPvalue = this.actor.system.stamina.value
        const agiMod = this.actor.system.abilities.agi.mod
        return currentSPvalue + agiMod + 5
    }

    get perkOrSpecial() {
        return ![5, 9, 13, 17, 19].includes(this.nextLevel)
    }

    // Level 1 is perk-only per GM ruling; the SPECIAL alternative opens up at level 2.
    get perkOnly() {
        return this.nextLevel === 1
    }

    getSkillPointPool() {
        if (![5, 9, 13, 17, 21, 25, 29].includes(this.nextLevel)) return 0
        // Skill points allotted is based on Intelligence modifier
        if (this.actor.system.abilities.int.mod > 0) {
            return 5
        } else if (this.actor.system.abilities.int.mod == 0) {
            return 4
        } else {
            return 3
        }
    }

    async _prepareContext() {
        return {
            actor: this.actor,
            skills: this.actor.system.skills,
            nextLevel: this.nextLevel,
            perkOrSpecial: this.perkOrSpecial,
            perkOnly: this.perkOnly,
            skillChanges: this.skillChanges,
            skillPointPool: this.skillPointPool,
            hasSkillPoints: this.hasSkillPoints,
            specialBoost: this.specialBoost,
            newPerk: this.newPerk,
            isCharacterCreation: this.isCharacterCreation,
            needsRace: this.needsRace,
            needsBackground: this.needsBackground,
            newRace: this.newRace,
            newBackground: this.newBackground,
            specialChanges: this.specialChanges,
            specialPointPool: this.specialPointPool,
        }
    }

    static async performLevelup() {
        if (this.needsRace && !this.newRace) {
            ui.notifications.warn('Choose your Race first!')
            return
        } else if (this.needsBackground && !this.newBackground) {
            ui.notifications.warn('Choose your Background first!')
            return
        } else if (this.isCharacterCreation && this.specialPointPool > 0) {
            ui.notifications.warn('You still have SPECIAL points to spend!')
            return
        } else if (this.skillPointPool > 0) {
            ui.notifications.warn('You still have skill points to spend!')
            return
        } else if (this.perkOnly && !this.newPerk) {
            ui.notifications.warn('Choose a Perk!')
            return
        } else if (this.perkOrSpecial && !this.perkOnly && (!this.newPerk && !this.specialBoost)) {
            ui.notifications.warn('You still need to take a perk or boost a SPECIAL!')
            return
        }

        // Race must exist before Background grants resolve, so these run sequentially.
        if (this.newRace) {
            await this.actor.createEmbeddedDocuments('Item', [this.newRace.toObject()])
        }
        if (this.newBackground) {
            await this.actor.grantBackgroundEquipment(this.newBackground)
        }

        const newXP = this.actor.system.xp - 1000

        const skillUpdates = Object.entries(this.skillChanges).reduce((acc, [key, value]) => {
            acc[`system.skills.${key}.base`] = value
            return acc
        }, {})

        // Only abilities that actually changed from the actor's base go into the update payload.
        const abilityUpdates = Object.entries(this.specialChanges).reduce((acc, [id, base]) => {
            if (base !== this.actor.system.abilities[id].base) {
                acc[`system.abilities.${id}.base`] = base
            }
            return acc
        }, {})
        if (this.specialBoost) {
            const id = this.specialBoost.id
            abilityUpdates[`system.abilities.${id}.base`] = this.specialChanges[id] + 1
        }

        await this.actor.update({
            'system.health.max': this.newHPMax,
            'system.health.value': this.newHPValue,
            'system.stamina.max': this.newSPMax,
            'system.stamina.value': this.newSPValue,
            'system.xp': newXP,
            'system.level': this.nextLevel,
            ...skillUpdates,
            ...abilityUpdates,
        })

        if (this.newPerk) {
            this.actor.createEmbeddedDocuments("Item", [this.newPerk.toObject()]);
        }

        this.close()
    }

    static onIncSkill(e, target) {
        const { skill } = target.dataset
        this.skillChanges[skill]++
        this.skillPointPool--
        this.render(true)
    }

    static onDecSkill(e, target) {
        const { skill } = target.dataset
        const newValue = this.skillChanges[skill] - 1
        if (newValue < 0) return
        if (newValue < this.actor.system.skills[skill].base) {
            ui.notifications.warn('Not possible to reduce skill lower than it is currently')
            return
        }
        this.skillChanges[skill]--
        this.skillPointPool++
        this.render(true)
    }

    static async onChoosePerk() {
        const perk = await ChoosePerk.create(this.actor);
        this.newPerk = perk || null
        this.render()
    }

    static async onChooseSpecial() {
        const special = await ChooseSpecial.create();
        this.specialBoost = special || null
        this.render()
    }

    static async onChooseRace() {
        const race = await ChooseRace.create();
        this.newRace = race || null
        this.render()
    }

    static async onChooseBackground() {
        const background = await ChooseBackground.create();
        this.newBackground = background || null
        this.render()
    }

    static onIncSpecial(e, target) {
        const { special } = target.dataset
        if (this.specialPointPool <= 0) return
        this.specialChanges[special]++
        this.specialPointPool--
        this.render()
    }

    static onDecSpecial(e, target) {
        const { special } = target.dataset
        const newValue = this.specialChanges[special] - 1
        if (newValue < MIN_SPECIAL_SCORE) {
            ui.notifications.warn(`SPECIAL scores can't go below ${MIN_SPECIAL_SCORE}`)
            return
        }
        this.specialChanges[special]--
        this.specialPointPool++
        this.render()
    }

    static onCancel() {
        this.close()
    }
}
