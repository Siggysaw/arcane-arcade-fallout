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
  }
}
