// NV-style roulette pause overlay; toggle replaces or restores the system's banner live.

import { FALLOUTZERO } from '../config.mjs'

const PKG_ID = FALLOUTZERO.systemId
// Absolute asset path derived from this file's URL, rename-proof.
const ASSET_PATH = new URL('../../assets/nv-pause/', import.meta.url).pathname
// Exported so registerSettings.mjs can reuse it as NVPauseColorCustom's initial value.
export const DEFAULT_COLOR = '#ffb641'

const COLOR_PRESETS = [
  { label: 'Amber', value: '#ffb641' },
  { label: 'Green', value: '#1bff80' },
]

// Vertical placement percentage from the bottom; the wheel must clear a wrapped hotbar.
const BOTTOM_PERCENT_ONE_ROW = 20
const BOTTOM_PERCENT_TWO_ROWS = 30

let overlayElement = null
let resizeHandler = null
let pauseEl = null // core's #pause element, captured when it renders

const setting = (key) => {
  try {
    return game.settings.get(PKG_ID, key)
  } catch {
    return undefined
  }
}

/* ---- Geometry ------------------------------------------------------------ */

function calculateScale() {
  const t = Math.min(
    (window.innerWidth - 1024) / (3840 - 1024),
    (window.innerHeight - 700) / (2160 - 700),
  )
  return Math.min(1.0, Math.max(0.5, 0.5 + 0.5 * t))
}

function getHotbarRows() {
  const hotbar = ui.hotbar?.element
  if (!hotbar) return 1
  const slots = hotbar.querySelectorAll('.slot')
  if (!slots.length) return 1
  const rowPositions = new Set()
  for (const slot of slots) rowPositions.add(slot.getBoundingClientRect().top)
  return rowPositions.size
}

const getBottomPercent = () =>
  getHotbarRows() >= 2 ? BOTTOM_PERCENT_TWO_ROWS : BOTTOM_PERCENT_ONE_ROW

/* ---- Colour -------------------------------------------------------------- */

function getColor() {
  if (setting('NVPauseColorMode') === 'player') {
    const playerColor = game.user?.color
    if (playerColor) return String(playerColor)
  }
  // Key must match the registration below exactly, or it silently falls back to amber.
  const color = setting('NVPauseColorCustom')
  return color ? String(color) : DEFAULT_COLOR
}

function hexToRGB(hex) {
  const n = parseInt(String(hex).replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/* ---- The overlay --------------------------------------------------------- */

function removeOverlay() {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
  if (overlayElement) {
    overlayElement.remove()
    overlayElement = null
  }
}

function buildOverlay() {
  removeOverlay()

  const customText = String(setting('NVPauseText') ?? 'Game Paused')
  const color = getColor()
  const [cr, cg, cb] = hexToRGB(color)
  const [mr, mg, mb] = [cr / 255, cg / 255, cb / 255]

  overlayElement = document.createElement('div')
  overlayElement.id = 'aafo-nv-pause'
  overlayElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 99;
    --fnv-scale: ${calculateScale()};
    --fnv-bottom: ${getBottomPercent()}%;
    --fnv-color: ${color};
  `

  // The art is greyscale; the feColorMatrix tints it without a recoloured copy of each png.
  const sprite = (file, css) => `
      <div class="fnv-img" style="
        position: absolute;
        background-image: url('${ASSET_PATH}${file}');
        background-repeat: no-repeat;
        background-position: center;
        ${css}
      "></div>`

  overlayElement.innerHTML = `
    <svg width="0" height="0" style="position: absolute;">
      <filter id="aafo-nv-pause-tint" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" values="
          ${mr} 0 0 0 0
          0 ${mg} 0 0 0
          0 0 ${mb} 0 0
          0 0 0 1 0" />
      </filter>
    </svg>

    <style>
      @keyframes aafo-nv-spin-wheel { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes aafo-nv-spin-ball  { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
      #aafo-nv-pause .fnv-img { filter: url(#aafo-nv-pause-tint); }
    </style>

    <div style="
      position: absolute;
      bottom: var(--fnv-bottom);
      left: 50%;
      width: 0;
      height: 0;
      transform: scale(var(--fnv-scale));
    ">
      ${sprite('roulette_bars.png', `
        width: 256px; height: 256px; margin-top: -128px; margin-left: -348px;
        background-size: 256px 256px; transform: scaleX(-1);`)}
      ${sprite('roulette_bars.png', `
        width: 256px; height: 256px; margin-top: -128px; margin-left: 92px;
        background-size: 256px 256px;`)}
      ${sprite('roulette_wheel.png', `
        width: 256px; height: 256px; margin-top: -128px; margin-left: -128px;
        background-size: 256px 256px; animation: aafo-nv-spin-wheel 3s linear infinite;`)}
      ${sprite('roulette_ball.png', `
        width: 16px; height: 128px; margin-top: -64px; margin-left: 92px;
        background-size: 16px 128px; transform-origin: -92px 64px;
        animation: aafo-nv-spin-ball 3s linear infinite;`)}

      <div style="
        position: absolute;
        top: 150px;
        transform: translateX(-50%);
        color: var(--fnv-color);
        font-family: 'Monofonto', monospace;
        font-size: 32px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        text-align: center;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        white-space: nowrap;
      ">${foundry.utils.escapeHTML?.(customText) ?? customText}</div>
    </div>
  `

  document.body.appendChild(overlayElement)

  // Resizing changes both the scale and whether the hotbar wraps.
  resizeHandler = () => {
    if (!overlayElement) return
    overlayElement.style.setProperty('--fnv-scale', calculateScale())
    overlayElement.style.setProperty('--fnv-bottom', `${getBottomPercent()}%`)
  }
  window.addEventListener('resize', resizeHandler)
}

/* ---- Switching between the two banners ----------------------------------- */

function bannerElement() {
  return pauseEl ?? document.getElementById('pause')
}

/** Restores the terminal plate immediately when the setting is turned off. */
function restoreBanner() {
  const el = bannerElement()
  if (el) el.style.display = ''
}

// Wired up by registerSettings.mjs as the onChange handler for the four NVPause* settings.
export function refresh() {
  const el = bannerElement()
  if (!setting('NVPause')) {
    removeOverlay()
    restoreBanner()
    return
  }
  if (el) el.style.display = 'none'
  if (game.paused) buildOverlay()
  else removeOverlay()
}

// v13+ pause banner is ApplicationV2 GamePause; captures its element to restore later.
Hooks.on('renderGamePause', (app, html) => {
  pauseEl = html
  refresh()
})

Hooks.on('closeGamePause', () => {
  removeOverlay()
  restoreBanner()
})

Hooks.on('renderHotbar', () => {
  if (overlayElement && game.paused) {
    overlayElement.style.setProperty('--fnv-bottom', `${getBottomPercent()}%`)
  }
})

// Colour and text are edited in the settings window; rebuild once it closes.
Hooks.on('closeSettingsConfig', () => {
  if (game.paused) refresh()
})

Hooks.on('updateUser', (user, changes) => {
  if (user.id !== game.user?.id) return
  if (!('color' in changes)) return
  if (game.paused && setting('NVPauseColorMode') === 'player') refresh()
})

// Colour presets; hides colour fields when Match Player Colour is selected.
Hooks.on('renderSettingsConfig', (app, html) => {
  const root = html instanceof HTMLElement ? html : html?.[0]
  if (!root) return
  const enabledField = root.querySelector(`[name="${PKG_ID}.NVPause"]`)
  const modeField = root.querySelector(`[name="${PKG_ID}.NVPauseColorMode"]`)
  const colorField = root.querySelector(`[name="${PKG_ID}.NVPauseColorCustom"]`)
  const textField = root.querySelector(`[name="${PKG_ID}.NVPauseText"]`)
  if (!modeField || !colorField) return

  const colorGroup = colorField.closest('.form-group')
  const modeGroup = modeField.closest('.form-group')
  const textGroup = textField?.closest('.form-group')
  if (!colorGroup) return

  let presetRow = colorGroup.parentElement.querySelector('.aafo-nv-presets')
  if (!presetRow) {
    presetRow = document.createElement('div')
    presetRow.className = 'form-group aafo-nv-presets'
    const presetLabel = document.createElement('label')
    presetLabel.textContent = 'Colour Presets'
    presetRow.appendChild(presetLabel)

    const presetFields = document.createElement('div')
    presetFields.className = 'form-fields'
    for (const preset of COLOR_PRESETS) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.textContent = preset.label
      btn.style.borderLeft = `12px solid ${preset.value}`
      btn.addEventListener('click', () => {
        colorField.value = preset.value
        colorField.dispatchEvent(new Event('input', { bubbles: true }))
        colorField.dispatchEvent(new Event('change', { bubbles: true }))
      })
      presetFields.appendChild(btn)
    }
    presetRow.appendChild(presetFields)
    colorGroup.after(presetRow)
  }

  const syncVisibility = () => {
    const on = enabledField ? enabledField.checked : true
    const custom = modeField.value === 'custom'
    for (const el of [modeGroup, textGroup]) if (el) el.style.display = on ? '' : 'none'
    for (const el of [colorGroup, presetRow]) el.style.display = on && custom ? '' : 'none'
  }
  syncVisibility()
  modeField.addEventListener('change', syncVisibility)
  enabledField?.addEventListener('change', syncVisibility)
})
