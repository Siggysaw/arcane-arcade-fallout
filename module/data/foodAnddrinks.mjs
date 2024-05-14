export default class FalloutZeroItemBase extends foundry.abstract.TypeDataModel {

   static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 });
    schema.load = new fields.NumberField({ required: true, nullable: false, initial: 1, min: 0 });
    schema.cost = new fields.NumberField({ required: true, nullable: false, initial: 1, min: 0 });
    schema.img = new fields.StringField({ initial: "systems/arcane-arcade-fallout/assets/vaultboy/wasteland camel.png" })

    return schema;
  }
}