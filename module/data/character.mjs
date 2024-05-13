import FalloutZeroActorBase from "./actor-base.mjs";
import { FALLOUTZERO } from "../config.mjs";

export default class FalloutZeroCharacter extends FalloutZeroActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.level = new fields.NumberField({
      ...requiredInteger,
      initial: 1,
      min: 1,
      max: 30
    })

    schema.penalties = new fields.SchemaField(Object.keys(FALLOUTZERO.penalties).reduce((obj, penalty) => {
      obj[penalty] = new fields.SchemaField({
        label: new fields.StringField({ value: FALLOUTZERO.penalties[penalty] }),
        value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      });
      return obj;
    }, {}));

    schema['carry-load'] = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      min: new fields.NumberField({
        ...requiredInteger,
        initial: 0
      }),
      max: new fields.NumberField({
        ...requiredInteger,
        initial: 0
      })
    });

    schema['healing-rate'] = new fields.NumberField({ initial: 0, min: 0 })

    schema['penalty-total'] = new fields.NumberField({ initial: 0, min: 0 })

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData()
    for (const key in this.penalties) {
      this.penalties[key].label = FALLOUTZERO.penalties[key].label
    }
    this.penalties['rad-dc'].value = 12 - this.abilities['end'].mod
    this['carry-load'].max = this.abilities['str'].value * 10
    this['healing-rate'] = Math.floor((this.level + this.abilities['end'].value) / 2)
    this['penalty-total'] = this.penalties.hunger.value + this.penalties.dehydration.value + this.penalties.exhaustion.value + this.penalties.radiation.value + this.penalties.fatigue.value
  }
}