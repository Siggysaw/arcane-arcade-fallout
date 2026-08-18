const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

const ATTEMPT_RESULT = {
  FAIL: 'fail',
  CRITICAL_FAIL: 'critical fail',
  SUCCESS: 'success',
  CRITICAL_SUCCESS: 'critical success',
}

async function updateCreateCraftedItem({ actor, selectedCraftable, selectedBaseItemId }) {
  const efficientMunitionsPerk = selectedCraftable.type === 'ammo' && actor.hasPerk('Efficient Munitions')
  const doubleQuantity = !!efficientMunitionsPerk && efficientMunitionsPerk.system.efficientMunitions === true
  const renameEfficient = !!efficientMunitionsPerk && efficientMunitionsPerk.system.efficientMunitions === false

  let craftedQty = selectedCraftable.system.crafting.quantity || 1
  if (doubleQuantity) {
    craftedQty *= 2
  }

  const craftedName = renameEfficient ? `Efficient ${selectedCraftable.name}` : selectedCraftable.name

  // Match on compendium source AND name, so "Efficient X" and "X" are
  // tracked as separate stacks rather than colliding on the same source item
  const existingItem = selectedCraftable.type !== 'armorUpgrade' && actor.items.find((item) => {
    return item._stats.compendiumSource === selectedCraftable.uuid && item.name === craftedName
  })

  let newQty = existingItem?.system?.quantity ?? 0

  // Update or create crafted item
  if (existingItem) {
    newQty += craftedQty
    actor.updateItemById(existingItem.id, {
      quantity: newQty
    })
  } else {
    const compendiumItem = await fromUuid(selectedCraftable.uuid)
    const craftedItem = compendiumItem.toObject()
    craftedItem._stats.compendiumSource = selectedCraftable.uuid
    craftedItem.name = craftedName
    if (selectedBaseItemId) {
      craftedItem.system.type = selectedBaseItemId
    }

    const createdItem = await Item.create(craftedItem, { parent: actor })
    await createdItem.update({ 'system.quantity': craftedQty })

    newQty = craftedQty
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

async function updateActorMaterials({ actor, craftable, materials, attemptResult = ATTEMPT_RESULT.SUCCESS, materialChange = { index: -1, value: 0 } }) {
  let materialDiscount = 0
  if (craftable?.type === 'chem' && actor.hasPerk('Adroit Alchemist')) {
    materialDiscount += 1
  }
  if (actor.hasPerk('Expert Engineer')) {
    materialDiscount += 2
  }

  // Reduces a consumption amount by the combined discount, down to a
  // minimum of 1. Only applies to material *usage*, not to fail-state
  // material loss.
  const applyMaterialDiscount = (qty) => {
    if (materialDiscount === 0) return qty
    return Math.max(1, qty - materialDiscount)
  }

  return await Promise.all(
    materials.map(async (mat, matIndex) => {
      const item = actor.getItemByCompendiumId(mat.uuid)

      // on critical success, add the materialChange value to specific material quantity
      if (attemptResult === ATTEMPT_RESULT.CRITICAL_SUCCESS) {
        if (materialChange.index === matIndex) {
          // reduce one material by less based on the materialChange value
          const baseQty = Math.max(1, (mat.quantity - materialChange.value))
          return await actor.updateItemById(item.id, {
            quantity: Math.max(0, item.system.quantity - applyMaterialDiscount(baseQty))
          })
        } else {
          // other items get normal reduction
          return await actor.updateItemById(item.id, {
            quantity: Math.max(0, item.system.quantity - applyMaterialDiscount(mat.quantity))
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
        quantity: Math.max(0, item.system.quantity - applyMaterialDiscount(mat.quantity + materialChange.value))
      })
    })
  )
}

class CraftingAttempt extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor({ actor, craftable, selectedBaseItemId }, options = {}) {
    super(options);
    this.actor = actor
    this.craftable = craftable
    this.selectedBaseItemId = selectedBaseItemId
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
    position: {
      width: 480,
      height: 'auto',
    },
    window: {
      title: 'Crafting Check',
      resizable: true,
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

  _onRender() {
    this.element.querySelector('[data-select-skill]')?.addEventListener('change', (e) => {
      this.selectedSkill = e.currentTarget.value
      this.render()
    })
  };

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

  get selectedBaseItemMaterials() {
    const uuid = CONFIG.FALLOUTZERO.armorTypes?.[this.selectedBaseItemId]?.uuid
    if (!uuid || !this.craftable.system.crafting.materialBase.required) return []
    const selectedBaseItem = fromUuidSync(uuid)
    return selectedBaseItem.system.crafting.materials.map((mat) => {
      return {
        ...mat,
        quantity: this.craftable.system.crafting.materialBase.multiplier
      }
    })
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
    const roll = new Roll(`1d20 + ${skillBonus} + ${abilityBonus} - ${penaltyTotal} + ${luckModSkillBonus}`)
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
      this.newOwnedQty = await updateCreateCraftedItem({ actor: this.actor, selectedCraftable: this.craftable, selectedBaseItemId: this.selectedBaseItemId })
    }

    const critSuccessDice = await new Roll(`1d${Math.max(0, this.craftable.system.crafting.materials.length - 1)} `).evaluate()
    await updateActorMaterials({
      actor: this.actor,
      craftable: this.craftable,
      materials: [...this.craftable.system.crafting.materials, ...this.selectedBaseItemMaterials],
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
    this.selectedBaseItemId = null
    this.openBranches = []
    this.owned = 0

    this.fullCraftingTree = Object.keys(CONFIG.FALLOUTZERO.craftingTypes).reduce((acc, typeKey) => {
      acc[typeKey] = {
        ...CONFIG.FALLOUTZERO.craftingTypes[typeKey],
        items: [],
      }
      return acc
    }, {})

    // Default to the first category tab being active rather than opening
    // with no category selected.
    const firstBranchKey = Object.keys(this.fullCraftingTree)[0]
    this.openBranches = firstBranchKey ? [firstBranchKey] : []
  }

  static DEFAULT_OPTIONS = {
    actions: {
      select: CraftingBench.selectCraftable,
      craft: CraftingBench.craft,
      attemptCraft: CraftingBench.attemptCraft,
      onlyCraftables: CraftingBench.toggleOnlyCraftables,
      close: CraftingBench.closeBench,
      prevBranch: CraftingBench.prevBranch,
      nextBranch: CraftingBench.nextBranch,
    },
    classes: ['crafting-bench'],
    position: {
      width: 1100,
      height: 700,
    },
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
    console: {
      template: 'systems/arcane-arcade-fallout/templates/crafting-bench/console.hbs',
    },
  }

  _onRender() {
    // Guard every manually-attached listener against double-binding: a
    // render scoped to just ['main', 'console'] (see search()) leaves the
    // sidebar's DOM untouched, so without this check we'd stack a second
    // listener onto the same still-alive elements each time.
    const searchInput = this.element.querySelector('[data-search]')
    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = 'true'
      searchInput.addEventListener('input', (e) => this.search(e))
      searchInput.addEventListener('blur', () => { this._searchFocused = false })
    }
    // A render that touches the sidebar (e.g. switching category) replaces
    // the search input itself, so without this the field would lose focus.
    if (this._searchFocused && searchInput) {
      searchInput.focus()
      const pos = this._searchCursorPos ?? searchInput.value.length
      searchInput.setSelectionRange(pos, pos)
    }

    const baseItemSelect = this.element.querySelector('[data-base-item]')
    if (baseItemSelect && !baseItemSelect.dataset.bound) {
      baseItemSelect.dataset.bound = 'true'
      baseItemSelect.addEventListener('change', (e) => {
        this.selectedBaseItemId = e.currentTarget.value
        this.render()
      })
    }

    const branchSelect = this.element.querySelector('[data-select-branch]')
    if (branchSelect && !branchSelect.dataset.bound) {
      branchSelect.dataset.bound = 'true'
      branchSelect.addEventListener('change', (e) => {
        this.openBranches = [e.currentTarget.value]
        this.render()
      })
    }

    // Sync the sidebar's visible rows with the current search/category
    // state. Cheap and idempotent, so it's safe to just always run this
    // after every render (full or partial) rather than track exactly what
    // changed.
    this._applySidebarFilter()
  };

  // Pure DOM show/hide over the *already-rendered* sidebar list — same
  // technique GMApplication's quick-insert search uses. Every craftable
  // across every category is in the DOM at all times; this just toggles
  // which rows are visible. Critically, this never touches Foundry's
  // render() and never recreates the search <input>, so it can run on
  // every keystroke without disturbing focus or dropping characters —
  // which is what re-rendering the whole window on every keystroke was
  // doing before.
  _applySidebarFilter() {
    const list = this.element.querySelector('[data-craftables-list]')
    if (!list) return

    const query = (this.searchQuery ?? '').trim()
    const isSearching = query.length > 0
    const activeBranch = this.openBranches[0]

    this.element.querySelector('[data-header="browse"]')?.toggleAttribute('hidden', isSearching)
    this.element.querySelector('[data-header="search"]')?.toggleAttribute('hidden', !isSearching)
    list.classList.toggle('is-searching', isSearching)

    let visibleCount = 0
    list.querySelectorAll('.crafting-option').forEach((row) => {
      const matches = isSearching
        ? row.dataset.itemName?.toLowerCase().includes(query)
        : row.dataset.branch === activeBranch
      row.classList.toggle('is-hidden', !matches)
      if (matches) visibleCount++
    })

    const emptyMessage = list.querySelector('[data-empty-message]')
    if (emptyMessage) {
      emptyMessage.hidden = visibleCount > 0
      emptyMessage.textContent = isSearching ? 'No matches found' : 'Nothing found'
    }
  }

  async _prepareContext() {
    return {
      craftingTree: this.craftingTree,
      selectedCraftable: this.selectedCraftable,
      openBranches: this.openBranches,
      materials: this.materials,
      skills: this.skills,
      luck: this.actor.system.luckmod,
      abilityBonus: this.actor.system.abilities.int.mod,
      penaltyTotal: this.actor.system.penaltyTotal,
      owned: this.owned,
      hasRequirements: this.hasRequirements,
      searchQuery: this.searchQuery,
      searchResultsCount: this.searchQuery
        ? Object.values(this.craftingTree).reduce((sum, branch) => sum + branch.items.length, 0)
        : null,
      onlyCraftables: this.onlyCraftables,
      baseMaterialOptions: this.baseMaterialOptions,
      selectedBaseItemMaterials: this.selectedBaseItemMaterials,
      selectedBaseItemId: this.selectedBaseItemId,
      isArmorUpgrade: this.selectedCraftable?.type === 'armorUpgrade',
    }
  }

  get actor() {
    return game.actors.find((actor) => {
      return actor.id === this.actorId
    })
  }

  get selectedBaseItemUuid() {
    if (!this.selectedCraftable || !this.selectedBaseItemId || this.selectedCraftable.type !== 'armorUpgrade') return null
    return CONFIG.FALLOUTZERO.armorTypes[this.selectedBaseItemId].uuid
  }

  get skills() {
    return Object.keys(this.actor.system.skills).reduce((acc, key) => {
      acc[key] = this.actor.system.skills[key].value
      return acc
    }, {})
  }

  get materials() {
    const actorMaterials = this.actor.craftingMaterials
    console.log("Actor Materials: ", actorMaterials)
    return this.actor.craftingMaterials.reduce((acc, mat) => {
      acc[mat._stats.compendiumSource] = {
        name: mat.name,
        quantity: mat.system.quantity
      }
      console.log("ACC: ", acc)
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
      this.skillBonus = this.skills[req.key] + this.actor.system.abilities.int.mod + this.actor.getAbilityMod(CONFIG.FALLOUTZERO.abilities.lck.id)
      if (this.skillBonus < req.dc) {
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
          items: filteredItems,
        }
        return acc
      }, {})
    }

    // if searchQuery is set, filter the crafting tree
    if (this.searchQuery) {
      tree = Object.keys(tree).reduce((acc, branchKey) => {
        // Read from `tree`, not `fullCraftingTree` — when onlyCraftables is
        // also active, `tree` above has already been narrowed to items the
        // actor can afford. Reading from fullCraftingTree here would undo
        // that filtering and let uncraftable items reappear in search
        // results whenever both filters are active at once.
        const branch = tree[branchKey]
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

  get baseMaterialOptions() {
    if (!this.selectedCraftable || this.selectedCraftable.type !== 'armorUpgrade') return []
    return CONFIG.FALLOUTZERO.armorTypes
  }

  get selectedBaseItemMaterials() {
    if (!this.selectedBaseItemUuid || !this.selectedCraftable.system.crafting.materialBase.required) return []
    const selectedBaseItem = fromUuidSync(this.selectedBaseItemUuid)
    return selectedBaseItem.system.crafting.materials.map((mat) => {
      return {
        ...mat,
        quantity: this.selectedCraftable.system.crafting.materialBase.multiplier
      }
    })
  }

  async init() {
    try {
      const packsWithCraftables = game.packs.filter((p) => CONFIG.FALLOUTZERO.packsWithCraftables.includes(p.collection))
      const gameItems = game.items.filter((item) => item.system.crafting?.craftable)
      const packCraftables = await Promise.all(
        packsWithCraftables.map(async (pack) => {
          const items = await pack.getDocuments()
          return items.filter((item) => item.system.crafting?.craftable)
        })
      )

      // add items in compendia to the crafting tree
      for (const craftable of packCraftables.flat()) {
        const type = this.craftingTree[craftable.system.crafting.type]
        type.items.push(craftable)
      }
      for (const gameItem of gameItems.flat()) {
        const type = this.craftingTree[gameItem.system.crafting.type]
        type.items.push(gameItem)
      }

      // sort items in each branch
      Object.keys(this.craftingTree).forEach((branchKey) => {
        this.craftingTree[branchKey].items.sort((a, b) => a.name.localeCompare(b.name))
      })

    } catch (error) {
      console.error(error);
      ui.notifications.warn('Failed to get perks from compendium')
    }
  }

  static selectCraftable(e, target) {
    e.stopPropagation()
    e.preventDefault()
    const { branch, index } = target.dataset
    this._applySelectedCraftable(this.craftingTree[branch].items[index])
    this.render()
  }

  // Shared by the sidebar click handler and the search box's exact-match
  // selection (see _autoSelectExactMatch) so both stay in sync.
  _applySelectedCraftable(craftable) {
    this.selectedCraftable = craftable ?? null
    if (!this.selectedCraftable) return
    this.selectedBaseItemId = this.baseMaterialOptions?.[this.selectedCraftable.system.type]?.id ?? null
    const itemOwned = this.actor.items.find((i) => i.name == this.selectedCraftable.name)
    this.owned = itemOwned !== undefined ? itemOwned.system.quantity : 0
    this.selectedSkill = this.selectedCraftable.system.crafting.mainRequirements[0]
  }

  static async craft() {
    if (!this.hasMaterials(this.selectedCraftable)) {
      return this._missingMaterialsWarning()
    }
    this.owned = await updateCreateCraftedItem({ actor: this.actor, selectedCraftable: this.selectedCraftable, selectedBaseItemId: this.selectedBaseItemId })
    await updateActorMaterials({
      actor: this.actor,
      craftable: this.selectedCraftable,
      materials: [...this.selectedCraftable.system.crafting.materials, ...this.selectedBaseItemMaterials]
    })

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
    const result = await CraftingAttempt.create({ actor: this.actor, craftable: this.selectedCraftable, selectedBaseItemUuid: this.selectedBaseItemUuid })

    // if the crafting attempt was successful, update the owned quantity
    if (result) {
      this.owned = result
    }

    this.render()
  }

  hasMaterials(craftableItem) {
    if (!craftableItem) return false

    return [...craftableItem.system.crafting.materials, ...this.selectedBaseItemMaterials].every((mat) => {
      return (this.materials?.[mat.uuid]?.quantity ?? 0) >= mat.quantity
    })
  }

  search(event) {
    this.searchQuery = event.currentTarget.value.toLowerCase()
    this._searchFocused = true
    this._searchCursorPos = event.currentTarget.selectionStart

    // Filter the already-rendered list purely via the DOM (see
    // _applySidebarFilter) — no Foundry render() here at all, so the
    // search input is never torn down and focus/cursor position are never
    // disturbed while typing. This is what re-rendering the whole window
    // on every keystroke was breaking.
    this._applySidebarFilter()

    // An exact name match still needs the recipe readout (main + console)
    // to update with the newly-selected item's details. Debounce that and
    // scope the render to just those two parts — the sidebar (and the
    // focused search input inside it) is never touched by it either way.
    clearTimeout(this._searchDebounceTimer)
    this._searchDebounceTimer = setTimeout(() => {
      // Bail if the window has since closed (element detached) so a
      // trailing debounced render doesn't fire against a dead app.
      if (!this.element?.isConnected) return
      if (this._autoSelectExactMatch()) {
        this.render({ parts: ['main', 'console'] })
      }
    }, 200)
  }

  // If the search box's value exactly matches one visible item's full
  // name, jump straight to selecting that item. Returns true if the
  // selection actually changed (so the caller knows whether a render is
  // even needed).
  _autoSelectExactMatch() {
    if (!this.searchQuery) return false
    for (const branch of Object.values(this.craftingTree)) {
      const match = branch.items.find((item) => item.name.toLowerCase() === this.searchQuery)
      if (match) {
        if (this.selectedCraftable?.uuid === match.uuid) return false
        this._applySelectedCraftable(match)
        return true
      }
    }
    return false
  }

  static toggleOnlyCraftables() {
    this.onlyCraftables = !this.onlyCraftables
    this.render()
  }

  static closeBench() {
    this.close()
  }

  static prevBranch() {
    const keys = Object.keys(this.craftingTree)
    if (!keys.length) return
    const currentIndex = keys.indexOf(this.openBranches[0])
    const prevIndex = currentIndex <= 0 ? keys.length - 1 : currentIndex - 1
    this.openBranches = [keys[prevIndex]]
    this.render()
  }

  static nextBranch() {
    const keys = Object.keys(this.craftingTree)
    if (!keys.length) return
    const currentIndex = keys.indexOf(this.openBranches[0])
    const nextIndex = currentIndex === -1 || currentIndex >= keys.length - 1 ? 0 : currentIndex + 1
    this.openBranches = [keys[nextIndex]]
    this.render()
  }

  _missingMaterialsWarning() {
    ui.notifications.warn('You do not have the required materials')
  }
}
