import FalloutZeroActorBase from "./actor-base.mjs";
import { FALLOUTZERO } from "../config.mjs";

export default class FalloutZeroCharacter extends FalloutZeroActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField(Object.keys(FALLOUTZERO.penalties).reduce((obj, penalty) => {
      obj[penalty] = new fields.SchemaField({
        label: new fields.StringField({ value: FALLOUTZERO.penalties[penalty] }),
        value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      });
      return obj;
    }, {
      'level': new fields.SchemaField({
        level: new fields.SchemaField({
          value: new fields.NumberField({ ...requiredInteger, initial: 1 })
        }),
      })
    }));

    return schema;
  }
}