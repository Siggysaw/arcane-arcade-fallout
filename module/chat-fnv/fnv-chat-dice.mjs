// Animates grayscale dice sprites in roll messages; green on pass, red on fail.

// Sprite paths must be absolute, derived from this file's URL, to survive a route prefix.
export const DICE_DIR = new URL('../../assets/dice/', import.meta.url).pathname

// sheets: [file, first face, last face]; cols is the wobble frame count per row.
const SHEETS = {
  4: { strip: 'd4.png', cols: 7, sheets: [['d4_numbers.png', 1, 4]] },
  6: { strip: 'd6.png', cols: 7, sheets: [['d6_numbers.png', 1, 6]] },
  8: { strip: 'd8.png', cols: 6, sheets: [['d8_numbers.png', 1, 8]] },
  10: { strip: 'd10.png', cols: 6, sheets: [['d10_numbers.png', 0, 9]] },
  12: {
    strip: 'd12.png',
    cols: 6,
    sheets: [
      ['d12_numbers.png', 1, 6],
      ['d12_numbers2.png', 7, 12],
    ],
  },
  20: {
    strip: 'd20.png',
    cols: 7,
    sheets: [
      ['d20_numbers.png', 1, 5],
      ['d20_numbers2.png', 6, 10],
      ['d20_numbers3.png', 11, 15],
      ['d20_numbers4.png', 16, 20],
    ],
  },
}

const ROLL_DELAY_MS = 500 // at-rest beat before the tumble starts (matches the CSS animation-delay)
const ROLL_MS = 480 // rolling phase before the first die lands
const LAND_STAGGER_MS = 90 // extra tumble per additional die

// Classifies a roll's pass/fail tint; attack rolls use their stored hit flag directly.
function classifyOutcome(message) {
  if (message.flags?.falloutzero?.type === 'attack') {
    const hit = message.flags.falloutzero.hit
    if (hit === true) return 'pass'
    if (hit === false) return 'fail'
    return null // no target selected - nothing to compare against, stays neutral/green
  }
  if (message.flags?.falloutzero?.type) return null
  if (message.flags?.core?.initiativeRoll) return null
  const flavor = (message.flavor ?? '').replace(/<[^>]*>/g, ' ')
  const total = message.rolls?.[0]?.total
  if (typeof total !== 'number') return null
  let m
  // Death save: "Success! X rolled equal to or greater than 10" (DC always 10)
  if (/^(?:Critical )?(?:Success|Failure)!/.test(flavor)) {
    return total >= 10 ? 'pass' : 'fail'
  }
  // rollSave: "Success, X rolled equal to or greater than 14" / "Fail, X rolled lower than 14"
  if ((m = flavor.match(/^(?:Success|Fail), .*? than (\d+)/))) {
    return total >= Number(m[1]) ? 'pass' : 'fail'
  }
  // Condition check result: "X rolls a END Check, DC 12 for ..." (pass is strictly greater)
  if ((m = flavor.match(/, DC (\d+) for /))) {
    return total > Number(m[1]) ? 'pass' : 'fail'
  }
  // Crafting attempt: flavor begins with the outcome word; a karma reroll can tint stale here.
  if (flavor.includes('Crafting attempt')) {
    if (/^\s*(?:critical )?success/i.test(flavor)) return 'pass'
    if (/^\s*(?:critical )?fail/i.test(flavor)) return 'fail'
  }
  return null
}

// Picks the face a die counts as, honoring a min/max-clamp's rerolled marker over the raw face.
function countedFace(r, faces) {
  if (r.rerolled !== true || r.success !== undefined) return r.result
  if (typeof r.count !== 'number' || r.count < 1 || r.count > faces) return r.result
  return r.count
}

// One entry per rendered die: which strip/sheet, face row, and whether it was dropped by kh/kl.
export function diceOfRoll(roll) {
  const out = []
  for (const term of roll.dice ?? []) {
    for (const r of term.results ?? []) {
      const discarded = r.discarded === true || r.active === false
      const face = countedFace(r, term.faces)
      if (term.faces === 100) {
        const v = face
        out.push({
          strip: 'd10.png',
          sheet: 'd10_numbers2.png',
          row: Math.floor(v / 10) % 10,
          cols: 6,
          discarded,
        })
        out.push({ strip: 'd10.png', sheet: 'd10_numbers.png', row: v % 10, cols: 6, discarded })
        continue
      }
      const cfg = SHEETS[term.faces]
      if (!cfg) continue
      const v = term.faces === 10 ? face % 10 : face
      const entry = cfg.sheets.find(([, lo, hi]) => v >= lo && v <= hi)
      if (!entry) continue
      out.push({ strip: cfg.strip, sheet: entry[0], row: v - entry[1], cols: cfg.cols, discarded })
    }
  }
  return out
}

export function injectDiceSprites(message, html, fresh) {
  if (!message.rolls?.length) return
  // Never land a sprite on a hidden face for whispered/blind rolls.
  if (!message.isContentVisible) return
  const results = html.querySelectorAll('.message-content .dice-roll .dice-result')
  if (!results.length) return
  const tint = classifyOutcome(message) === 'fail' ? 'av-fail' : 'av-pass'

  message.rolls.forEach((roll, i) => {
    const target = results[i]
    if (!target) return
    const dice = diceOfRoll(roll)
    if (!dice.length) return

    const row = document.createElement('div')
    row.className = 'av-dice-sprites'
    dice.forEach((d, j) => {
      const die = document.createElement('div')
      die.className = `av-die av-cols-${d.cols}`
      die.style.setProperty('--av-strip', `url("${DICE_DIR}${d.strip}")`)
      die.style.setProperty('--av-sheet', `url("${DICE_DIR}${d.sheet}")`)
      die.style.setProperty('--av-rowy', `${d.row * -48}px`)
      const landed = ['av-landed', d.discarded ? 'av-discarded' : tint]
      if (fresh) {
        die.classList.add('av-rolling')
        setTimeout(
          () => {
            die.classList.remove('av-rolling')
            die.classList.add(...landed)
          },
          ROLL_DELAY_MS + ROLL_MS + j * LAND_STAGGER_MS,
        )
      } else {
        die.classList.add(...landed, 'av-static')
      }
      row.appendChild(die)
    })
    // Sits between the formula and the total, reading like the terminal's output line.
    target.insertBefore(row, target.querySelector('.dice-total'))
  })
}

const FRESH_MS = 2000

/** Call from a setup hook; ChatDiceSprites itself is registered at init. */
export function registerChatDice(systemId) {
  // Runs before any reveal walk so the sprite row wipes in with its .dice-roll.
  Hooks.on('renderChatMessageHTML', (message, html) => {
    let on
    try {
      on = game.settings.get(systemId, 'ChatDiceSprites')
    } catch {
      on = false
    }
    if (!on) return
    injectDiceSprites(message, html, Date.now() - message.timestamp <= FRESH_MS)
  })
}
