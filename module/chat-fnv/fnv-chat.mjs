/* ---- FNV Chat ------------------------------------------------------------
   The behaviour half of the chat skin, and its single entry point. Ported
   from the AAFO V.A.T.S. module; imported for side effects only, from
   module/falloutzero.mjs.

   css/fnv-chat.css works with NONE of this. Everything here is an upgrade,
   not a prerequisite — delete the import line in falloutzero.mjs and you
   still get the terminal panel, just in uniform amber with no crawl.

   Four jobs the stylesheet cannot do on its own:

   1. Per-entry author colour. The <li> carries no author id, and
      --user-color on the document element is the LOCAL user's, not the
      message author's — there is no CSS-only path from a message to who
      spoke it. So --av-msg is stamped here, on every render: the chat log
      replaces the whole <li> when a message updates and restores only a
      couple of properties, which would otherwise drop the stamp.

   2. A wrapper around core's bare speaker text. Core ships the alias as a
      raw text node inside .message-sender, which under `display: flex`
      becomes an anonymous flex item — and anonymous flex items cannot take
      min-width:0 or text-overflow, so a long name overflows the entry and is
      chopped mid-glyph. Wrapping it in a real element restores ellipsis.
      This system replaces those children in
      FalloutZeroChatMessage#_enrichChatCard, so the branch only fires for
      messages it did not enrich.

   3. The kill switch. The stylesheet is gated NEGATIVELY
      (body:not(.fnv-chat-off)), so the class is only ever added to turn the
      skin OFF. Registered AND applied in `init`, not `ready`: settings are
      readable synchronously the moment they are registered, and waiting
      would paint the skin for several seconds to a user who disabled it.

   4. The message crawl. Every block of a fresh message draws in with a
      staggered left-to-right wipe. Only messages arriving now crawl;
      history re-renders appear instantly.

   The settings namespace is FALLOUTZERO.systemId, imported directly rather
   than read off CONFIG: this file's hooks are registered while falloutzero.mjs
   is still being evaluated, which is before CONFIG.FALLOUTZERO is assigned. */

import { FALLOUTZERO } from '../config.mjs'
import { registerChatDice } from './fnv-chat-dice.mjs'

const ID = FALLOUTZERO.systemId
const AMBER = '#ffb641'
const FRESH_MS = 2000

function setting(key) {
  try {
    return game.settings.get(ID, key)
  } catch {
    return undefined
  }
}

/**
 * One whole-element clip-path wipe per block, staggered down the message.
 * The wipe itself is `@keyframes fnv-wipe` in css/fnv-chat.css; this only
 * assigns the class and each block's share of the stagger. Works on prose,
 * dice cards and buttons alike because it is a paint-time clip — no reflow.
 * @param {Element[]} elements
 * @param {object} [opts]
 * @param {number} [opts.step] ms between blocks
 * @param {number} [opts.cap]  ceiling on the accumulated delay
 * @returns {number} the last delay assigned
 */
function revealBlocks(elements, { step = 45, cap = 900 } = {}) {
  let last = 0
  elements.forEach((el, i) => {
    last = Math.min(i * step, cap)
    el.classList.add('av-reveal')
    el.style.animationDelay = `${last}ms`
  })
  return last
}

/* The panel chrome (plate brackets, composer, controls) follows the viewing
   user; entries follow their author. */
function stampViewer() {
  const css = game.user?.color?.css
  if (css) document.body.style.setProperty('--av-user', css)
}

function onRenderMessage(message, html) {
  // Stamped unconditionally so toggling the skin on mid-session finds the
  // colours already in place.
  html.style.setProperty('--av-msg', message.author?.color?.css ?? AMBER)
  if (message.author?.id) html.dataset.avAuthor = message.author.id

  // Wrap core's bare alias text node. Guarded on "every child is a text
  // node" so the system's own .avatar/.name-stacked markup is left alone.
  const sender = html.querySelector('.message-sender')
  if (
    sender?.childNodes.length &&
    [...sender.childNodes].every((n) => n.nodeType === Node.TEXT_NODE)
  ) {
    const wrap = document.createElement('span')
    wrap.className = 'fnv-name'
    wrap.append(...sender.childNodes)
    sender.append(wrap)
  }

  if (!setting('ChatSkin') || !setting('ChatCrawl')) return
  if (Date.now() - message.timestamp > FRESH_MS) return

  // Flatten one level: the header's own children (so the name — which is
  // the entry's top border — draws first, then the metadata) and the
  // content's blocks, rather than two monolithic wrappers.
  const items = []
  for (const child of html.children) {
    const flatten =
      child.classList?.contains('message-content') || child.classList?.contains('message-header')
    if (flatten && child.children.length) items.push(...child.children)
    else items.push(child)
  }
  revealBlocks(items)
}

Hooks.once('init', () => {
  game.settings.register(ID, 'ChatSkin', {
    name: 'FNV Chat Skin',
    hint: 'Restyle the chat sidebar, composer and roll cards as a Fallout terminal panel. Applies immediately.',
    scope: 'client',
    config: true,
    type: Boolean,
    default: true,
    onChange: (v) => document.body.classList.toggle('fnv-chat-off', !v),
  })

  game.settings.register(ID, 'ChatCrawl', {
    name: 'FNV Chat Message Crawl',
    hint: 'New chat messages draw themselves in with a staggered left-to-right wipe. Messages already in the log are unaffected.',
    scope: 'client',
    config: true,
    type: Boolean,
    default: true,
  })

  document.body.classList.toggle('fnv-chat-off', !setting('ChatSkin'))

  // Dice registers its render hook FIRST, on purpose: hooks fire in
  // registration order, and the sprite row has to be in the DOM before the
  // crawl below walks the message's blocks, or it appears after the wipe
  // instead of riding it.
  registerChatDice(ID)

  Hooks.on('renderChatMessageHTML', onRenderMessage)
})

Hooks.once('ready', stampViewer)

// Re-tint live entries when a player changes their colour — the stamp is a
// snapshot, and messages already in the log would otherwise keep the old
// one until they re-render.
Hooks.on('updateUser', (user, changes) => {
  if (!('color' in changes)) return
  const css = user.color?.css ?? AMBER
  const sel = `li.chat-message[data-av-author="${CSS.escape(user.id)}"]`
  for (const li of document.querySelectorAll(sel)) li.style.setProperty('--av-msg', css)
  if (user.id === game.user.id) stampViewer()
})
