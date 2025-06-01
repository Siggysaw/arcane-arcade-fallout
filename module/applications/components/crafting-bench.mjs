const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

const ATTEMPT_RESULT = {
  FAIL: 'fail',
  CRITICAL_FAIL: 'critical fail',
  SUCCESS: 'success',
  CRITICAL_SUCCESS: 'critical success',
}

async function updateCreateCraftedItem({ actor, selectedCraftable }) {
  const existingItem = actor.getItemByCompendiumId(selectedCraftable.uuid)
  let newQty = existingItem?.system?.quantity ?? 0

  // Update or create crafted item
  if (existingItem) {
    newQty += 1
    actor.updateItemById(existingItem.id, {
      quantity: newQty
    })
  } else {
    const compendiumItem = await fromUuid(selectedCraftable.uuid)
    const craftedItem = compendiumItem.toObject()
    craftedItem._stats.compendiumSource = selectedCraftable.uuid
    await Item.create(craftedItem, { parent: actor })
    newQty = 1
  }

  return newQty
}

function attemptToMessage(actor, craftable, { attemptType, attemptDice, critSuccessDice, materialChange }) {
  const materialsUsedMessage = craftable.system.crafting.materials.reduce((acc, mat, index) => {
    if (attemptType === ATTEMPT_RESULT.CRITICAL_SUCCESS && critSuccessDice.total === index) {
      acc += `${Math.max(1, mat.quantity - materialChange)} ${mat.name} consumed <br>`
      return acc
    }
    acc += `${mat.quantity} ${mat.name} consumed <br>`
    return acc
  }, '')

  if (attemptDice) {
    attemptDice.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `
        ${attemptType}: Crafting attempt for ${craftable.name} <br>
        ${[ATTEMPT_RESULT.CRITICAL_SUCCESS, ATTEMPT_RESULT.SUCCESS].includes(attemptType) ? `${craftable.name} crafted successfully` : ''} <br>
        ${[ATTEMPT_RESULT.CRITICAL_FAIL, ATTEMPT_RESULT.FAIL].includes(attemptType) ? `Lose ${materialChange} materials of each item used` : ''} <br>
        ${[ATTEMPT_RESULT.CRITICAL_SUCCESS].includes(attemptType) ? `Use ${materialChange} less ${craftable.system.crafting.materials[critSuccessDice.total]?.name}` : ''} <br>
        ${[ATTEMPT_RESULT.CRITICAL_SUCCESS, ATTEMPT_RESULT.SUCCESS].includes(attemptType) ? materialsUsedMessage : ''}
      `
    })
  } else {
    const chatData = {
      author: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `
        ${craftable.name} crafted <br>
        ${materialsUsedMessage}
      `,
    }
    ChatMessage.create(chatData, {})
  }
}

async function updateActorMaterials({ actor, materials, attemptResult = ATTEMPT_RESULT.SUCCESS, materialChange = { index: -1, value: 0 } }) {
  return await Promise.all(
    materials.map(async (mat, matIndex) => {
      const item = actor.getItemByCompendiumId(mat.uuid)

      // on critical success, add the materialChange value to specific material quantity
      if (attemptResult === ATTEMPT_RESULT.CRITICAL_SUCCESS) {
        if (materialChange.index === matIndex) {
          // reduce one material by less based on the materialChange value
          return await actor.updateItemById(item.id, {
            quantity: Math.max(0, item.system.quantity - Math.max(1, (mat.quantity - materialChange.value)))
          })
        } else {
          // other items get normal reduction
          return await actor.updateItemById(item.id, {
            quantity: Math.max(0, item.system.quantity - mat.quantity)
          })
        }
      }

      if ([ATTEMPT_RESULT.FAIL, ATTEMPT_RESULT.CRITICAL_FAIL].includes(attemptResult)) {
        return await actor.updateItemById(item.id, {
          quantity: Math.max(0, item.system.quantity - materialChange.value)
        })
      }

      // on all other cases, subtract the material quantity from the actor
      return await actor.updateItemById(item.id, {
        quantity: Math.max(0, item.system.quantity - (mat.quantity + materialChange.value))
      })
    })
  )
}

class CraftingAttempt extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor({ actor, craftable }, options = {}) {
    super(options);
    this.actor = actor
    this.craftable = craftable
    this.selectedSkill = craftable.system.crafting.mainRequirements[0].key
    this.newOwnedQty = null
    this.searchQuery
    this.onlyCraftables = true
  }

  static DEFAULT_OPTIONS = {
    actions: {
      roll: CraftingAttempt.roll,
      cancel: CraftingAttempt.cancel,
    },
    classes: ['attempt-crafting'],
    window: {
      title: 'Roll to craft',
      resizable: false,
      minimizable: false,
    },
    tag: 'dialog',
    modal: true,
  }

  static PARTS = {
    main: {
      template: 'systems/arcane-arcade-fallout/templates/crafting-bench/attempt-roll.hbs',
    },
  }

  async _prepareContext() {
    const skillBonus = this.actor.system.skills[this.selectedSkill].value
    return {
      actor: this.actor,
      craftable: this.craftable,
      dc: this.dc,
      hasSkillChoice: this.hasSkillChoice,
      selectedSkill: this.selectedSkill,
      skillBonus: `${skillBonus >= 0 ? '+' : '-'}${skillBonus} `,
    }
  }

  /** @override */
  async _onFirstRender(_context, _options) {
    if (this.options.modal) this.element.showModal();
    else this.element.show();
  }

  get hasSkillChoice() {
    return this.craftable.system.crafting.mainRequirements.length > 1
  }

  get dc() {
    if (!this.craftable) return null
    return this.craftable.system.crafting.mainRequirements.find((req) => {
      return req.key === this.selectedSkill
    })?.dc + 10 ?? null
  }

  static async create(options) {
    const app = new this(options);
    const { promise, resolve } = Promise.withResolvers();
    app.addEventListener("close", () => resolve(app.newOwnedQty), { once: true });
    app.render({ force: true });
    return promise;
  }

  static async roll() {
    const skillBonus = this.actor.getSkillBonus(this.selectedSkill)
    const abilityBonus = this.actor.getAbilityMod(CONFIG.FALLOUTZERO.skills[this.selectedSkill].ability[0])
    const penaltyTotal = this.actor.system.penaltyTotal
    const luckModSkillBonus = this.actor.getAbilityMod(CONFIG.FALLOUTZERO.abilities.lck.id)
    const roll = new Roll(`1d20 + ${skillBonus} + ${abilityBonus} + ${penaltyTotal} + ${luckModSkillBonus}`)
    const dice = await roll.evaluate()

    let result
    if (dice.total <= this.dc) {
      result = ATTEMPT_RESULT.FAIL
      if (dice.total <= (this.dc - 8)) {
        result = ATTEMPT_RESULT.CRITICAL_FAIL
      }
    } else {
      result = ATTEMPT_RESULT.SUCCESS
      if (dice.total >= (this.dc + 8)) {
        result = ATTEMPT_RESULT.CRITICAL_SUCCESS
      }
    }

    let materialChange = 0
    if (result !== ATTEMPT_RESULT.SUCCESS) {
      const diceSides = result === ATTEMPT_RESULT.CRITICAL_FAIL ? '6' : '4'
      const roll = await new Roll(`1d${diceSides} `).evaluate()
      materialChange = roll.total
    }

    // if successful, create the crafted item
    if ([ATTEMPT_RESULT.SUCCESS, ATTEMPT_RESULT.CRITICAL_SUCCESS].includes(result)) {
      this.newOwnedQty = await updateCreateCraftedItem({ actor: this.actor, selectedCraftable: this.craftable })
    }

    const critSuccessDice = await new Roll(`1d${Math.max(0, this.craftable.system.crafting.materials.length - 1)} `).evaluate()
    await updateActorMaterials({
      actor: this.actor,
      materials: this.craftable.system.crafting.materials,
      attemptResult: result,
      materialChange: {
        index: result === ATTEMPT_RESULT.CRITICAL_SUCCESS ? critSuccessDice.total : -1,
        value: materialChange
      }
    })

    attemptToMessage(
      this.actor,
      this.craftable,
      {
        attemptType: result,
        attemptDice: dice,
        critSuccessDice: critSuccessDice,
        materialChange: materialChange,
      }
    )

    this.close()
  }

  static cancel() {
    this.close()
  }
}
export default class CraftingBench extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(actorId, options = {}) {
    super(options);
    this.actorId = actorId
    this.selectedCraftable = null
    this.openBranches = []
    this.owned = 0

    this.fullCraftingTree = Object.keys(CONFIG.FALLOUTZERO.craftingTypes).reduce((acc, typeKey) => {
      acc[typeKey] = {
        ...CONFIG.FALLOUTZERO.craftingTypes[typeKey],
        items: [],
      }
      return acc
    }, {})
  }

  static DEFAULT_OPTIONS = {
    actions: {
      select: CraftingBench.selectCraftable,
      toggleBranch: CraftingBench.toggleBranch,
      craft: CraftingBench.craft,
      attemptCraft: CraftingBench.attemptCraft,
      onlyCraftables: CraftingBench.toggleOnlyCraftables,
      search: CraftingBench.search,
    },
    classes: ['crafting-bench'],
    window: {
      title: 'Crafting Bench',
      resizable: true
    }
  }

  static PARTS = {
    sidebar: {
      template: 'systems/arcane-arcade-fallout/templates/crafting-bench/sidebar.hbs',
    },
    main: {
      template: 'systems/arcane-arcade-fallout/templates/crafting-bench/main.hbs',
    },
  }

  _onRender() {
    this.element.querySelector('[data-action=search]')?.addEventListener('search', (e) => this.search(e))
  };

  async _prepareContext() {
    return {
      craftingTree: this.craftingTree,
      selectedCraftable: this.selectedCraftable,
      openBranches: this.openBranches,
      materials: this.materials,
      skills: this.skills,
      owned: this.owned,
      hasRequirements: this.hasRequirements,
      searchQuery: this.searchQuery,
      onlyCraftables: this.onlyCraftables,
    }
  }

  get actor() {
    return game.actors.find((actor) => {
      return actor.id === this.actorId
    })
  }

  get skills() {
    return Object.keys(this.actor.system.skills).reduce((acc, key) => {
      acc[key] = this.actor.system.skills[key].value
      return acc
    }, {})
  }

  get materials() {
    return this.actor.craftingMaterials.reduce((acc, mat) => {
      acc[mat._stats.compendiumSource] = {
        name: mat.name,
        quantity: mat.system.quantity
      }
      return acc
    }, {})
  }

  get allRequirements() {
    if (!this.selectedCraftable) return []
    return [
      ...this.selectedCraftable.system.crafting.mainRequirements,
      ...this.selectedCraftable.system.crafting.additionalRequirements,
    ]
  }

  get hasRequirements() {
    return this.allRequirements.reduce((passes, req) => {
      if (this.skills[req.key] < req.dc) {
        passes = false
      }
      return passes
    }, true)
  }

  get craftingTree() {
    if (!this.searchQuery && !this.onlyCraftables) {
      return this.fullCraftingTree
    }

    let tree = this.fullCraftingTree

    // if onlyCraftables is set, filter the crafting tree
    if (this.onlyCraftables) {
      tree = Object.keys(tree).reduce((acc, branchKey) => {
        const branch = this.fullCraftingTree[branchKey]
        // if branch has no items, skip it
        if (!branch.items.length) return acc
        // if branch has items, filter them
        const filteredItems = branch.items.filter((item) => this.hasMaterials(item))
        // if branch has no items, skip it
        if (!filteredItems.length) return acc

        // else add branch to the crafting tree
        acc[branchKey] = {
          ...branch,
          items: filteredItems
        }
        return acc
      }, {})
    }

    // if searchQuery is set, filter the crafting tree
    if (this.searchQuery) {
      tree = Object.keys(tree).reduce((acc, branchKey) => {
        const branch = this.fullCraftingTree[branchKey]
        // if branch label is a match, return branch and all leafs
        if (branch.label.toLowerCase().includes(this.searchQuery)) {
          acc[branchKey] = branch
        } else {
          const leafMatches = branch.items.filter((leaf) => leaf.name.toLowerCase().includes(this.searchQuery))
          // filter branch leafs
          if (leafMatches.length) {
            acc[branchKey] = {
              ...branch,
              items: leafMatches,
            }
          }
        }
        return acc
      }, {})
    }

    return tree
  }

  async init() {
    try {
      const packsWithCraftables = game.packs.filter((p) => CONFIG.FALLOUTZERO.packsWithCraftables.includes(p.collection))
      const packCraftables = await Promise.all(
        packsWithCraftables.map(async (pack) => {
          const items = await pack.getDocuments()
          return items.filter((item) => item.system.crafting.craftable)
        })
      )

      for (const craftable of packCraftables.flat()) {
        const type = this.craftingTree[craftable.system.crafting.type]
        type.items.push(craftable)
      }

    } catch (error) {
      console.error(error);
      ui.notifications.warn('Failed to get perks from compendium')
    }
  }

  static selectCraftable(e, target) {
    e.stopPropagation()
    e.preventDefault()
    const { branch, index } = target.dataset
    this.selectedCraftable = this.craftingTree[branch].items[index] ?? null
    const itemOwned = this.actor.items.find((i) => i.name == this.selectedCraftable.name)
    itemOwned !== undefined ? this.owned = itemOwned.system.quantity : this.owned = 0
    this.selectedSkill = this.selectedCraftable.system.crafting.mainRequirements[0]
    this.render()
  }

  static toggleBranch(e, target) {
    const { branchKey } = target.dataset
    if (this.openBranches.includes(branchKey)) {
      this.openBranches.splice(this.openBranches.indexOf(branchKey), 1)
    } else {
      this.openBranches.push(branchKey)
    }
  }

  static async craft() {
    if (!this.hasMaterials(this.selectedCraftable)) {
      return this._missingMaterialsWarning()
    }
    this.owned = await updateCreateCraftedItem({ actor: this.actor, selectedCraftable: this.selectedCraftable })
    await updateActorMaterials({ actor: this.actor, materials: this.selectedCraftable.system.crafting.materials })

    attemptToMessage(
      this.actor,
      this.selectedCraftable,
      {
        attemptType: ATTEMPT_RESULT.SUCCESS,
      }
    )

    this.render()
  }

  static async attemptCraft() {
    if (!this.hasMaterials(this.selectedCraftable)) {
      return this._missingMaterialsWarning()
    }
    const result = await CraftingAttempt.create({ actor: this.actor, craftable: this.selectedCraftable })

    // if the crafting attempt was successful, update the owned quantity
    if (result) {
      this.owned = result
    }

    this.render()
  }

  hasMaterials(craftableItem) {
    if (!craftableItem) return false

    return craftableItem.system.crafting.materials.every((mat) => {
      return (this.materials?.[mat.uuid]?.quantity ?? 0) >= mat.quantity
    })
  }

  search(event) {
    this.searchQuery = event.currentTarget.value.toLowerCase()
    this.render()
  }

  static toggleOnlyCraftables() {
    this.onlyCraftables = !this.onlyCraftables
    this.render()
  }

  _missingMaterialsWarning() {
    ui.notifications.warn('You do not have the required materials')
  }
}
