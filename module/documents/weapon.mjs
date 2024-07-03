/**
 * Extend the basic Weapon with some very simple modifications.
 * @extends {Item}
 */
export default class FalloutZeroWeapon extends Item {
  /**
   * Augment the basic Weapon data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, weapons are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData()
  }

  /**
   * Prepare a data object which defines the data schema used by dice roll commands against this Weapon
   * @override
   */
  getRollData() {
    // Starts off by populating the roll data with `this.system`
    const rollData = { ...super.getRollData() }

    // Quit early if there's no parent actor
    if (!this.actor) return rollData

    // If present, add the actor's roll data
    rollData.actor = this.actor.getRollData()

    return rollData
  }

  /* -------------------------------------------- */
  /*  Weapon Rolls - Attack, Damage, Saves, Checks  */
  /* -------------------------------------------- */

  /**
   * Place an attack roll using an weapon (weapon or equipment)
   * Rely upon the d20Roll logic for the core implementation
   *
   * @param {D20RollConfiguration} options  Roll options which are configured and provided to the d20Roll function
   * @returns {Promise<D20Roll|null>}       A Promise which resolves to the created Roll instance
   */
  async rollAttack(options = {}) {
    if (!this.hasAttack) throw new Error('You may not place an Attack Roll with this Weapon.')
    let title = `Attack with ${this.weapon.name}`

    // Get the parts and rollData for this weapon's attack
    const { parts, rollData } = this.getAttackToHit()

    // Handle ammunition consumption
    // let ammoUpdate = [];
    // const consume = this.system.consume;
    // const ammo = this.hasAmmo ? this.actor.weapons.get(consume.target) : null;
    // if ( ammo ) {
    //   const q = ammo.system.quantity;
    //   const consumeAmount = consume.amount ?? 0;
    //   if ( q && (q - consumeAmount >= 0) ) {
    //     title += ` [${ammo.name}]`;
    //   }

    //   // Get pending ammunition update
    //   const usage = this._getUsageUpdates({consumeResource: true});
    //   if ( usage === false ) return null;
    //   ammoUpdate = usage.resourceUpdates ?? [];
    // }

    // Compose roll options
    const rollConfig = foundry.utils.mergeObject(
      {
        actor: this.actor,
        data: rollData,
        critical: this.criticalThreshold,
        title,
        flavor: title,
        dialogOptions: {
          width: 400,
        },
        messageData: {
          'flags.aafo': {
            roll: { type: 'attack', weaponId: this.id, weaponUuid: this.uuid },
          },
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        },
      },
      options,
    )
    rollConfig.parts = parts.concat(options.parts ?? [])

    return null
    // const roll = await d20Roll(rollConfig)
    // if (roll === null) return null

    // Commit ammunition consumption on attack rolls resource consumption if the attack roll was made
    // if ( ammoUpdate.length ) await this.actor?.updateEmbeddedDocuments("Weapon", ammoUpdate);
    // return roll
  }
}
