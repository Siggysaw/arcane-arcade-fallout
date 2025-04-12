
import ChoosePerk from './choose-perk.mjs'
import ChooseSpecial from './choose-special.mjs'

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
            cancel: LevelUp.onCancel,
        },
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

    activateListeners(html) {
        super.activateListeners(html);
        html[0].querySelector('button[type="submit"]')?.addEventListener('click', () => {
            if (this.skillPointPool > 0) {
                ui.notifications.warn('You still have skill points to spend!')
                return
            } else if (this.perkOrSpecial && (!this.newPerk && !this.specialBoost)) {
                ui.notifications.warn('You still need to take a perk or boost a SPECIAL!')
                return
            }
            this.performLevelup()
            this.close()
        })
    };

    get nextLevel() {
        return this.actor.system.level + 1
    }

    get attributeBoost() {
        return this.nextLevel % 2
    }

    get newHPMax () {
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

    get newSPMax () {
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
            attributeBoost: this.attributeBoost,
            newHPMax: this.newHPMax,
            newSPMax: this.newSPMax,
            perkOrSpecial: this.perkOrSpecial,
            skillChanges: this.skillChanges,
            skillPointPool: this.skillPointPool,
            hasSkillPoints: this.hasSkillPoints,
            specialBoost: this.specialBoost,
            newPerk: this.newPerk,
        }
    }

    static performLevelup() {
        if (this.skillPointPool > 0) {
            ui.notifications.warn('You still have skill points to spend!')
            return
        } else if (this.perkOrSpecial && (!this.newPerk && !this.specialBoost)) {
            ui.notifications.warn('You still need to take a perk or boost a SPECIAL!')
            return
        }

        const newXP = this.actor.system.xp - 1000

        const skillUpdates = Object.entries(this.skillChanges).reduce((acc, [key, value]) => {
            acc[`system.skills.${key}.base`] = value
            return acc
        }, {})

        this.actor.update({
            'system.health.max': this.newHPMax,
            'system.health.value': this.newHPValue,
            'system.stamina.max': this.newSPMax,
            'system.stamina.value': this.newSPValue,
            'system.xp': newXP,
            'system.level': this.nextLevel,
            ...skillUpdates,
            ...(this.specialBoost && {[`system.abilities.${this.specialBoost.id}.base`]: this.actor.system.abilities[this.specialBoost.id].base + 1})
        })

        if (this.newPerk) {
            const perk = fromUuidSync(this.newPerk.uuid)
            this.actor.createEmbeddedDocuments("Item", [perk]);
        }

        this.close()
    }

    static onIncSkill (e, target) {
        const { skill } = target.dataset
        this.skillChanges[skill]++
        this.skillPointPool--
        this.render(true)
    }

    static onDecSkill (e, target) {
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

    static async onChoosePerk () {
        const perk = await ChoosePerk.create(this.actor);
        this.newPerk = perk || null
        this.render()
    }
    
    static async onChooseSpecial () {
        const special = await ChooseSpecial.create();
        this.specialBoost = special || null
        this.render()
    }

    static onCancel () {
        this.close()
    }
}
