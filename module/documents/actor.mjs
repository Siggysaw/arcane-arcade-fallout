/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class FalloutZeroActor extends Actor {
  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData()

    //Handlebar JS Helpers

    // If Player is a GM
    Handlebars.registerHelper('GM', function (options) {
      if (game.user.role === 4) {
        return options.fn(this);
      }
      return options.inverse(this);
    })

    // Greater Than or Equal
    Handlebars.registerHelper('GreaterThan', function (v1, v2, options) {
      if (v1 >= v2) {
        return options.fn(this);
      }
      return options.inverse(this);
    })
    // Less Than
    Handlebars.registerHelper('LesserThan', function (v1, v2, options) {
      if (v1 < v2) {
        return options.fn(this);
      }
      return options.inverse(this);
    })

    // Sum Of
    Handlebars.registerHelper('Sum', function (v1, v2) {
      let sum = v1 + v2
        return sum;
    })
    
    const background = this.items.find(item => item.type === "background")
    if (background) {
      const skill1 = background.system.skill1
      const skill2 = background.system.skill2
      const skill3 = background.system.skill3
      const skills = [skill1, skill2, skill3]
      for (const skill of skills) {
        this.system.skills[skill.value].modifiers = + 2
      }
      this.system.startingSkillpoints = 0
    }
  }
}
