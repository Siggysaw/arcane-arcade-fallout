import FalloutZeroItemBase from "./itemBase.mjs";

export default class FalloutZeroItemWeapon extends FalloutZeroItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.img = new fields.StringField({ initial: "systems/arcane-arcade-fallout/assets/vaultboy/ranged-weapon-icon.webp" })
    schema.load = new fields.NumberField({ required: true, nullable: false, initial: .1, min: 0 });
    schema.cost = new fields.NumberField({ required: true, nullable: false, initial: 1, min: 0 });
    schema.apCost = new fields.NumberField({ required: true, nullable: false, initial: 1, min: 0 });
    schema.damage = new fields.SchemaField({
        type: new fields.StringField({ initial: "piercing" }),
        formula: new fields.StringField({ initial: "2d4" })
    })
    // schema.roll = new fields.SchemaField({
    //     diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
    //     diceSize: new fields.StringField({ initial: "d20" }),
    //     diceBonus: new fields.StringField({ initial: "+@str.mod+ceil(@lvl / 2)" })
    // })
    schema.range = new fields.SchemaField({
        short: new fields.NumberField({ initial: 1 }),
        long: new fields.NumberField({ initial: 10, blank: true }),
    })
    schema.critical = new fields.SchemaField({
        dice: new fields.NumberField({ initial: 20, blank: true }),
        bonus: new fields.StringField({ initial: "2d4" }),
        multiplier: new fields.NumberField({ initial: 1 }),
        roll: new fields.SchemaField({
            diceNum: new fields.NumberField({ initial: 1, min: 1 }),
            diceSize: new fields.StringField({ initial: "d4" }),
        })
    })
    schema.ammo = new fields.SchemaField({
        type: new fields.StringField({ initial: "9mm" }),
        capacity: new fields.SchemaField({
            value: new fields.NumberField({
                ...requiredInteger,
                initial: 6,
            }),
            min: new fields.NumberField({
                ...requiredInteger,
                initial: 0
            }),
            max: new fields.NumberField({
                ...requiredInteger,
                initial: 6
            })
        }),
        consumes: new fields.SchemaField({
            type: new fields.ArrayField(new fields.StringField()),
            target: new fields.StringField(),
            amount: new fields.NumberField({ initial: 1 }),
        }),
    })
    schema.properties = new fields.ArrayField(new fields.StringField())
    schema.strengthRequirement = new fields.NumberField({ initial: 0 })

    return schema;
  }

  prepareDerivedData() {
  }

  get capacityAtMax() {
    return this.ammo.capacity.value === this.ammo.capacity.max
  }

//   reload(ammo = undefined) {
//     if (!ammo) {

//     }
//   }
}