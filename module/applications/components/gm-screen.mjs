
const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
export default class GMScreen extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(entities, options = {}) {
        super(options);
        this.actors = entities
    }

    static DEFAULT_OPTIONS = {
        tag: "div",
        actions: {
            divideGroup: GMScreen.onDivideGroup,
            cancel: GMScreen.onCancel,
        },
        window: {
            title: 'GMScreen',
            resizable: true
        }
    }

    static PARTS = {
        main: {
            template: 'systems/arcane-arcade-fallout/templates/dialog/gm-screen.hbs',
        },
    }

    async _prepareContext() {
        return {
            actors: this.actors,
            newActorData: this.newActorData,
            groupXp: this.groupXp,
            groupCaps: this.groupCaps,
        }
    }

    static async awardXPAndCaps() {
        const awards = this.actors.map((actor) => {
            const newXP = actor.system.xp + this.newActorData[actor.id].xp
            const newCaps = actor.system.caps + this.newActorData[actor.id].caps
            return actor.update({
                "system.xp": newXP,
                "system.caps": newCaps
            });
        })

        try {
            await Promise.all(awards)
        } catch (error) {
            console.log('Error awarding caps and xp')
        }
    }

    _onRender() {
        this.element.querySelector('[data-group-xp]')?.addEventListener('input', (event) => {
            this.groupXp = parseInt(event.target.value)
        })
        this.element.querySelector('[data-group-caps]')?.addEventListener('input', (event) => {
            this.groupCaps = parseInt(event.target.value)
        })

        this.actors.forEach((actor) => {
            this.element.querySelector(`[data-actor-xp=${actor.id}]`)?.addEventListener('input', (event) => {
                this.newActorData[actor.id].xp = parseInt(event.target.value)
            })
            this.element.querySelector(`[data-actor-caps=${actor.id}]`)?.addEventListener('input', (event) => {
                this.newActorData[actor.id].caps = parseInt(event.target.value)
            })
        })
    }

    static onDivideGroup(e) {
        Object.keys(this.newActorData).forEach((actorId) => {
            this.newActorData[actorId].xp = this.groupXp / this.actors.length
            this.newActorData[actorId].caps = this.groupCaps / this.actors.length
        })

        this.groupXp = 0
        this.groupCaps = 0
        this.render(true)
    }

    static onCancel(e) {
        e.preventDefault()
        this.close()
    }
}
