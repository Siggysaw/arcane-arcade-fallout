/* ---- Chat dice sprites ---------------------------------------------------
   Kneeshaw grayscale dice sheets rendered into roll messages: each die
   tumbles gray on its 4-frame rolling strip, then lands on the rolled face
   from the matching number sheet (rows = faces, columns = a wobble that
   settles on the last column). Landing tint: green on pass, red on fail,
   green when the message carries no discernible DC. Fresh messages animate
   once; history re-renders show the landed frame immediately.

   Ported from the AAFO V.A.T.S. module. Styling is css/fnv-chat-dice.css. */

/* The sprite paths must be ABSOLUTE. They are handed to the browser as
   `--av-strip: url(...)` via element.style.setProperty, so the base for
   resolution is the DOCUMENT, not the stylesheet — a bare "systems/..."
   string works at /game but 404s the moment Foundry is served under a route
   prefix, and a "../assets/..." string is meaningless here.

   import.meta.url is already absolute AND already carries the route prefix,
   so deriving from it is strictly better than foundry.utils.getRoute() with
   a hard-coded system id. Note the TWO levels up: this file sits in
   module/chat-fnv/, the sheets in assets/dice/. */
export const DICE_DIR = new URL('../../assets/dice/', import.meta.url).pathname

// sheets: [file, first face, last face]. cols is the wobble frame count per
// row (48px cells). d10 faces are printed 0-9, so a rolled 10 maps to row 0.
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

/* Pass/fail tinting. A null verdict means "no DC discernible", which the
   caller renders as the neutral green — that is the case on most rolls, and
   it is the intended default, not a failure.

   The patterns below are this system's flavor-text formats. Where the DC is
   recoverable, total-vs-DC is recomputed here rather than trusting the
   flavor words: FalloutZeroChatMessage#_reRoll copies the original flavor
   verbatim, so its Success/Failure text can be stale while the dice are new. */
function classifyOutcome(message) {
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
  // Crafting attempt: flavor begins with the outcome word; the DC never
  // reaches the message, so the word is all we have — a karma reroll keeps
  // the original word over new dice and can tint stale here.
  if (flavor.includes('Crafting attempt')) {
    if (/^\s*(?:critical )?success/i.test(flavor)) return 'pass'
    if (/^\s*(?:critical )?fail/i.test(flavor)) return 'fail'
  }
  return null
}

/* The face a die is counted as. A min/max modifier (the system rewrites
   damage as max(N, …) for targeted attacks and minimums) clamps by writing
   r.count and leaving r.result on the face the die physically showed;
   DiceTerm#total sums r.count, so landing on the raw face would contradict
   the printed total. Success counting also writes r.count, but as a 0/1
   tally — demand the clamp's rerolled marker, no success verdict, and a real
   face value. */
function countedFace(r, faces) {
  if (r.rerolled !== true || r.success !== undefined) return r.result
  if (typeof r.count !== 'number' || r.count < 1 || r.count > faces) return r.result
  return r.count
}

// One entry per rendered die: which strip/sheet, the face row, and whether
// the die was dropped by a kh/kl modifier. A d100 becomes two d10 sprites
// (percentile tens sheet + units sheet).
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
  // Whispered/blind rolls render as ???/? for non-recipients, but the roll
  // data still syncs to every client — never land a sprite on a hidden face.
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
    // Sits between the formula and the total, reading like the terminal's
    // output line: formula, the dice themselves, then the result.
    target.insertBefore(row, target.querySelector('.dice-total'))
  })
}

const FRESH_MS = 2000

/** Call from an `init` hook. */
export function registerChatDice(systemId) {
  game.settings.register(systemId, 'ChatDiceSprites', {
    name: 'FNV Chat Dice Sprites',
    hint: 'Roll messages show the dice as animated Fallout sprites: they tumble, land on the rolled face, and tint green or red against the DC when the roll has one.',
    scope: 'client',
    config: true,
    type: Boolean,
    default: true,
  })

  // Runs before any reveal walk so the sprite row wipes in with its
  // .dice-roll rather than appearing after it. Stale renders land instantly.
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
