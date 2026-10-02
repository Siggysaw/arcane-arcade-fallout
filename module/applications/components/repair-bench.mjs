const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

// Same 3-pane shell as CraftingBench (module/applications/components/
// crafting-bench.mjs), retargeted at repair: the sidebar lists the actor's
// own worn/damaged gear instead of a compendium-wide recipe catalog, and
// there's no crafted-item creation step — a successful repair just moves
// system.decay and consumes materials in place.

const REPAIR_CATEGORY_LABELS = {
  armor: 'Armor',
  meleeWeapon: 'Melee Weapons',
  rangedWeapon: 'Ranged Weapons',
}

/**
 * Resolves the concrete {name, quantity} list a repair is actually about
 * to consume, for either requirements shape:
 *   - 'fixed' (armor): the resolved materials list is already concrete.
 *   - 'pool' (melee/ranged weapons): the player has chosen `slotsRequired`
 *     distinct names out of requirements.materialPool — each consumed at
 *     requirements.unitQuantity.
 */
function resolveMaterialsToConsume(requirements, selectedMaterials) {
  if (requirements.mode === 'fixed') return requirements.materials
  return selectedMaterials.map((name) => ({ name, quantity: requirements.unitQuantity }))
}

/**
 * Consumes repair materials and, on success, advances the item's decay.
 * Shared between the auto-succeed "Repair" action and a resolved
 * RepairAttempt roll so both paths apply results identically.
 */
async function applyRepairResult({ actor, item, requirements, selectedMaterials, success, dice = null }) {
  const materials = resolveMaterialsToConsume(requirements, selectedMaterials)
  const fraction = success ? 1 : 0.5
  await Promise.all(
    materials.map(async (mat) => {
      const owned = actor.getCraftingMaterialItem(mat)
      if (!owned) return null
      const consumed = Math.floor(mat.quantity * fraction)
      if (!consumed) return null
      return actor.updateItemById(owned.id, {
        quantity: Math.max(0, owned.system.quantity - consumed),
      })
    })
  )

  let flavor
  if (success) {
    const newDecay = requirements.broken ? 5 : Math.min(10, item.system.decay + 1)
    await item.update({ 'system.decay': newDecay })
    flavor = requirements.broken
      ? `Repair successful — ${item.name} restored from broken to 5/10 condition.`
      : `Repair successful — ${item.name} restored by 1 level of decay (now ${newDecay}/10).`
  } else {
    flavor = `Repair failed — no decay repaired. Half materials and time spent anyway.`
  }

  if (dice) {
    dice.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `Repair attempt for ${item.name}<br>${flavor}`,
    })
  } else {
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `Repair for ${item.name}<br>${flavor}`,
    })
  }
}

class RepairAttempt extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor({ actor, item, selectedMaterials = [] }, options = {}) {
    super(options)
    this.actor = actor
    this.item = item
    this.requirements = item.getRepairRequirements()
    this.selectedMaterials = selectedMaterials
    this.result = null
  }

  static DEFAULT_OPTIONS = {
    actions: {
      roll: RepairAttempt.roll,
      cancel: RepairAttempt.cancel,
    },
    classes: ['attempt-crafting', 'attempt-repair'],
    position: {
      width: 480,
      height: 'auto',
    },
    window: {
      title: 'Repair Check',
      resizable: true,
      minimizable: false,
    },
    tag: 'dialog',
    modal: true,
  }

  static PARTS = {
    main: {
      template: 'systems/arcane-arcade-fallout/templates/repair-bench/attempt-roll.hbs',
    },
  }

  async _prepareContext() {
    return {
      actor: this.actor,
      item: this.item,
      dc: this.requirements.dc,
      broken: this.requirements.broken,
      materialsToConsume: resolveMaterialsToConsume(this.requirements, this.selectedMaterials),
    }
  }

  /** @override */
  async _onFirstRender(_context, _options) {
    if (this.options.modal) this.element.showModal();
    else this.element.show();
  }

  static async create(options) {
    const app = new this(options);
    const { promise, resolve } = Promise.withResolvers();
    app.addEventListener("close", () => resolve(app.result), { once: true });
    app.render({ force: true });
    return promise;
  }

  static async roll() {
    const skillId = CONFIG.FALLOUTZERO.skills.crafting.id
    const skillBonus = this.actor.getSkillBonus(skillId)
    const abilityBonus = this.actor.getAbilityMod(CONFIG.FALLOUTZERO.skills[skillId].ability[0])
    const penaltyTotal = this.actor.system.penaltyTotal
    const luckModSkillBonus = this.actor.getAbilityMod(CONFIG.FALLOUTZERO.abilities.lck.id)
    const roll = new Roll(`1d20 + ${skillBonus} + ${abilityBonus} - ${penaltyTotal} + ${luckModSkillBonus}`)
    const dice = await roll.evaluate()

    const success = dice.total >= this.requirements.dc

    await applyRepairResult({
      actor: this.actor,
      item: this.item,
      requirements: this.requirements,
      selectedMaterials: this.selectedMaterials,
      success,
      dice,
    })

    this.result = success
    this.close()
  }

  static cancel() {
    this.close()
  }
}

export default class RepairBench extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(actor, preselectedItemId = null, options = {}) {
    super(options);
    this.actor = actor
    this.selectedItemId = preselectedItemId
    // Names the player has chosen, for a pool-mode repair, to sacrifice —
    // reset whenever the selected item changes (see selectItem()).
    this.selectedMaterials = []
  }

  static DEFAULT_OPTIONS = {
    actions: {
      select: RepairBench.selectItem,
      toggleMaterial: RepairBench.toggleMaterial,
      repair: RepairBench.repair,
      attemptRepair: RepairBench.attemptRepair,
      close: RepairBench.closeBench,
    },
    classes: ['crafting-bench', 'repair-bench'],
    position: {
      width: 1100,
      height: 700,
    },
    window: {
      title: 'Repair Bench',
      resizable: true
    }
  }

  static PARTS = {
    sidebar: {
      template: 'systems/arcane-arcade-fallout/templates/repair-bench/sidebar.hbs',
    },
    main: {
      template: 'systems/arcane-arcade-fallout/templates/repair-bench/main.hbs',
    },
    console: {
      template: 'systems/arcane-arcade-fallout/templates/repair-bench/console.hbs',
    },
  }

  get repairableItems() {
    return this.actor.items.filter((i) => i.isRepairable)
  }

  get hasAnyItems() {
    return this.repairableItems.length > 0
  }

  get groupedItems() {
    const groups = Object.keys(REPAIR_CATEGORY_LABELS).reduce((acc, type) => {
      acc[type] = { label: REPAIR_CATEGORY_LABELS[type], items: [] }
      return acc
    }, {})

    for (const item of this.repairableItems) {
      const group = groups[item.type]
      if (!group) continue
      group.items.push({
        id: item.id,
        name: item.name,
        isBroken: item.isBroken,
        conditionLabel: item.isBroken ? 'BROKEN' : `${item.system.decay}/10`,
        selected: item.id === this.selectedItemId,
      })
    }

    for (const key of Object.keys(groups)) {
      groups[key].items.sort((a, b) => a.name.localeCompare(b.name))
    }

    return groups
  }

  get selectedItem() {
    return this.selectedItemId ? this.actor.items.get(this.selectedItemId) ?? null : null
  }

  get requirements() {
    return this.selectedItem?.getRepairRequirements() ?? null
  }

  get skillBonus() {
    return this.actor.getSkillBonus(CONFIG.FALLOUTZERO.skills.crafting.id)
  }

  get canAutoRepair() {
    if (!this.requirements) return false
    return this.skillBonus >= this.requirements.bonus
  }

  /**
   * Materials list for the main panel, shaped for either mode:
   *   - fixed: {name, quantity, ownedQuantity} — the concrete requirement.
   *   - pool: {name, uuid, ownedQuantity, selected, disabled} — a
   *     candidate the player can toggle on/off (disabled once they don't
   *     own enough of it to cover requirements.unitQuantity).
   */
  get materialsDisplay() {
    if (!this.requirements) return []
    if (this.requirements.mode === 'fixed') {
      return this.requirements.materials.map((mat) => ({
        ...mat,
        ownedQuantity: this.actor.getCraftingMaterialItem(mat)?.system.quantity ?? 0,
      }))
    }
    return this.requirements.materialPool.map((mat) => {
      const owned = this.actor.getCraftingMaterialItem(mat)?.system.quantity ?? 0
      return {
        ...mat,
        ownedQuantity: owned,
        selected: this.selectedMaterials.includes(mat.name),
        disabled: owned < this.requirements.unitQuantity,
      }
    })
  }

  get selectedMaterialCount() {
    return this.selectedMaterials.length
  }

  get hasMaterialsSelected() {
    return this._hasMaterials()
  }

  async _prepareContext() {
    const skillId = CONFIG.FALLOUTZERO.skills.crafting.id
    const item = this.selectedItem
    const canAutoRepair = this.canAutoRepair
    const hasMaterialsSelected = this.hasMaterialsSelected
    return {
      groupedItems: this.groupedItems,
      hasAnyItems: this.hasAnyItems,
      selectedItem: item ? {
        id: item.id,
        name: item.name,
        img: item.img,
        description: item.system.description,
        isBroken: item.isBroken,
        conditionLabel: item.isBroken ? 'BROKEN' : `${item.system.decay}/10`,
        cost: item.system.cost,
        load: item.system.load,
      } : null,
      requirements: this.requirements,
      materials: this.materialsDisplay,
      selectedMaterialCount: this.selectedMaterialCount,
      skillBonus: this.skillBonus,
      abilityBonus: this.actor.getAbilityMod(CONFIG.FALLOUTZERO.skills[skillId].ability[0]),
      luck: this.actor.getAbilityMod(CONFIG.FALLOUTZERO.abilities.lck.id),
      penaltyTotal: this.actor.system.penaltyTotal,
      canAutoRepair,
      hasMaterialsSelected,
      canRepairNow: canAutoRepair && hasMaterialsSelected,
      canAttemptRepair: hasMaterialsSelected,
    }
  }

  static selectItem(e, target) {
    e.preventDefault()
    this.selectedItemId = target.dataset.itemId
    this.selectedMaterials = []
    this.render()
  }

  static toggleMaterial(e, target) {
    e.preventDefault()
    if (!this.requirements || this.requirements.mode !== 'pool') return
    const name = target.dataset.materialName
    const idx = this.selectedMaterials.indexOf(name)
    if (idx >= 0) {
      this.selectedMaterials.splice(idx, 1)
    } else {
      if (this.selectedMaterials.length >= this.requirements.slotsRequired) {
        ui.notifications.warn(`You only need ${this.requirements.slotsRequired} different materials for this repair — deselect one first.`)
        return
      }
      this.selectedMaterials.push(name)
    }
    this.render()
  }

  static async repair() {
    if (!this.selectedItem) return
    if (!this.canAutoRepair) {
      return ui.notifications.warn("Your Crafting skill doesn't meet this item's repair bonus — try Attempt Repair instead.")
    }
    if (!this._hasMaterials()) {
      return ui.notifications.warn(this._materialsWarning())
    }
    await applyRepairResult({
      actor: this.actor,
      item: this.selectedItem,
      requirements: this.requirements,
      selectedMaterials: this.selectedMaterials,
      success: true,
    })
    this.selectedMaterials = []
    this.render()
  }

  static async attemptRepair() {
    if (!this.selectedItem) return
    if (!this._hasMaterials()) {
      return ui.notifications.warn(this._materialsWarning())
    }
    await RepairAttempt.create({ actor: this.actor, item: this.selectedItem, selectedMaterials: this.selectedMaterials })
    this.selectedMaterials = []
    this.render()
  }

  _hasMaterials() {
    if (!this.requirements) return false
    if (this.requirements.mode === 'fixed') {
      return this.requirements.materials.every((mat) => {
        const owned = this.actor.getCraftingMaterialItem(mat)?.system.quantity ?? 0
        return owned >= mat.quantity
      })
    }
    if (this.selectedMaterials.length !== this.requirements.slotsRequired) return false
    return this.selectedMaterials.every((name) => {
      const owned = this.actor.getCraftingMaterialItem({ name })?.system.quantity ?? 0
      return owned >= this.requirements.unitQuantity
    })
  }

  _materialsWarning() {
    if (this.requirements?.mode === 'pool') {
      return `Select ${this.requirements.slotsRequired} different materials you own to sacrifice.`
    }
    return 'You do not have the required materials.'
  }

  static closeBench() {
    this.close()
  }
}
