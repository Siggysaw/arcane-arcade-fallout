import { FALLOUTZERO } from "../config.mjs";

export default class FalloutZeroActorBase extends foundry.abstract.TypeDataModel {
  
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};
    schema.biography = new fields.HTMLField();
    schema.health = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
      }),
      min: new fields.NumberField({
        ...requiredInteger,
        initial: 0
      }),
      max: new fields.NumberField({
        ...requiredInteger,
        initial: 10
      })
    });
    schema.stamina = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        min: 0,
        initial: 10,
      }),
      min: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      max: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
      })
    });
    schema.actionPoints = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
      }),
      min: new fields.NumberField({
        ...requiredInteger,
        initial: 0
      }),
      max: new fields.NumberField({
        ...requiredInteger,
        initial: 10
      })
    });
	schema.background = new fields.StringField({ initial: "", blank: true })
    schema.race = new fields.StringField({ initial: "", blank: true })
	schema.background = new fields.StringField( value: "");
    
    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField(Object.keys(FALLOUTZERO.abilities).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 0 }),
        mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        label: new fields.StringField({ initial: FALLOUTZERO.abilities[ability].label })
      });
      return obj;
    }, {}));

    schema.skills = new fields.SchemaField(Object.keys(FALLOUTZERO.skills).reduce((obj, skill) => {
      obj[skill] = new fields.SchemaField({
        ability: new fields.ArrayField(new fields.StringField({ required: true })),
        value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        label: new fields.StringField({ initial: FALLOUTZERO.skills[skill].label })
      });
      return obj;
    }, {}));

    schema.armorClass = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      min: new fields.NumberField({
        ...requiredInteger,
        initial: 0
      })
    });

    schema.damageThreshold = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      min: new fields.NumberField({
        ...requiredInteger,
        initial: 0
      })
    });

    schema.caps = new fields.NumberField({
      initial: 0,
      min: 0,
    })

    return schema
  }

  prepareBaseData() {
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.abilities) {
      // Calculate the modifier using d20 rules.
      this.abilities[key].mod = Math.floor(this.abilities[key].value - 5)
    }

    // Loop through skill scores, and add their modifiers to our sheet output.
    for (const key in this.skills) {
      // Calculate the modifier using d20 rules.
      this.skills[key].mod = Math.floor(this.skills[key].value)
      this.skills[key].ability = FALLOUTZERO.skills[key].ability
    }
  }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k,v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    if (this?.attributes?.level?.value) {
      data.lvl = this.attributes.level.value;
    }

    return data
  }
}