export default class AttackRoll extends FormApplication {
  constructor(actor, weapon, options = {}, callback = () => {}) {
    super(actor, options);

    this.actor = actor;
    this.weapon = weapon;
    this.onSubmitCallback = callback;

    this.properMaintenance = this.actor.items.find((i) => i.name === "Proper Maintenance");
    this.deadEye = this.actor.items.find((i) => i.name === "deadEye");
    this.triggerDiscipline = this.actor.items.find((i) => i.name === "Trigger Discipline");
    this.finesse = this.actor.items.find((i) => i.name === "Finesse");

    const decayValue = this.weapon.getDecayValue();
    const gunCondition = this.weapon.system.decay;

    const isBroken =
      gunCondition === 0 ||
      (this.properMaintenance && gunCondition <= 2) ||
      (this.properMaintenance?.system?.wildWasteland && gunCondition <= 5);

    if (isBroken) {
      ui.notifications.warn(`${this.weapon.name} has decayed too much and is broken`);
    }

    const weaponType = this.weapon.type;
    const apCost = Number(this.weapon.system.apCost ?? 0);
    const subtraction = Number(this.weapon.system.APSubtraction ?? 0);

    this.formDataCache = {
      weaponType,
      automaticAttack: false,
      consumesAp: true,
      skillBonus: Number(this.actor.getSkillBonus(this.weapon.system.skillBonus) ?? 0),
      attackBonus: Number(this.actor.getAttackBonus(this.weapon) ?? 0),
      damageBonus: Number(this.actor.getDamageBonus(this.weapon) ?? 0),
      abilityBonus: Number(this.weapon.getAbilityBonus() ?? 0),
      decayPenalty: weaponType === "explosive" ? 0 : Number(decayValue ?? 0),
      actorLuck: Number(this.actor.getAbilityMod(CONFIG.FALLOUTZERO.abilities.lck.id) ?? 0),
      actorPenalties: Number(this.actor.system.penaltyTotal ?? 0),
      totalBonus:
        Number(this.actor.getSkillBonus(this.weapon.system.skillBonus) ?? 0) +
        Number(this.actor.getAttackBonus(this.weapon) ?? 0) +
        Number(this.weapon.getAbilityBonus() ?? 0) -
        Number(decayValue ?? 0) -
        Number(this.actor.system.penaltyTotal ?? 0) +
        Number(this.actor.getAbilityMod(CONFIG.FALLOUTZERO.abilities.lck.id) ?? 0),
      bonus: 0,
      targeted: null,
      advantageMode: options.advantageMode ?? AttackRoll.ADV_MODE.NORMAL,
      apCost,
      totalApCost: apCost - subtraction,
      adjustedApCost: 0,
      critical: this.weapon.system.critical,
      repeat: 1,
      fullAuto: false,
      damages: (this.weapon.system.damages ?? []).map((damage) => ({
        ...damage,
        selectedDamageType: damage.type,
      })),
    };
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["falloutzero", "dialog", "attack-roll"],
      title: "V.A.T.S",
      template: "systems/arcane-arcade-fallout/templates/actor/dialog/attack.hbs",
      width: "auto",
      height: "auto",
      submitOnChange: true,
      closeOnSubmit: false,
      resizable: true,
    });
  }

  static ADV_MODE = {
    NORMAL: 1,
    ADVANTAGE: 2,
    DISADVANTAGE: 3,
    HAILMARY: 4,
  };

  static TARGET_COST = {
    eyes: 5,
    head: 3,
    arm: 3,
    torso: 2,
    groin: 3,
    leg: 2,
    carried: 4,
  };

  static TARGET_SIZE = {
    eyes: 1,
    head: 1,
    arm: 1,
    torso: 1,
    groin: 1,
    leg: 1,
    carried: 1,
  };

  async getData() {
    return {
      ...(await super.getData()),
      ...this.formDataCache,
    };
  }

  getDice() {
    const advantageMode = Number(this.formDataCache.advantageMode);
    const diceCount = [AttackRoll.ADV_MODE.ADVANTAGE, AttackRoll.ADV_MODE.DISADVANTAGE].includes(advantageMode) ? 2 : 1;
    const diceSuffix =
      advantageMode === AttackRoll.ADV_MODE.ADVANTAGE ? "kh" :
      advantageMode === AttackRoll.ADV_MODE.DISADVANTAGE ? "kl" :
      "";
    return `${diceCount}d20${diceSuffix}`;
  }

  getFinalApCost() {
    if (this.formDataCache.automaticAttack) {
      this.formDataCache.totalApCost = 0;
    }
    if (this.formDataCache.overrideAp) {
      return Number(this.formDataCache.adjustedApCost ?? 0);
    }
    return Number(this.formDataCache.totalApCost ?? 0);
  }

  getTargetedApCost(target) {
    let apCost = Number(AttackRoll.TARGET_COST?.[target] ?? 0);

    if (this.triggerDiscipline) {
      apCost -= 1;
      if (this.triggerDiscipline.system.wildWasteland) apCost -= 1;
    }

    if (this.weapon.type === "meleeWeapon") {
      apCost -= 2;
    }

    return Math.max(apCost, 1);
  }

  getTargetedDamage(formula) {
    if (!formula) return formula;

    const [diceCount, ...rest] = String(formula).split("d");
    const remainder = rest.join("d");

    switch (this.formDataCache.targeted?.target) {
      case "head":
        return `${Number(diceCount) + 1}d${remainder}`;
      case "arm":
      case "leg": {
        const newDice = Math.max(Number(diceCount) - 1, 1);
        return `${newDice}d${remainder}`;
      }
      case "carried":
        return "0";
      default:
        return formula;
    }
  }

  getFlavor(target) {
    if (this.weapon.type === "explosive") {
      return `
        GET DOWN! ${this.weapon.name} thrown! This will detonate _____ <hr>
        1: In hand <br>
        2: Halfway to target <br>
        3 - 14: Start of your next turn <br>
        15+: End of your turn
      `;
    }

    let flavor = `BOOM! Attack with ${this.weapon.name}`;
    if (target) {
      flavor += target === "carried" ? " aiming for the carried item" : ` aiming for the ${target}`;
    }
    return flavor;
  }

  getCombinedDamageFormula() {
    return (this.weapon.system.damages ?? []).reduce((total, damage, index) => {
      const adjusted = this.getTargetedDamage(damage.formula);
      return index === 0 ? `${total}${adjusted}` : `${total} + ${adjusted}`;
    }, "");
  }

  getExplosiveRangeToolData() {
    if (this.weapon.type !== "explosive") return null;

    return {
      selected: true,
      size: Number(this.weapon.system.aoeRadius ?? 0),
    };
  }

  renderTargetedDialog() {
    new Dialog(
      {
        title: "Choose target",
        content: "",
        buttons: {
          close: {
            label: "Close",
          },
        },
        render: (html) => {
          html[0].querySelectorAll("button").forEach((button) => {
            button.addEventListener("click", (e) => {
              const audio = new Audio("systems/arcane-arcade-fallout/assets/sounds/vats/ui_vats_selecttargetpart.wav");
              audio.play();

              const target = e.currentTarget.name;
              const targetedAp = this.getTargetedApCost(target);

              this.formDataCache.targeted = {
                target,
                cost: targetedAp,
              };

              this.formDataCache.totalApCost = Number(this.formDataCache.apCost ?? 0) + targetedAp;
              this.render();
              e.currentTarget.closest(".dialog")?.remove();
            });
          });
        },
      },
      {
        template: "systems/arcane-arcade-fallout/templates/actor/dialog/targeted-attack.hbs",
        width: 500,
        height: 500,
        resizable: true,
      }
    ).render(true);
  }

  activateListeners(html) {
    super.activateListeners(html);

    const form = html[0];

    form.addEventListener("change", () => {
      Object.assign(this.formDataCache, this._getSubmitData());
      this.render();
    });

    form.querySelectorAll("[data-override-ap]").forEach((overrideButton) => {
      overrideButton.addEventListener("click", (e) => {
        const { overrideAp } = e.currentTarget.dataset;

        if (overrideAp === "inc") {
          this.formDataCache.adjustedApCost += 1;
        } else if (overrideAp === "dec" && this.formDataCache.adjustedApCost > 0) {
          this.formDataCache.adjustedApCost -= 1;
        }

        this.render();
      });
    });

    form.querySelector("[data-add-target]")?.addEventListener("click", () => this.renderTargetedDialog());

    form.querySelector("[data-remove-target]")?.addEventListener("click", () => {
      this.formDataCache.targeted = null;
      this.formDataCache.totalApCost = this.formDataCache.apCost;
      this.render();
    });

    form.querySelector("[data-close]")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.close();
    });
  }

  async performRoll() {
    if (this.formDataCache.consumesAp) {
      const canAfford = await this.actor.applyApCost(this.getFinalApCost());
      if (!canAfford) return;
    }

    if (this.weapon.system.ammo?.assigned) {
      const canAfford = this.weapon.applyAmmoCost();
      if (!canAfford) return;
    }

    if (this.weapon.type === "explosive") {
      const qty = Number(this.weapon.system.quantity ?? 0);
      if (qty > 0) {
        await this.weapon.update({ "system.quantity": qty - 1 });
      }
    }

    let {
      automaticAttack,
      skillBonus,
      attackBonus,
      damageBonus,
      abilityBonus,
      decayPenalty,
      actorLuck,
      actorPenalties,
      bonus,
      bonusdamage,
    } = this.formDataCache;

    skillBonus = Number(skillBonus ?? 0);
    attackBonus = Number(attackBonus ?? 0);
    damageBonus = Number(damageBonus ?? 0);
    abilityBonus = Number(abilityBonus ?? 0);
    decayPenalty = Number(decayPenalty ?? 0);
    actorLuck = Number(actorLuck ?? 0);
    actorPenalties = Number(actorPenalties ?? 0);
    bonus = Number(bonus ?? 0);
    bonusdamage = Number(bonusdamage ?? 0);

    const rollBonusTotal =
      skillBonus +
      attackBonus +
      abilityBonus +
      actorLuck +
      bonus -
      actorPenalties -
      decayPenalty;

    const roll = await new Roll(`${this.getDice()} + ${rollBonusTotal}`, this.actor.getRollData()).evaluate();

    const attackTooltip = `
      <div>
        <div>Skill bonus: ${skillBonus}</div>
        <div>Perks bonus: ${attackBonus}</div>
        <div>Ability bonus: ${abilityBonus}</div>
        <div>Luck bonus: ${actorLuck}</div>
        ${bonus ? `<div>Other bonus: ${bonus}</div>` : ""}
        <div>Penalties total: ${actorPenalties}</div>
        <div>Weapon decay: ${decayPenalty}</div>
        <hr />
        <div>Bonus Total: ${rollBonusTotal}</div>
      </div>
    `;

    if (this.actor.type !== "npc" && this.finesse) {
      const critBonus = this.finesse.system.wildWasteland ? 2 : 1;
      const critical = foundry.utils.deepClone(this.weapon.system.critical ?? {});
      const startCrit = String(critical.formula ?? "");
      const startMult = Number(critical.multiplier ?? 1);

      if (startCrit.includes("d")) {
        const [dice, rest] = startCrit.split("d");
        critical.formula = `${Number(dice) + critBonus}d${rest}`;
      }

      if (startMult > 1) {
        critical.multiplier = startMult + critBonus;
      }

      await this.weapon.update({ "system.critical": critical });
    }

    const damageRolls = (this.formDataCache.damages ?? []).map((damage) => {
      const baseFormula = this.formDataCache.targeted
        ? this.getTargetedDamage(damage.formula)
        : damage.formula;

      return {
        type: damage.selectedDamageType,
        weapon: this.weapon.type,
        formula: `${baseFormula} + ${damageBonus} + ${bonusdamage}`,
      };
    });

    const explosiveRangeTool = this.getExplosiveRangeToolData();

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: this.getFlavor(this.formDataCache.targeted?.target),
      rollMode: game.settings.get("core", "rollMode"),
      flags: {
        falloutzero: {
          type: "attack",
          itemId: this.weapon.id,
          tooltip: attackTooltip,
          abilityBonus,
          targeted: this.formDataCache.targeted,
          rangeTool: explosiveRangeTool,
          damage: {
            rolls: damageRolls,
            isCritical: roll.dice?.[0]?.total >= Number(this.weapon.system.critical?.dice ?? Infinity),
            criticalCondition: this.weapon.system.critical?.condition,
            critical: `(${this.getCombinedDamageFormula()} + ${this.weapon.system.critical?.formula ?? ""} + ${abilityBonus}) * ${this.weapon.system.critical?.multiplier ?? 1}`,
          },
        },
      },
    });

    return roll;
  }

  async _updateObject(event, formData) {
    Object.assign(this.formDataCache, formData);

    if (event.type !== "submit") {
      this.render();
      return;
    }

    let repeat = Number(this.formDataCache.repeat ?? 1);
    if (this.formDataCache.fullAuto) repeat = 20;

    for (let i = 0; i < repeat; i++) {
      const actionPoints = Number(this.actor.system.actionPoints?.value ?? 0);
      const apCost = this.getFinalApCost();
      const ammoAvailable = Number(this.weapon.system.ammo?.capacity?.value ?? 0);

      if (actionPoints < apCost) {
        ui.notifications.notify("AP Depleted");
        break;
      }

      if (this.weapon.type === "rangedWeapon" && ammoAvailable < 1) {
        ui.notifications.notify("Ammo Depleted");
        break;
      }

      await this.performRoll();
    }

    const blocking = this.actor.items.find((i) => i.name === "Blocking");
    if (blocking) await blocking.delete();

    await this.onSubmitCallback?.();
    this.close();
  }
}
