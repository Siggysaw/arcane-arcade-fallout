// FNV chat behavior: author colors, speaker wrapper, kill switch, and message crawl animation.

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

/** Staggers a clip-path reveal wipe across each message block. */
function revealBlocks(elements, { step = 45, cap = 900 } = {}) {
  let last = 0
  elements.forEach((el, i) => {
    last = Math.min(i * step, cap)
    el.classList.add('av-reveal')
    el.style.animationDelay = `${last}ms`
  })
  return last
}

// Panel chrome follows the viewing user; message entries follow their author.
function stampViewer() {
  const css = game.user?.color?.css
  if (css) document.body.style.setProperty('--av-user', css)
}

function onRenderMessage(message, html) {
  // Stamped unconditionally so toggling the skin on mid-session finds colours already in place.
  html.style.setProperty('--av-msg', message.author?.color?.css ?? AMBER)
  if (message.author?.id) html.dataset.avAuthor = message.author.id

  // Wraps core's bare alias text node, leaving the system's own markup alone.
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

  // Flattens one level so the header's children and content's blocks animate individually.
  const items = []
  for (const child of html.children) {
    const flatten =
      child.classList?.contains('message-content') || child.classList?.contains('message-header')
    if (flatten && child.children.length) items.push(...child.children)
    else items.push(child)
  }
  revealBlocks(items)
}

// Applied at `setup`, after every system's `init` hooks register their settings.
Hooks.once('setup', () => {
  document.body.classList.toggle('fnv-chat-off', !setting('ChatSkin'))

  // Dice registers its render hook first so the sprite row is in the DOM before the crawl.
  registerChatDice(ID)

  Hooks.on('renderChatMessageHTML', onRenderMessage)
})

Hooks.once('ready', stampViewer)

// Re-tints live entries when a player changes their colour, since the stamp is a snapshot.
Hooks.on('updateUser', (user, changes) => {
  if (!('color' in changes)) return
  const css = user.color?.css ?? AMBER
  const sel = `li.chat-message[data-av-author="${CSS.escape(user.id)}"]`
  for (const li of document.querySelectorAll(sel)) li.style.setProperty('--av-msg', css)
  if (user.id === game.user.id) stampViewer()
})
