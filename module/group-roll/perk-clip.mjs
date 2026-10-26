// Minimal perk-clip renderer ported from AAFO V.A.T.S.; only ships clips group-roll.mjs references.

const PERK_DIR = new URL('../../assets/perk-clips/', import.meta.url).pathname
const SIZES = ['sm', 'md', 'lg']
const ALIGNS = ['left', 'center', 'right', 'inline']

export function perkClipSrc(name) {
  const file = String(name ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  return `${PERK_DIR}${file}.webp`
}

/** Builds a wrapper span with the perk clip image for the given perk name. */
export function perkAnimElement(name, { size = 'md', align = 'center' } = {}) {
  if (!SIZES.includes(size)) size = 'md'
  if (!ALIGNS.includes(align)) align = 'center'

  const wrap = document.createElement('span')
  wrap.className = `av-perk-anim av-perk--${size} av-perk--${align}`

  const img = document.createElement('img')
  img.src = perkClipSrc(name)
  img.alt = name
  img.loading = 'lazy' // the group roll overrides this to eager for its centrepiece
  // An unshipped clip name must not paint a broken-image icon across the header.
  img.addEventListener('error', () => wrap.remove(), { once: true })
  wrap.appendChild(img)
  return wrap
}
