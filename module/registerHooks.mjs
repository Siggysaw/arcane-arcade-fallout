
import SkillRoll from './dice/skill-roll.mjs'
import FalloutZeroArmor from './data/armor.mjs'
import FalloutZeroItem from './documents/item.mjs'
import { getApCost, getLastWaypointGroup, sumWaypoints } from './helpers/movement.mjs'
import { attachAttributeKeyAutocomplete } from './helpers/effects.mjs'

/* --------------------------------------------  */
/*  Robco Terminal Journal skin                  */
/* --------------------------------------------  */
// Applies the Robco Terminal reskin (css/robco-terminal.css) to Journal
// Entry windows when the client has the 'RobcoTerminals' setting on. Kept
// entirely defensive (try/catch, tolerant of both jQuery and raw-element
// render hook signatures) since it targets core Foundry's own Journal sheet
// rather than a template this system owns, and the exact class name for
// that sheet has changed across Foundry versions (JournalSheet in v12,
// JournalEntrySheet in newer ApplicationV2-based versions) — hooking both
// names is harmless since Hooks.on for a hook that never fires is a no-op.
function applyRobcoTerminalSkin(app, html) {
  try {
    if (!game.settings.get(CONFIG.FALLOUTZERO.systemId, 'RobcoTerminals')) return

    const el = html instanceof HTMLElement ? html : html?.[0] ?? app.element?.[0] ?? app.element
    if (!el) return

    el.classList.add('robco-terminal')

    if (game.settings.get(CONFIG.FALLOUTZERO.systemId, 'PlaySounds')) {
      const audio = new Audio(
        `/systems/${CONFIG.FALLOUTZERO.systemId}/assets/10-sfx/terminal/single/ui_hacking_charsingle_01.wav`
      )
      audio.volume = 0.5
      audio.play().catch(() => {})
    }
  } catch (error) {
    console.error('falloutzero | Robco Terminal skin failed to apply', error)
  }
}

/* --------------------------------------------  */
/*  Vault-Tec accessibility theme (Journal)      */
/* --------------------------------------------  */
// Journal sheets have no Handlebars template of their own to attach the
// existing `{{#isVaultTec}} vaulttec {{/isVaultTec}}` conditional to (same
// core-Journal-sheet situation as the Robco Terminal skin above), so it's
// applied the same way: toggle the class straight onto the rendered window
// element. Deliberately independent of the 'RobcoTerminals' setting/class —
// Vault-Tec should reskin a plain journal window on its own, and when both
// are on, `.robco-terminal.vaulttec` in robco-terminal.css overrides the
// terminal's phosphor color to the same high-contrast navy/yellow instead
// of the sheetcolor-derived green.
function applyVaultTecTheme(app, html) {
  try {
    if (!game.settings.get(CONFIG.FALLOUTZERO.systemId, 'VaultTec')) return

    const el = html instanceof HTMLElement ? html : html?.[0] ?? app.element?.[0] ?? app.element
    if (!el) return

    el.classList.add('vaulttec')
  } catch (error) {
    console.error('falloutzero | Vault-Tec journal skin failed to apply', error)
  }
}

export function registerHooks() {
  Hooks.on('renderJournalSheet', applyRobcoTerminalSkin)
  Hooks.on('renderJournalEntrySheet', applyRobcoTerminalSkin)
  Hooks.on('renderJournalSheet', applyVaultTecTheme)
  Hooks.on('renderJournalEntrySheet', applyVaultTecTheme)

  Hooks.on('renderSidebar', (app, element) => {
    if (!game.user.isGM) return

    const menu = element.querySelector('#sidebar-tabs menu.flexcol')
    if (!menu || menu.querySelector('.overseer-screen-btn')) return

    const li = document.createElement('li')
    li.innerHTML = `
    <button type="button" class="ui-control plain icon falloutzero-overseer-icon overseer-screen-btn" data-tooltip="Overseer Screen" aria-label="Overseer Screen"></button>
    <div class="notification-pip"></div>
  `

    li.querySelector('button').addEventListener('click', (ev) => {
      ev.preventDefault()
      ev.stopPropagation()
      new game.falloutzero.applications.components.GMApplication(
        game.actors.filter((actor) => actor.type === 'character')
      ).render(true)
    })

    // Insert before the collapse toggle so it stays grouped with the other tabs
    const collapseLi = menu.querySelector('.collapse')?.closest('li')
    collapseLi ? menu.insertBefore(li, collapseLi) : menu.appendChild(li)
  })

  Hooks.once('ready', function () {
    // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
    Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot))

    /* --------------------------------------------  */
    /*  Auto recycle AP on turn end                                */
    /* --------------------------------------------  */
    if (game.user.isGM && game.settings.get(CONFIG.FALLOUTZERO.systemId, 'AutoRecycleAP')) {
      Hooks.on("updateCombat", async (combat, updates, update) => {
        // if round did not change or direction is backwards, return
        if (!updates.round || update.direction !== 1) return

        // else recycle ap for all combatants
        game.combat.combatants.forEach((combatant) => {
          combatant.actor.recycleAp()
        })
      });
    }
  })

  /* --------------------------------------------  */
  /*  Active Effect config                         */
  /* --------------------------------------------  */
  Hooks.on('renderActiveEffectConfig', attachAttributeKeyAutocomplete)

  Hooks.on('renderActorSheet', (app, html) => {
    if (html?.[0].tagName === 'FORM') {
      return
    } else {
      var audio = new Audio(`/systems/arcane-arcade-fallout/assets/sounds/ui/open-sheet_pipboy.mp3`);
      if (game.settings.get(CONFIG.FALLOUTZERO.systemId, 'PlaySounds')) {
        audio.play()
      }
    }
  })

  /* --------------------------------------------  */
  /*  Token movement                                 */
  /* --------------------------------------------  */
  Hooks.on('preMoveToken', (token, movement) => {
    // if flag not active or not in combat, skip AP deduction
    if (!game.settings.get(CONFIG.FALLOUTZERO.systemId, 'DeductMovementAPInCombat') || !game.combats?.active?.started) return

    const isTurn = game.combats.active.combatant.tokenId === token.id

    if (!isTurn && game.user.role !== 4) {
      ui.notifications.warn("Movement is based on combat turn, it's currently not your turn");
      return false
    }

    // Get total cost
    let passedApCost = getApCost(movement.passed.cost)
    let pendingWaypoints = movement.pending.waypoints
    let pendingApCost = 0
    let multiplier = 1
    const rooted = token.actor.items.find((i) => i.name == "Rooted Condition")
    const encumbered = token.actor.items.find((i) => i.name == "Encumbered")
    const heavilyEncumbered = token.actor.items.find((i) => i.name == "Heavily Encumbered")
    const hoarder = token.actor.items.find((i) => i.name == "Hoarder")
    const heavyWeight = token.actor.items.find((i) => i.name == "Heavyweight")

    while (pendingWaypoints.length) {
      const waypointGroup = getLastWaypointGroup(pendingWaypoints)
      pendingApCost += sumWaypoints(waypointGroup)
      pendingWaypoints = pendingWaypoints.slice(waypointGroup.length)
    }

    // Check if actor can afford movement
    let apAfterCost = token.actor.getAPAfterCost(passedApCost + pendingApCost)
    if (apAfterCost < 0 && game.user.role !== 4) {
      ui.notifications.warn("Not enough AP for this movement");
      return false
    }


    // Deduct AP
    if (movement.method !== 'undo') {
      rooted ? multiplier += 1 : ''
      encumbered && !hoarder && !heavyWeight ? multiplier += 1 : ''
      heavilyEncumbered ? multiplier += 2 : ''

      token.actor.applyApCost(getApCost(movement.passed.cost) * multiplier)
    } else {
      // If undo movement, restore AP
      try {
        const waypointGroup = getLastWaypointGroup(movement.history.recorded.waypoints)
        const historyApCost = sumWaypoints(waypointGroup)

        const currentAp = token.actor.system.actionPoints.value
        token.actor.update({
          'system.actionPoints.value': currentAp + historyApCost
        })
      } catch (error) {
        console.error('Error restoring actors AP', error)
        ui.notifications.warn("Error restoring actors AP", error);
      }
    }

    return true
  });

  /* --------------------------------------------  */
  /*  Other Hooks                                  */
  /* --------------------------------------------  */
  Hooks.on('deleteCombat', (combat, options, userId) => {
    // Check if the user is the GM to prevent the code from running multiple times
    if (!game.user.isGM) return;
    canvas.tokens.placeables.forEach((combatant) => {
      combatant.actor.refillAp()
    })
  });

  Hooks.on('renderPause', (app, [html]) => {
    const img = html.querySelector('img')
    img.src = 'systems/arcane-arcade-fallout/assets/vaultboy/vaultboy.webp'
  })

  /* --------------------------------------------  */
  /*  AAFO-HUD HOOKS                                */
  /* --------------------------------------------  */
  Hooks.on('aafohud.skillRoll', async (actorUuid, skill) => {
    const actor = fromUuidSync(actorUuid)
    const roll = await new SkillRoll(actor, skill, () => { })
    roll.render(true)
  })

  Hooks.on('aafohud.attackRoll', async (actorUuid, weaponId) => {
    const actor = fromUuidSync(actorUuid)
    const weapon = actor.items.get(weaponId)
    weapon.rollAttack({ advantageMode: 1 })
  })

  Hooks.on('aafohud.toggleEquipArmor', async (actorUuid, itemId) => {
    const actor = fromUuidSync(actorUuid)
    const item = actor.items.get(itemId)
    const cost = item.type == "powerArmor" ? 6 : 3
    const canAffordAP = actor.applyApCost(cost)
    if (canAffordAP) {
      item.update({ 'system.itemEquipped': !item.system.itemEquipped })
    }
  })

  Hooks.on('aafohud.toggleEquipWeapon', async (actorUuid, itemId) => {
    const actor = fromUuidSync(actorUuid)
    const item = actor.items.get(itemId)
    const cost = 3
    const canAffordAP = actor.applyApCost(cost)
    if (canAffordAP) {
      item.update({ 'system.itemEquipped': !item.system.itemEquipped })
    }
  })

  Hooks.on('aafohud.reloadWeapon', async (actorUuid, itemId) => {
    const actor = fromUuidSync(actorUuid)
    actor.reload(itemId)
  })

  Hooks.on('aafohud.useConsumable', async (actorUuid, itemId) => {
    const actor = fromUuidSync(actorUuid)
    const cost = 4
    const canAffordAP = actor.applyApCost(cost)
    if (canAffordAP) {
      actor.lowerInventory(itemId)
    }
  })
}
