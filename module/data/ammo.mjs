import FalloutZeroItemBase from "./item-base.mjs";

export default class FalloutZeroItemAmmo extends FalloutZeroItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 });
    schema.load = new fields.NumberField({ required: true, nullable: false, initial: .1, min: 0 });
    schema.cost = new fields.NumberField({ required: true, nullable: false, initial: 1, min: 0 });
    schema.img = new fields.StringField({ initial: "systems/arcane-arcade-fallout/assets/vaultboy/ranged-weapon-icon.webp" })

    return schema;
  }

  prepareDerivedData() {
  }
}