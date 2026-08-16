/* ---- Perk clip art -------------------------------------------------------
   The minimum of the AAFO V.A.T.S. module's chat-perks.mjs that the group
   roll needs: build an element for one animated perk clip. The module's text
   enricher (`@PerkAnim[...]`), its `/perk` preview command and its
   FilePicker-backed listing are all deliberately left behind — they are a
   separate chat feature, not part of this one.

   Only the clips reachable from group-roll.mjs's DEFAULT_PERKS map ship with
   the system: 21 (one per skill and SPECIAL) plus `perkclipdefault`. The
   module carries all 129, but nothing here can reach the rest — the request
   dialog has no perk picker. The one way to name another clip is the
   world-scoped `groupRollPerkMap` override, so a missing file has to fail
   quietly rather than leave a broken-image glyph across the header: hence the
   error handler below.

   The class names are the module's, double dash and all (`av-perk--lg`, not
   `av-perk-lg`) — css/group-roll.css matches on `.av-perk-anim`, and the
   modifier classes have to keep their shape for the two base rules carried
   over there to line up.

   PERK_DIR is derived from this file's own URL rather than written out, so it
   is absolute (required — it is consumed as an <img> src from a document that
   may be served under a route prefix) and survives the folder being renamed.
   Two levels up: this file sits in module/group-roll/. */

const PERK_DIR = new URL('../../assets/perk-clips/', import.meta.url).pathname
const SIZES = ['sm', 'md', 'lg']
const ALIGNS = ['left', 'center', 'right', 'inline']

export function perkClipSrc(name) {
  const file = String(name ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  return `${PERK_DIR}${file}.webp`
}

/**
 * @param {string} name              Clip name, e.g. "gunslinger".
 * @param {object} [opts]
 * @param {"sm"|"md"|"lg"} [opts.size]
 * @param {"left"|"center"|"right"|"inline"} [opts.align]
 * @returns {HTMLElement} A wrapper span holding the <img>.
 */
export function perkAnimElement(name, { size = 'md', align = 'center' } = {}) {
  if (!SIZES.includes(size)) size = 'md'
  if (!ALIGNS.includes(align)) align = 'center'

  const wrap = document.createElement('span')
  wrap.className = `av-perk-anim av-perk--${size} av-perk--${align}`

  const img = document.createElement('img')
  img.src = perkClipSrc(name)
  img.alt = name
  img.loading = 'lazy' // the group roll overrides this to eager for its centrepiece
  // Decorative backdrop art. A clip named by a groupRollPerkMap override that
  // was never shipped must not paint a broken-image icon across the header.
  img.addEventListener('error', () => wrap.remove(), { once: true })
  wrap.appendChild(img)
  return wrap
}
