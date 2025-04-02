export default class AwardApplication extends Application {
    constructor(entities, options = {}) {
        super(options);
        this.actors = entities
        this.newActorData = this.actors.reduce((acc, actor) => {
            acc[actor.id] = {
                xp: 0,
                caps: 0,
            }
            return acc
        }, {})
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "award",
            title: 'Award',
            template: 'systems/arcane-arcade-fallout/templates/dialog/award.hbs',
            width: 400,
            height: 'auto',
            popOut: true,
            dragDrop: [{ dropSelector: ".dialog-content" }],
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        html[0].querySelector('[data-award]').addEventListener('click', this.award.bind(this))

        this.actors.forEach((actor) => {
            html[0].querySelector(`[data-actor-xp=${actor.id}]`).addEventListener('input', (event) => {
                this.newActorData[actor.id].xp = parseInt(event.target.value)
            })
            html[0].querySelector(`[data-actor-caps=${actor.id}]`).addEventListener('input', (event) => {
                this.newActorData[actor.id].caps = parseInt(event.target.value)
            })
        })
    };

    async award() {
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
            this.close()
        } catch(error) {
            console.log('Error awarding caps and xp')
        }
    }

    getData(options) {
        return {
            actors: this.actors,
        };
    }
}
