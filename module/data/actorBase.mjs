import { FALLOUTZERO } from '../config.mjs'

export default class FalloutZeroActor extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = {}
    schema.biography = new fields.HTMLField()
    schema.skillPool = new fields.NumberField({ initial: 0 })
    schema.startingSkillpoints = new fields.NumberField({ initial: 6 })
    schema.totalSkillpoints = new fields.NumberField({ initial: 0 })
    schema.health = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
      }),
      min: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      max: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
      }),
      temp: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
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
      }),
      temp: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })
    schema.actionPoints = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
      }),
      min: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      max: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
      }),
      temp: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      boostMax: new fields.NumberField({
        initial: 0,
      }),
      recover: new fields.StringField({
        initial: 'half',
      }),
      dazed: new fields.NumberField({
        initial: 0,
      }),
    })
    schema.karmaCaps = new fields.ArrayField(new fields.BooleanField(), { initial: [true] })

    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField(
      Object.keys(FALLOUTZERO.abilities).reduce((obj, ability) => {
        obj[ability] = new fields.SchemaField({
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 5,
          }),
          mod: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          base: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          modifiers: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          label: new fields.StringField({
            initial: FALLOUTZERO.abilities[ability].label,
          }),
          abbr: new fields.StringField({
            initial: FALLOUTZERO.abilities[ability].abbreviation,
          }),
          advantage: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
        })
        return obj
      }, {}),
    )

    schema.skills = new fields.SchemaField(
      Object.keys(FALLOUTZERO.skills).reduce((obj, skill) => {
        obj[skill] = new fields.SchemaField({
          ability: new fields.ArrayField(new fields.StringField({ required: true })),
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          base: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          modifiers: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          label: new fields.StringField({
            initial: FALLOUTZERO.skills[skill].label,
          }),
          id: new fields.StringField({
            initial: FALLOUTZERO.skills[skill].id,
          }),
          advantage: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
        })
        return obj
      }, {}),
    )
    schema.irradiated = new fields.NumberField({ initial: 0, min: 0 })
    schema.armorClass = new fields.SchemaField({
      base: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      modifiers: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      armor: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
      }),
    })
    schema.bonuses = new fields.SchemaField({
      allDamage: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })

    schema.damageThreshold = new fields.SchemaField({
      base: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      modifiers: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      armor: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })

    schema.radiationDC = new fields.SchemaField({
      base: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      modifiers: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })

    schema.caps = new fields.NumberField({
      initial: 0,
      min: 0,
    })

    return schema
  }

  /**
   * @override
   * Augment the actor source data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    super.prepareDerivedData()
    this.health.effectiveMax = this.health.max + (this.health.temp ?? 0)
    this.health.damage = this.health.max - this.health.value
    this.stamina.effectiveMax = this.stamina.max + (this.stamina.temp ?? 0)
    this.stamina.damage = this.stamina.max - this.stamina.value
  }
}
