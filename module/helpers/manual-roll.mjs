/**
 * Manual Rolls - roll real dice at the table and type in what they show.
 *
 * One per-account setting ("Manual Rolls", scope: 'user', off by default),
 * the same for players and GMs. When it's on, every roll the user makes -
 * S.P.E.C.I.A.L., skills, attacks (hit and damage), combat sequence, death
 * saves, saves/checks, custom rolls, crafting/repair checks, group rolls,
 * karma-cap rerolls - opens a small box asking for the dice:
 *   - one field per d20 (with advantage/disadvantage: the die you kept);
 *   - one "dice total" field for every other die in the roll (damage dice,
 *     bonus dice such as 1d4). The total is spread across the dice so the
 *     chat card still adds up.
 * The system still adds every bonus/penalty/multiplier and runs all of its
 * automation (crits, hit checks, damage application...). A field left blank
 * ("Leave Blank for Digital Dice Roll") or closing the box rolls digitally,
 * so AP/ammo already spent is never wasted.
 *
 * How the values get in: Foundry rolls each die through DiceTerm#_roll and
 * only falls back to its RNG when that returns undefined, so for the
 * duration of one evaluate() call Die#_roll is wrapped to hand out the
 * entered faces. The Roll then evaluates completely normally - keep-highest
 * /lowest, max()/floor() wrappers, crit multipliers, nested terms - and the
 * chat card / Dice So Nice show the entered faces.
 */

const SYSTEM_ID = 'arcane-arcade-fallout'
export const MANUAL_ROLLS_SETTING = 'ManualRolls'

/** Dice-term regex: 2d20kh, 1d8, 3d6x, d4 ... (number, faces, modifiers). */
const DIE_REGEX = /(\d*)d(\d+)((?:[a-z]+\d*)*)/gi
/** Modifiers that keep/drop dice - a single entered value is the kept die. */
const KEEP_DROP_REGEX = /^(kh|kl|k|dh|dl|d)\d*/i

/* -------------------------------------------- */
/*  Setting                                     */
/* -------------------------------------------- */

export function registerManualRollSettings() {
  game.settings.register(SYSTEM_ID, MANUAL_ROLLS_SETTING, {
    name: 'Manual Rolls',
    hint: 'Roll your own physical dice. Whenever you roll - S.P.E.C.I.A.L., skills, attacks and their damage, combat sequence, saves, crafting and more - a box asks what your dice show; bonuses and penalties are still added for you. Leave it empty to have it rolled automatically. Only affects your account.',
    scope: 'user',
    config: true,
    type: Boolean,
    default: false,
    requiresReload: false,
  })
}

/** Whether the current user has Manual Rolls turned on. */
export function manualRollsEnabled() {
  try {
    return !!game.settings.get(SYSTEM_ID, MANUAL_ROLLS_SETTING)
  } catch (err) {
    return false // not registered yet (very early rolls)
  }
}

/* -------------------------------------------- */
/*  Formula analysis                            */
/* -------------------------------------------- */

/** Splits a formula into its dice terms, in evaluation (left-to-right) order. */
function getDiceSlots(formula) {
  const slots = []
  for (const match of String(formula ?? '').matchAll(DIE_REGEX)) {
    const count = match[1] === '' ? 1 : Number(match[1])
    const faces = Number(match[2])
    if (!Number.isFinite(count) || count < 1 || !Number.isFinite(faces) || faces < 2) continue
    slots.push({ label: match[0], count, faces, modifiers: match[3] ?? '' })
  }
  return slots
}

/**
 * Groups a roll's dice into the fields the user fills in: one per d20 term,
 * then one combined "dice total" for all other dice.
 */
function analyzeRoll(roll) {
  const slots = getDiceSlots(roll.formula)
  const groups = []
  const other = []
  slots.forEach((slot, i) => {
    if (slot.faces !== 20) {
      other.push(i)
      return
    }
    const keep = KEEP_DROP_REGEX.test(slot.modifiers)
    if (slot.count === 1 || keep) {
      groups.push({
        slots: [i],
        mode: keep ? 'keep' : 'single',
        min: 1,
        max: 20,
        label: keep ? `d20 - the die you kept (${slot.label})` : 'd20',
      })
    } else {
      groups.push({ slots: [i], mode: 'total', min: slot.count, max: slot.count * 20, label: `${slot.label} total` })
    }
  })
  if (other.length) {
    const min = other.reduce((sum, i) => sum + slots[i].count, 0)
    const max = other.reduce((sum, i) => sum + slots[i].count * slots[i].faces, 0)
    const dice = other.map((i) => slots[i].label).join(' + ')
    groups.push({ slots: other, mode: 'total', min, max, label: `Dice total (${dice})` })
  }
  return { slots, groups }
}

/**
 * Turns one entered number into faces for the group's dice.
 * @returns {{values?: Map<number, number[]>, error?: string}} slot index -> faces
 */
function resolveGroup(value, group, slots) {
  if (!Number.isInteger(value)) return { error: `${group.label}: enter a whole number.` }
  if (value < group.min || value > group.max) {
    return { error: `${group.label}: must be between ${group.min} and ${group.max}.` }
  }
  const values = new Map()
  if (group.mode === 'single' || group.mode === 'keep') {
    // For keep/drop every die shows the kept value, so kh/kl lands on it.
    const slotIndex = group.slots[0]
    values.set(slotIndex, Array(slots[slotIndex].count).fill(value))
    return { values }
  }
  // A total: start every die at 1 and hand out the rest round-robin, so the
  // faces stay as even as possible and every die stays within its size.
  const dice = group.slots.flatMap((slotIndex) =>
    Array.from({ length: slots[slotIndex].count }, () => ({ slotIndex, faces: slots[slotIndex].faces, value: 1 })),
  )
  let remaining = value - dice.length
  while (remaining > 0) {
    let progressed = false
    for (const die of dice) {
      if (remaining <= 0) break
      if (die.value < die.faces) {
        die.value++
        remaining--
        progressed = true
      }
    }
    if (!progressed) break
  }
  for (const die of dice) {
    if (!values.has(die.slotIndex)) values.set(die.slotIndex, [])
    values.get(die.slotIndex).push(die.value)
  }
  return { values }
}

/* -------------------------------------------- */
/*  Prompt                                      */
/* -------------------------------------------- */

function escapeHtml(text) {
  return foundry.utils.escapeHTML?.(String(text)) ?? String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

/**
 * Shows the box for every field of every roll.
 * @returns {Promise<Map<string, number>|null>} "rollIndex:groupIndex" -> value; null = all digital.
 */
async function promptForRolls(items, { title, flavor, initial = {}, errors = [] }) {
  const DialogV2 = foundry.applications.api.DialogV2
  let first = true
  const sections = items
    .map(({ rollIndex, label, formula, groups }) => {
      const fields = groups
        .map((group, groupIndex) => {
          const key = `${rollIndex}:${groupIndex}`
          const html = `
            <div class="form-group">
              <label for="aaf-manual-${rollIndex}-${groupIndex}">${escapeHtml(group.label)}
                <span class="aaf-manual-roll-range">${group.min} - ${group.max}</span></label>
              <div class="form-fields">
                <input type="number" id="aaf-manual-${rollIndex}-${groupIndex}" name="r${rollIndex}g${groupIndex}"
                       min="${group.min}" max="${group.max}" step="1" placeholder="What Did You Roll?"
                       value="${escapeHtml(initial[key] ?? '')}" ${first ? 'autofocus' : ''} />
              </div>
              <p class="hint aaf-manual-roll-blank">Leave Blank for Digital Dice Roll</p>
            </div>`
          first = false
          return html
        })
        .join('')
      return `
        <fieldset class="aaf-manual-roll-section">
          ${label ? `<legend>${escapeHtml(label)}</legend>` : ''}
          <p class="aaf-manual-roll-formula"><i class="fa-solid fa-dice"></i> ${escapeHtml(formula)}</p>
          ${fields}
        </fieldset>`
    })
    .join('')
  const content = `
    <div class="aaf-manual-roll-prompt">
      ${flavor ? `<p class="aaf-manual-roll-flavor">${escapeHtml(flavor)}</p>` : ''}
      <p class="hint">Roll your dice and enter what they show - bonuses and penalties are added for you.</p>
      ${errors.length ? `<p class="aaf-manual-roll-error">${errors.map(escapeHtml).join('<br>')}</p>` : ''}
      ${sections}
    </div>`

  const result = await DialogV2.wait({
    window: { title: title || 'Manual Roll', icon: 'fa-solid fa-hand' },
    classes: ['falloutzero', 'aaf-manual-roll-dialog'],
    position: { width: 380 },
    content,
    rejectClose: false,
    buttons: [
      {
        action: 'submit',
        label: 'Submit',
        icon: 'fa-solid fa-check',
        default: true,
        callback: (event, button) => {
          const entries = {}
          for (const { rollIndex, groups } of items) {
            groups.forEach((_, groupIndex) => {
              entries[`${rollIndex}:${groupIndex}`] = button.form.elements[`r${rollIndex}g${groupIndex}`]?.value ?? ''
            })
          }
          return { entries }
        },
      },
    ],
  })
  if (!result) return null

  const values = new Map()
  const newErrors = []
  for (const { rollIndex, groups } of items) {
    groups.forEach((group, groupIndex) => {
      const key = `${rollIndex}:${groupIndex}`
      const text = String(result.entries[key] ?? '').trim()
      if (!text) return // blank = roll this part for me
      const value = Number(text)
      if (!Number.isInteger(value) || value < group.min || value > group.max) {
        newErrors.push(`${group.label}: must be a whole number from ${group.min} to ${group.max}.`)
      } else values.set(key, value)
    })
  }
  if (newErrors.length) {
    return promptForRolls(items, { title, flavor, initial: result.entries, errors: newErrors })
  }
  return values
}

/* -------------------------------------------- */
/*  Evaluation                                  */
/* -------------------------------------------- */

/** Prototype that actually owns `_roll` for standard dice. */
function rollPrototype() {
  const Die = foundry.dice?.terms?.Die ?? globalThis.Die
  let proto = Die?.prototype
  while (proto && !Object.hasOwn(proto, '_roll')) proto = Object.getPrototypeOf(proto)
  return proto ? { target: Die.prototype, original: proto._roll } : null
}

/** Calls the Roll's own evaluate(), skipping any instance-level wrapper. */
function baseEvaluate(roll, options = {}) {
  return Object.getPrototypeOf(roll).evaluate.call(roll, options)
}

/** Overwrites already-rolled results - only used if the _roll hook didn't take. */
async function forceResults(roll, queues) {
  for (const die of roll.dice) {
    const queue = queues.get(die.faces)
    if (!queue?.length) continue
    for (const result of die.results) {
      if (!queue.length) break
      const value = queue.shift()
      if (value === undefined) continue // left to the digital roll
      result.result = value
      result.active = true
      delete result.discarded
    }
    for (const modifier of die.modifiers ?? []) {
      const match = modifier.match(KEEP_DROP_REGEX)
      const method = match && die.constructor.MODIFIERS?.[match[1].toLowerCase()]
      if (method && typeof die[method] === 'function') await die[method](modifier)
    }
  }
  try {
    roll._total = roll._evaluateTotal()
  } catch (err) {
    console.warn('Arcane Arcade Fallout | Could not recompute manual roll total', err)
  }
}

/** Evaluates one roll with the given per-slot faces (slot index -> faces). */
async function evaluateWithFaces(roll, slots, slotValues, evaluateOptions) {
  if (!slotValues.size) return baseEvaluate(roll, evaluateOptions)

  // Queue faces per die size, in formula order; dice left digital hold an
  // `undefined` place so later dice of the same size line up correctly.
  const queues = new Map()
  slots.forEach((slot, i) => {
    const queue = queues.get(slot.faces) ?? []
    queue.push(...(slotValues.get(i) ?? Array(slot.count).fill(undefined)))
    queues.set(slot.faces, queue)
  })

  roll.options.aafManual = true
  const hook = rollPrototype()
  const hadOwn = hook && Object.hasOwn(hook.target, '_roll')
  const ownValue = hadOwn ? hook.target._roll : undefined
  if (hook) {
    const original = hook.original
    hook.target._roll = async function (rollOptions = {}) {
      const queue = queues.get(this.faces)
      const value = queue?.length ? queue.shift() : undefined
      if (value !== undefined) return value
      return original.call(this, rollOptions)
    }
  }
  try {
    await baseEvaluate(roll, evaluateOptions)
  } finally {
    if (hook) {
      if (hadOwn) hook.target._roll = ownValue
      else delete hook.target._roll
    }
  }

  // Safety net: if this Foundry build didn't route dice through _roll,
  // write the entered faces onto the rolled dice directly.
  if ([...queues.values()].some((q) => q.some((v) => v !== undefined))) {
    console.warn('Arcane Arcade Fallout | Manual roll values were not consumed by evaluation; applying them directly.')
    await forceResults(roll, queues)
  }
  return roll
}

/**
 * Evaluates several rolls behind a single Manual Rolls box (e.g. one damage
 * roll per damage type). Without the setting this is a plain evaluate().
 *
 * @param {Roll[]} rolls   Unevaluated rolls.
 * @param {object} [options]
 * @param {Actor} [options.actor]
 * @param {string} [options.title]
 * @param {string} [options.flavor]
 * @param {string[]} [options.labels]   Section heading per roll.
 * @param {object} [options.evaluateOptions]
 * @returns {Promise<Roll[]>}
 */
export async function evaluateManualRolls(rolls, options = {}) {
  const { actor = null, title, flavor, labels = [], evaluateOptions = {} } = options
  const pending = rolls.filter((roll) => !roll._evaluated)
  if (!manualRollsEnabled()) {
    for (const roll of pending) await baseEvaluate(roll, evaluateOptions)
    return rolls
  }

  const analyses = rolls.map((roll) => (roll._evaluated ? null : analyzeRoll(roll)))
  const items = []
  analyses.forEach((analysis, rollIndex) => {
    if (!analysis?.groups.length) return
    items.push({
      rollIndex,
      label: labels[rollIndex] ?? '',
      formula: rolls[rollIndex].formula,
      groups: analysis.groups,
    })
  })
  if (!items.length) {
    for (const roll of pending) await baseEvaluate(roll, evaluateOptions)
    return rolls
  }

  const entered = await promptForRolls(items, {
    title: title || (actor ? `${actor.name}: Manual Roll` : 'Manual Roll'),
    flavor,
  })

  for (let rollIndex = 0; rollIndex < rolls.length; rollIndex++) {
    const roll = rolls[rollIndex]
    if (roll._evaluated) continue
    const analysis = analyses[rollIndex]
    const slotValues = new Map()
    analysis?.groups.forEach((group, groupIndex) => {
      const value = entered?.get(`${rollIndex}:${groupIndex}`)
      if (value === undefined) return
      const { values } = resolveGroup(value, group, analysis.slots)
      values?.forEach((faces, slotIndex) => slotValues.set(slotIndex, faces))
    })
    await evaluateWithFaces(roll, analysis?.slots ?? [], slotValues, evaluateOptions)
  }
  return rolls
}

/**
 * Evaluates `roll`, asking for physical dice first when the user has Manual
 * Rolls on. Always resolves to the evaluated roll.
 */
export async function evaluateManualRoll(roll, { actor, title, flavor, label, evaluateOptions } = {}) {
  await evaluateManualRolls([roll], { actor, title, flavor, labels: [label], evaluateOptions })
  return roll
}

/**
 * Makes a Roll that something else evaluates later (core initiative) go
 * through Manual Rolls when it's evaluated.
 */
export function wrapRollForManualEntry(roll, { actor, title, flavor, label } = {}) {
  roll.evaluate = (evaluateOptions = {}) => evaluateManualRoll(roll, { actor, title, flavor, label, evaluateOptions })
  return roll
}

/**
 * A modal <dialog> (showModal) sits in the browser's top layer and makes
 * everything else inert, which would leave the Manual Rolls box unclickable
 * behind it. Re-open such a dialog non-modally first (only when needed).
 */
export function releaseModal(element) {
  if (!manualRollsEnabled()) return
  if (!(element instanceof HTMLDialogElement) || !element.open) return
  let isModal = false
  try {
    isModal = element.matches(':modal')
  } catch (err) {
    isModal = true
  }
  if (!isModal) return
  element.close()
  element.show()
}

/* -------------------------------------------- */
/*  Hooks                                       */
/* -------------------------------------------- */

Hooks.once('init', () => {
  // Combat Sequence: core Combat#rollInitiative evaluates the Roll returned
  // by Combatant#getInitiativeRoll, so route that roll through Manual Rolls.
  const BaseCombatant = CONFIG.Combatant.documentClass
  class FalloutZeroCombatant extends BaseCombatant {
    getInitiativeRoll(formula) {
      const roll = super.getInitiativeRoll(formula)
      return wrapRollForManualEntry(roll, {
        actor: this.actor,
        title: `Combat Sequence: ${this.name}`,
        flavor: `${this.name} rolls for Combat Sequence.`,
      })
    }
  }
  CONFIG.Combatant.documentClass = FalloutZeroCombatant
})

// Label chat cards whose dice were entered by hand.
Hooks.on('renderChatMessageHTML', (message, html) => {
  if (!message.rolls?.some((r) => r.options?.aafManual)) return
  const root = html instanceof HTMLElement ? html : html?.[0]
  const target = root?.querySelector('.message-header .message-metadata') ?? root?.querySelector('.message-header')
  if (!target || target.querySelector('.aaf-manual-roll-badge')) return
  const badge = document.createElement('span')
  badge.className = 'aaf-manual-roll-badge'
  badge.dataset.tooltip = 'Physical dice - result entered by hand'
  badge.innerHTML = '<i class="fa-solid fa-hand"></i> Manual'
  target.prepend(badge)
})
