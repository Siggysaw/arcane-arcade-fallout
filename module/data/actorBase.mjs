import { FALLOUTZERO } from '../config.mjs'

export default class FalloutZeroActorBase extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    const requiredInteger = { required: true, nullable: false, integer: true }
    const schema = {}
    schema.biography = new fields.HTMLField()
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
    })

    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField(
      Object.keys(FALLOUTZERO.abilities).reduce((obj, ability) => {
        obj[ability] = new fields.SchemaField({
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 5,
            min: -10,
          }),
          mod: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
            min: -10,
          }),
          label: new fields.StringField({
            initial: FALLOUTZERO.abilities[ability].label,
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
            min: -10,
          }),
          label: new fields.StringField({
            initial: FALLOUTZERO.skills[skill].label,
          }),
        })
        return obj
      }, {}),
    )

    schema.armorClass = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      min: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    })

    schema.damageThreshold = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      min: new fields.NumberField({
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

  prepareBaseData() {
    super.prepareBaseData()
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.abilities) {
      // Calculate the modifier using d20 rules.
      this.abilities[key].mod = Math.floor(this.abilities[key].value - 5)
    }

    // Loop through skill scores, and add their modifiers to our sheet output.
    for (const key in this.skills) {
      this.skills[key].ability = FALLOUTZERO.skills[key].ability
    }
  }

  refillAp() {
    this.parent.update({ 'system.actionPoints.value': this.parent.system.actionPoints.max })
  }

  recycleAp() {
    this.parent.update({
      'system.actionPoints.value':
        Math.floor(this.parent.system.actionPoints.value / 2) + this.parent.system.actionPoints.max,
    })
  }

  rollWeapon(weaponId, hasDisadvantage = false) {
    const currentAp = this.actionPoints.value
    const weapon = this.parent.items.get(weaponId)
    const apCost = weapon.system.apCost
    const newAP = Number(currentAp) - Number(apCost)

    // if action would reduce AP below 0
    if (newAP < 0) {
      ui.notifications.warn(`Not enough AP for action`)
      return
    }

    // if weapon ammo capacity is 0
    if (weapon.system.ammo.capacity.value < 1) {
      ui.notifications.warn(`Weapon ammo is empty, need to reload`)
      return
    }

    // Update ammo quantity
    const foundAmmo = this.parent.items.get(weapon.system.ammo.consumes.target)
    if (foundAmmo) {
      const newAmmoQty = Number(foundAmmo.system.quantity - 1)
      const newWeaponAmmoCapacity = Number(weapon.system.ammo.capacity.value - 1)
      this.parent.updateEmbeddedDocuments('Item', [
        { _id: foundAmmo._id, 'system.quantity': newAmmoQty },
        {
          _id: weapon._id,
          'system.ammo.capacity.value': newWeaponAmmoCapacity,
        },
      ])

      console.log('ACTOR UPDATE', {
        'item.system.quantity': newAmmoQty,
        'weapon.system.ammo.capacity.value': newWeaponAmmoCapacity,
      })
    }

    // update actor AP
    this.parent.update({ 'system.actionPoints.value': Number(newAP) })

    // roll to hit
    const dice = hasDisadvantage ? '2d20kl' : 'd20'
    let roll = new Roll(
      `${dice} + ${this.skills[weapon.system.skillBonus].value} + ${this.abilities[weapon.system.abilityMod].mod} - ${this.penaltyTotal}`,
      this.getRollData(),
    )
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.parent }),
      flavor: `BOOM! Attack with a ${weapon.name}`,
      rollMode: game.settings.get('core', 'rollMode'),
    })

    console.log('ACTOR UPDATE', {
      'system.actionPoints.value': newAP,
    })

    return roll
  }

  getWeaponsNewCapacity(weapon, consumableAmmo) {
    if (consumableAmmo && consumableAmmo.system.quantity < weapon.system.ammo.capacity.max) {
      return consumableAmmo.system.quantity
    } else {
      return weapon.system.ammo.capacity.max
    }
  }

  reload(weaponId = null) {
    const weapon = this.parent.items.get(weaponId)
    if (!weapon) {
      ui.notifications.warn(`Weapon ${weaponId} not found on actor`)
      return
    }

    const newAP = this.actionPoints.value - 6
    if (newAP < 0) {
      ui.notifications.warn(`Not enough action points to reload`)
      return
    }

    if (weapon.system.capacityAtMax) {
      ui.notifications.warn(`Weapon capacity is already at max`)
      return
    }

    const consumableAmmo = this.parent.items.get(weapon.system.ammo.consumes.target)
    if (!consumableAmmo) {
      ui.notifications.warn(`No rounds assigned to weapon, set a consumable ammo`)
      return
    } else if (
      consumableAmmo.system.quantity < 1 ||
      consumableAmmo.system.quantity === weapon.system.ammo.capacity.value
    ) {
      ui.notifications.warn(`No rounds left to reload weapon`)
      return
    }

    const newCapacity = this.getWeaponsNewCapacity(weapon, consumableAmmo)
    if (newCapacity < 1) {
      ui.notifications.warn(`No rounds left to reload weapon`)
      return
    }

    this.parent.update({ 'system.actionPoints.value': newAP })
    this.parent.updateEmbeddedDocuments('Item', [
      { _id: weaponId, 'system.ammo.capacity.value': newCapacity },
    ])
  }

  getRollData() {
    const data = {}

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k, v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v)
      }
    }

    if (this?.attributes?.level?.value) {
      data.lvl = this.attributes.level.value
    }

    return data
  }
}
