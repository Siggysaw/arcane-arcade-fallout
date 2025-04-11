import { FALLOUTZERO } from "../../config.mjs";
import ChoosePerk from './choose-perk.mjs'

export default class LevelUpApplication extends Application {
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

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "level-up",
            title: 'You leveled up!',
            template: 'systems/arcane-arcade-fallout/templates/level-up/level-up.hbs',
            width: 400,
            height: 'auto',
            popOut: true,
            resizable: true,
        });
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

        html[0].querySelectorAll('[data-decrease-skill]').forEach((el) => {
            el.addEventListener('click', (e) => {
                const { decreaseSkill } = e.currentTarget.dataset
                const newValue = this.skillChanges[decreaseSkill] - 1
                if (newValue < 0) return
                if (newValue < this.actor.system.skills[decreaseSkill].base) {
                    ui.notifications.warn('Not possible to reduce skill lower than it is currently')
                    return
                }
                this.skillChanges[decreaseSkill]--
                this.skillPointPool++
                this.render(true)
            })
        })

        html[0].querySelectorAll('[data-increase-skill]').forEach((el) => {
            el.addEventListener('click', (e) => {
                const { increaseSkill } = e.currentTarget.dataset
                this.skillChanges[increaseSkill]++
                this.skillPointPool--
                this.render(true)
            })
        })

        html[0].querySelector('[data-choose-special]')?.addEventListener('click', () => {
            const dlg = new Dialog(
                {
                    title: `Choose SPECIAL`,
                    content: {
                        specials: FALLOUTZERO.abilities
                    },
                    buttons: {},
                    render: (html) => {
                        const specials = html[0].querySelectorAll('[data-special]')
                        specials.forEach((button) => {
                            button.addEventListener('click', (e) => {
                                const { special } = e.currentTarget.dataset
                                this.specialBoost = FALLOUTZERO.abilities[special]
                                this.render(true)
                                dlg.close()
                            })
                        })

                        html[0].querySelector('[data-cancel]')?.addEventListener('click', () => {
                            this.specialBoost = null
                            this.render(true)
                            dlg.close()
                        })
                    },
                },
                {
                    width: 200,
                    template: 'systems/arcane-arcade-fallout/templates/level-up/dialog/choose-special.hbs',
                    resizable: true,
                }
            ).render(true)
        })

        html[0].querySelector('[data-choose-perk]')?.addEventListener('click', async () => {
            const perk = await ChoosePerk.create(this.actor);
            this.newPerk = perk || null
            this.render()
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
        if (this.nextLevel % 4 !== 0) return 0
        // Skill points allotted is based on Intelligence modifier
        if (this.actor.system.abilities.int.mod > 0) {
            return 5
        } else if (this.actor.system.abilities.int.mod == 0) {
            return 4
        } else {
            return 3
        }
    }

    getData() {
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
        };
    }

    filterPerks(perks) {
        return perks.filter((perk) => {
            const raceIds = perk.system.raceReq.map((race) => race.id)
            const hasSpecialReq = (perk.system.specialReq.special && perk.system.specialReq.special !== 'None')
            if (
                (!perk.system.lvlReq || this.nextLevel >= perk.system.lvlReq) &&
                (!hasSpecialReq || this.actor.system.abilities[perk.system.specialReq.special].base >= perk.system.specialReq.value) &&
                (raceIds.length === 0 || raceIds.includes(this.actor.getRaceType()))
            ) {
                return perk
            }
        })
    }

    performLevelup() {
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
            return this.actor.createEmbeddedDocuments("Item", [perk]);
        }
    }
}
