import { FALLOUTZERO } from "../config.mjs";
import { DICE_DIR, diceOfRoll } from "../chat-fnv/fnv-chat-dice.mjs";
import { perkAnimElement } from "./perk-clip.mjs";

/* ---- Cinematic group rolls -----------------------------------------------
   BG3-style fullscreen roll overlay, Fallout New Vegas dressing. The chat
   card IS the session: the master message carries the roll definition in
   flags, each participant's actual roll posts as their own flag-linked
   message, and every client renders overlay + tally from that shared state
   — so joining, reopening, and reload-survival are free. The socket carries
   only the ephemeral pre-roll theater: advantage/ability toggles and
   marked consumables, so the table can watch you reach for the Mentats.

   Rolls are evaluated LIVE on the owning player's client with the system's
   real math (skill: bonus + ability mod + boost + luck/2 - penalties;
   SPECIAL: no luck, raw mod). Consumables spend through the system's own
   actor.lowerInventory, so ghoul halving, addiction DC checks, drunkness
   and the consumed-item chat card all apply. NOTE (system behavior): buffs
   from consumption never auto-expire.

   ---- Ported from the AAFO V.A.T.S. module --------------------------------
   Logic is the module's, unchanged. What differs, and why:

   - PKG_ID is the system id, which also moves the FLAG SCOPE from
     `aafo-vats.groupRoll` to `arcane-arcade-fallout.groupRoll`. A roll left
     open in chat from before the port is simply not recognised any more —
     these are ephemeral session messages, so that is acceptable, but it is
     why an in-flight roll should be finished before updating.
   - socketlib is gone. It was carrying exactly one message type, so the
     dependency is not worth a system taking on a module: see SOCKET below.
   - The public API lands on `game.falloutzero.groupRoll`, not a module `api`
     object, and is attached in `setup` rather than `init` — the system's own
     init hook assigns `game.falloutzero = {…}` wholesale, and this file's
     hooks are registered first (its import is evaluated before
     falloutzero.mjs's body runs), so anything written in init is clobbered.
   - Localized strings are inlined as the module's own English, matching the
     convention registerSettings.mjs already uses. */

const PKG_ID = FALLOUTZERO.systemId;
const MASTER_FLAG = "groupRoll";
const ENTRY_FLAG = "groupRollEntry";
/* Derived from this file's own URL, not written out: absolute (AudioHelper
   resolves against the document, so a bare "systems/…" 404s under a route
   prefix — the same trap the dice sprites hit) and rename-proof. Two levels
   up: this file sits in module/group-roll/. */
const SFX = new URL("../../assets/10-sfx", import.meta.url).pathname;
// Primary tumble length — the suspense window before dice land, in the
// overlay AND before the chat card reveals the faces.
const LAND_MS = 3000;

/* Approved default perk clip per skill / SPECIAL. World setting
   "groupRollPerkMap" merges over this. */
const DEFAULT_PERKS = {
  barter: "capcollector", breach: "locksmith", crafting: "scrapper",
  energy_weapons: "refractor", explosives: "demolitionexpert", guns: "gunslinger",
  intimidation: "intimidation", medicine: "medic", melee_weapons: "bigleagues",
  science: "science", sneak: "sneak", speech: "giftofgab",
  survival: "leadbelly", unarmed: "ironfist",
  str: "strength", per: "perception", end: "endurance", cha: "charisma",
  int: "intelligence", agi: "agility", lck: "luck"
};

/* Consumable paths that change a d20 roll: ability/skill modifiers or
   advantage, boost dice, penalty relief. Buff chems (Mentats, Buffout,
   Jet...) carry no direct modifiers at all — their payload is condition
   items linked in the description HTML. */
const ROLL_RELEVANT = /^system\.(abilities\.\w+\.(modifiers|advantage)|skills\.\w+\.(modifiers|advantage)|boostDice$|penalties\.\w+\.(base|modifiers))/;
const CONSUMABLE_TYPES = ["chem", "medicine", "foodAnddrink"];

/* ---- SOCKET ---------------------------------------------------------------
   The module used socketlib for exactly one message type — the ephemeral
   panel state (advantage toggles, chosen ability, marked consumables) that
   lets the table watch someone reach for the Mentats before they roll. None
   of the session's real state travels this way; it all lives in message
   flags, which is why a reload or a late join costs nothing.

   One message type does not justify a system declaring a hard dependency on
   a module, so this is core's own relay instead. Two differences from
   socketlib worth knowing:

   - The channel name MUST be `system.<id>`; core routes on that prefix and
     silently drops anything else.
   - `emit` is send-to-everyone-else, which is precisely socketlib's
     `executeForOthers` — the sender is never echoed, so no self-filter is
     needed. There is no acknowledgement and no return value; this payload
     never needed either.

   `"socket": true` in system.json is what opens the channel, and Foundry only
   reads that at world launch — the world must be relaunched (not just
   reloaded) after this is first installed, or every broadcast silently goes
   nowhere and panels stop mirroring between clients. Everything else still
   works, which is what makes that failure mode easy to miss. */
const SOCKET = `system.${PKG_ID}`;

Hooks.once("ready", () => {
  game.socket.on(SOCKET, (payload) => {
    if (payload?.type !== "grPanelState") return;
    onRemotePanelState(payload);
  });
});

/* ---- Session state (per client) ------------------------------------------ */

let overlay = null; // { rollId, root, panels: Map<actorUuid, panelEl> }
let closeTimer = null; // pending auto-close; rescheduled by each reveal
// Ephemeral pre-roll selections per rollId->actorUuid, local + remote.
const panelStates = new Map();

const flag = (msg, key) => msg.getFlag(PKG_ID, key);
const setting = (key) => game.settings.get(PKG_ID, key);

// Attribute-safe: quotes escaped too, unlike textContent round-trips.
function esc(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function masterMessage(rollId) {
  return game.messages.find((m) => flag(m, MASTER_FLAG)?.id === rollId);
}

function entriesFor(rollId) {
  return game.messages.filter((m) => flag(m, ENTRY_FLAG)?.rollId === rollId);
}

function panelKey(rollId, actorUuid) {
  return `${rollId}:${actorUuid}`;
}

function getPanelState(rollId, actorUuid) {
  const key = panelKey(rollId, actorUuid);
  if (!panelStates.has(key)) panelStates.set(key, { advantageMode: null, ability: null, bonus: "", marked: [] });
  return panelStates.get(key);
}

function playSfx(file) {
  if (!setting("groupRollSounds")) return;
  foundry.audio.AudioHelper.play({ src: `${SFX}/${file}`, channel: "interface" });
}

/* Recolor the black-and-white perk art to an arbitrary color: sepia lands
   every light pixel on one warm hue (~39deg), saturate pulls it out of
   near-white, hue-rotate carries it to the target. Blacks stay black, so
   the line work survives. */
function tintFilter(css) {
  const hex = String(css ?? "").replace("#", "");
  if (hex.length < 6) return "sepia(1) saturate(50) hue-rotate(-40deg)";
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  const s = max ? d / max : 0;
  const sat = Math.max(8, Math.round(s * 50));
  const bright = (0.85 + max * 0.35).toFixed(2);
  return `sepia(1) saturate(${sat}) hue-rotate(${Math.round(h - 39)}deg) brightness(${bright})`;
}

/* GM-declared advantage/disadvantage on the roll itself, as a delta that
   composes with actor conditions and marked items. */
function gmAdvDelta(data) {
  return data.modAdv === "advantage" ? 1 : data.modAdv === "disadvantage" ? -1 : 0;
}

/* The pre-set modifier line shown at the bottom of every panel. */
function modLineHTML(data) {
  const bits = [];
  if (data.modAdv === "advantage") bits.push(`<span class="pos">ADVANTAGE</span>`);
  if (data.modAdv === "disadvantage") bits.push(`<span class="neg">DISADVANTAGE</span>`);
  if (Number(data.mod)) {
    const v = Number(data.mod);
    bits.push(`<span class="${v < 0 ? "neg" : "pos"}">${v > 0 ? "+" : ""}${v}</span>`);
  }
  if (!bits.length) return "";
  const label = data.modLabel ? `<span class="av-gr-modlabel">${esc(data.modLabel)}</span>` : "";
  return bits.join(" ") + label;
}

/* FNV interface sounds, same idiom as fallout-ui-redux: a focus blip when
   the pointer enters any control, an ok click on activation. */
let lastFocusBlip = 0;
function wireFnvSounds(rootEl) {
  rootEl.addEventListener("pointerover", (ev) => {
    if (!ev.target.closest("button, select, input, .av-gr-item")) return;
    const now = Date.now();
    if (now - lastFocusBlip < 90) return;
    lastFocusBlip = now;
    playSfx("ui_menu_focus.wav");
  });
  rootEl.addEventListener("click", (ev) => {
    if (!ev.target.closest("button, .av-gr-item")) return;
    playSfx("ui_menu_ok.wav");
  });
}

/* ---- Roll math (replicated from the system's SkillRoll/AbilityRoll;
        boost/advantage read live so consumption is reflected) ------------- */

function rollTermsFor(actor, kind, key, ability) {
  if (kind === "skill") {
    const abl = ability || actor.system.skills[key].defaultAbility || actor.system.skills[key].ability[0];
    return {
      parts: [
        // .value, not getSkillBonus: characters derive value with the
        // Gifted/Wild Wasteland deduction the raw accessor omits.
        actor.system.skills[key].value ?? 0,
        actor.getAbilityMod(abl),
        actor.system.boostDice || 0,
        actor.getAbilityMod("lck")
      ],
      penalty: actor.system.penaltyTotal || 0,
      // Ability advantage counts too: buff chems (Mentats etc.) grant e.g.
      // INT advantage meant for INT-based skill checks — the pack's skill
      // change rows are empty, so the ability row carries the intent.
      defaultAdvantage: (actor.system.skills[key].advantage ?? 0) + (actor.system.abilities[abl].advantage ?? 0)
    };
  }
  return {
    parts: [actor.system.abilities[key].mod, actor.system.boostDice || 0],
    penalty: actor.system.penaltyTotal || 0,
    defaultAdvantage: actor.system.abilities[key].advantage ?? 0
  };
}

function diceExpr(advantageMode) {
  return advantageMode === 2 ? "2d20kh" : advantageMode === 3 ? "2d20kl" : "1d20";
}

/* ---- Consumable filtering + tooltips ------------------------------------- */

function directRollMods(item) {
  const m = item.system.modifiers ?? {};
  const out = [];
  for (let n = 1; n <= 4; n++) {
    const path = m[`path${n}`], value = m[`value${n}`];
    if (path && value && ROLL_RELEVANT.test(path)) out.push(`${path.split(".").at(-2)} ${m[`modType${n}`] || "Add"} ${value}`);
  }
  return out;
}

function linkedConditionAnchors(item) {
  // DOMParser: inert document — item descriptions are player-authored HTML
  // and must not execute (img onerror etc.) while we scan for links.
  const doc = new DOMParser().parseFromString(item.system.description ?? "", "text/html");
  return Array.from(doc.querySelectorAll('a.content-link[data-uuid*=".conditions."]'))
    .map((a) => ({ name: a.textContent.trim(), tip: a.dataset.tooltip ?? "" }));
}

function rollRelevantConsumables(actor) {
  return actor.items.filter((i) => {
    if (!CONSUMABLE_TYPES.includes(i.type)) return false;
    if (Number(i.system.quantity ?? 0) < 1) return false;
    return directRollMods(i).length > 0 || linkedConditionAnchors(i).length > 0;
  });
}

function itemTooltip(item) {
  const lines = [item.name];
  for (const mod of directRollMods(item)) lines.push(mod);
  for (const a of linkedConditionAnchors(item)) lines.push(a.tip ? `${a.name}: ${a.tip}` : a.name);
  return lines.join("\n");
}

/* ---- Predicted item effects ----------------------------------------------
   So marking a chem flips the advantage toggle BEFORE consuming: collect
   every advantage-granting change the item would apply — direct modifier
   slots plus the linked condition items' effect changes (where the pack's
   ability rows carry values and skill rows are empty = implicit +1). */
const itemEffectCache = new Map();
const itemGrantCache = new Map();

/* The names of the conditions a consumable attaches, whatever they change.

   itemAdvChanges() below answers a narrower question — which changes affect a
   d20 roll — and so only ever names a condition that grants `.advantage`. For
   the caption on the spent row we want the condition regardless: a chem whose
   payload is a flat skill bonus is still "granting" that condition, and
   labelling it with the consumable's own name would be wrong.

   Same description-link parse as itemAdvChanges, cached separately so neither
   function has to change shape for the other. */
async function itemGrantNames(item) {
  if (itemGrantCache.has(item.uuid)) return itemGrantCache.get(item.uuid);
  const names = [];
  const doc = new DOMParser().parseFromString(item.system.description ?? "", "text/html");
  const uuids = [...new Set(
    Array.from(doc.querySelectorAll('a.content-link[data-uuid*=".conditions."]')).map((a) => a.dataset.uuid)
  )];
  for (const uuid of uuids) {
    const cond = await fromUuid(uuid).catch(() => null);
    if (cond?.name) names.push(cond.name);
  }
  itemGrantCache.set(item.uuid, names);
  return names;
}

async function itemAdvChanges(item) {
  if (itemEffectCache.has(item.uuid)) return itemEffectCache.get(item.uuid);
  const changes = [];
  const m = item.system.modifiers ?? {};
  for (let n = 1; n <= 4; n++) {
    const path = m[`path${n}`];
    if (path?.endsWith(".advantage") && m[`value${n}`]) {
      changes.push({ key: path, value: Number(m[`value${n}`]) || 1, source: item.name });
    }
  }
  const doc = new DOMParser().parseFromString(item.system.description ?? "", "text/html");
  const uuids = [...new Set(Array.from(doc.querySelectorAll('a.content-link[data-uuid*=".conditions."]')).map((a) => a.dataset.uuid))];
  for (const uuid of uuids) {
    const cond = await fromUuid(uuid).catch(() => null);
    for (const effect of cond?.effects ?? []) {
      for (const ch of effect.system?.changes ?? effect.changes ?? []) {
        // Attribute to the CONDITION (the effect doing the granting), not
        // the consumable that attaches it.
        if (ch.key?.endsWith(".advantage")) changes.push({ key: ch.key, value: Number(ch.value) || 1, source: cond.name });
      }
    }
  }
  itemEffectCache.set(item.uuid, changes);
  return changes;
}

/* Who is granting the advantage/disadvantage on this roll: effects from
   items spent THIS roll (attributed "effect (via item)") plus condition
   items already sitting on the actor. Deduped by effect name — a chem
   spent now attaches its condition immediately, so it would otherwise
   appear in both lists. */
async function advSourcesFor(actor, kind, key, abl, spentItems) {
  const sources = [];
  const seen = new Set();
  for (const spent of spentItems) {
    for (const ch of spent.changes ?? []) {
      if (advDeltaFor([ch], kind, key, abl) === 0) continue;
      if (seen.has(ch.source)) continue;
      seen.add(ch.source);
      sources.push({ effect: ch.source, item: spent.name, value: ch.value });
    }
  }
  for (const cond of actor.items.filter((i) => i.type === "condition")) {
    for (const effect of cond.effects ?? []) {
      for (const ch of effect.system?.changes ?? effect.changes ?? []) {
        if (!ch.key?.endsWith(".advantage")) continue;
        const delta = advDeltaFor([{ key: ch.key, value: Number(ch.value) || 1 }], kind, key, abl);
        if (delta === 0 || seen.has(cond.name)) continue;
        seen.add(cond.name);
        sources.push({ effect: cond.name, item: null, value: Number(ch.value) || 1 });
      }
    }
  }
  return sources;
}

function advDeltaFor(changes, kind, key, abl) {
  let delta = 0;
  for (const ch of changes) {
    if (ch.key === `system.abilities.${abl}.advantage`) delta += ch.value;
    if (kind === "skill" && ch.key === `system.skills.${key}.advantage`) delta += ch.value;
  }
  return delta;
}

/* ---- GM request dialog ---------------------------------------------------- */

class GroupRollRequest extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "av-group-roll-request",
    tag: "form",
    window: { title: "Request Group Roll", icon: "fa-solid fa-dice-d20" },
    position: { width: 420 },
    form: { handler: GroupRollRequest.#onSubmit, closeOnSubmit: true }
  };

  static PARTS = {
    // Template paths are looked up through Foundry's own resolver, which is
    // route-prefix aware, so this one stays a written path rather than being
    // derived from import.meta.url like the asset directories.
    form: { template: `systems/${PKG_ID}/templates/group-roll-request.hbs` }
  };

  async _prepareContext() {
    const skills = Object.entries(CONFIG.FALLOUTZERO.skills).map(([k, v]) => ({ key: `skill:${k}`, label: v.label }));
    const abilities = Object.entries(CONFIG.FALLOUTZERO.abilities).map(([k, v]) => ({ key: `ability:${k}`, label: v.label }));
    // Captured at open — canvas clicks between open and submit would
    // otherwise change the roster out from under the GM.
    this.rollActors = [...new Map(
      (canvas?.tokens?.controlled ?? []).map((t) => t.actor).filter((a) => a?.system?.skills).map((a) => [a.uuid, a])
    ).values()];
    return { skills, abilities, actors: this.rollActors.map((a) => ({ uuid: a.uuid, name: a.name })) };
  }

  static async #onSubmit(event, form, formData) {
    const data = foundry.utils.expandObject(formData.object);
    const [kind, key] = String(data.check).split(":");
    const actors = this.rollActors ?? [];
    if (!actors.length) return ui.notifications.warn("No tokens selected.");
    await createGroupRoll({
      title: data.title || labelFor(kind, key),
      kind, key,
      dc: data.dc !== "" && data.dc != null ? Number(data.dc) : null,
      hideDc: !!data.hideDc,
      mod: data.mod !== "" && data.mod != null ? Number(data.mod) : 0,
      modAdv: data.modAdv || "",
      modLabel: data.modLabel || "",
      actors
    });
  }
}

function labelFor(kind, key) {
  const cfg = kind === "skill" ? CONFIG.FALLOUTZERO.skills : CONFIG.FALLOUTZERO.abilities;
  return cfg[key]?.label ?? key;
}

function perkFor(kind, key) {
  const map = { ...DEFAULT_PERKS, ...setting("groupRollPerkMap") };
  return map[key] ?? "perkclipdefault";
}

async function createGroupRoll({ title, kind, key, dc = null, hideDc = false, mod = 0, modAdv = "", modLabel = "", actors, perk = null }) {
  const participants = actors.map((a) => {
    const owner = game.users.find((u) => !u.isGM && u.character?.id === a.id)
      ?? game.users.find((u) => !u.isGM && a.testUserPermission(u, "OWNER"))
      ?? game.users.activeGM;
    return { actorUuid: a.uuid, name: a.name, img: a.img, color: owner?.color?.css ?? "#1bff80" };
  });
  const data = {
    id: foundry.utils.randomID(),
    title, kind, key,
    label: labelFor(kind, key),
    dc, hideDc, mod, modAdv, modLabel,
    perk: perk ?? perkFor(kind, key),
    participants,
    status: "open"
  };
  return ChatMessage.implementation.create({
    content: `<div class="av-gr-card-placeholder">${data.title}</div>`,
    speaker: { alias: game.user.name },
    flags: { [PKG_ID]: { [MASTER_FLAG]: data } }
  });
}

/* ---- Overlay -------------------------------------------------------------- */

function openOverlay(rollId) {
  const master = masterMessage(rollId);
  const data = master ? flag(master, MASTER_FLAG) : null;
  if (!data || data.status === "closed") return;
  if (overlay?.rollId === rollId) return;
  // A finished roll is history: read it off the chat card instead. Entries
  // still mid-reveal don't count, so a late spectator can still catch the
  // last participant's dice.
  const settled = tallyFor(data).rolled;
  if (data.participants.length && settled >= data.participants.length) return;
  closeOverlay({ silent: true });

  const root = document.createElement("div");
  root.id = "av-group-roll";
  root.innerHTML = `
    <div class="av-gr-backdrop"></div>
    <div class="av-gr-stage">
      <div class="av-gr-header">
        <div class="av-gr-bg"></div>
        <div class="av-gr-perk-bg"></div>
        <div class="av-gr-title">${esc(data.label)} ${data.kind === "skill" ? "Check" : "Test"}</div>
        <div class="av-gr-rollname">${esc(data.title)}</div>
        ${data.dc != null ? `<div class="av-gr-dc-label">TARGET</div><div class="av-gr-dc">${data.hideDc && !game.user.isGM ? "DC ███" : `DC ${Number(data.dc)}`}</div>` : ""}
      </div>
      <div class="av-gr-row"></div>
      <div class="av-gr-hint">${"Mark items to spend, then hit ROLL — ESC to step out, click the chat card to rejoin"}</div>
      <button type="button" class="av-gr-close" data-tooltip="${"Leave the roll (rejoin from chat)"}">✕</button>
    </div>`;
  // Large translucent perk clip as artistic backdrop behind the header text.
  const perkBg = perkAnimElement(data.perk, { size: "lg", align: "center" });
  const perkImg = perkBg.querySelector("img");
  if (perkImg) perkImg.loading = "eager"; // centerpiece art: paint with the window
  root.querySelector(".av-gr-perk-bg").appendChild(perkBg);
  root.querySelector(".av-gr-close").addEventListener("click", () => closeOverlay());
  // The center window is themed to the VIEWING user's color, like a Pip-Boy,
  // and the perk art is recolored to match.
  const headerEl = root.querySelector(".av-gr-header");
  const userCss = game.user?.color?.css ?? "#ffb641";
  headerEl.style.setProperty("--gr-color", userCss);
  root.style.setProperty("--gr-perk-filter", tintFilter(userCss));

  const row = root.querySelector(".av-gr-row");
  const panels = new Map();
  data.participants.forEach((p, i) => {
    const panel = buildPanel(data, p, i);
    panels.set(p.actorUuid, panel);
    row.appendChild(panel);
  });

  document.body.appendChild(root);
  wireFnvSounds(root);
  requestAnimationFrame(() => root.classList.add("av-gr-open"));
  overlay = { rollId, root, panels };
  playSfx("vats/ui_vats_enter.wav");

  // Hydrate panels already rolled (join-in-progress / reopen).
  for (const entry of entriesFor(rollId)) applyEntryToOverlay(entry, { animate: false });
}

function closeOverlay({ silent = false } = {}) {
  clearTimeout(closeTimer);
  closeTimer = null;
  if (!overlay) return;
  const root = overlay.root;
  overlay = null;
  root.classList.remove("av-gr-open");
  if (!silent) playSfx("vats/ui_vats_exit.wav");
  setTimeout(() => root.remove(), 350);
}

function buildPanel(data, participant, index) {
  const actor = fromUuidSync(participant.actorUuid);
  const isOwner = actor?.isOwner ?? false;
  const state = getPanelState(data.id, participant.actorUuid);
  const terms = actor ? rollTermsFor(actor, data.kind, data.key, state.ability) : null;
  if (state.advantageMode === null && terms) {
    const adv = terms.defaultAdvantage + gmAdvDelta(data);
    state.advantageMode = adv > 0 ? 2 : adv < 0 ? 3 : 1;
  }

  const el = document.createElement("div");
  el.className = "av-gr-panel";
  el.dataset.actorUuid = participant.actorUuid;
  el.style.setProperty("--gr-color", participant.color);
  el.style.animationDelay = `${index * 120}ms`;
  el.innerHTML = `
    <div class="av-gr-bg"></div>
    <div class="av-gr-spent"></div>
    <div class="av-gr-pname">${esc(participant.name)}</div>
    <div class="av-gr-dice"></div>
    <div class="av-gr-steps"></div>
    <div class="av-gr-total"></div>
    <div class="av-gr-controls"></div>
    <div class="av-gr-items"></div>
    <div class="av-gr-modline">${modLineHTML(data)}</div>`;

  // The GM owns everyone and may roll any panel at any time; the duplicate
  // guard in performGroupRoll keeps a race with the player from posting twice.
  if (isOwner && actor) buildControls(el, data, participant, actor);
  else el.querySelector(".av-gr-controls").innerHTML = `<div class="av-gr-waiting">${"Waiting on their vault dweller…"}</div>`;
  renderSpentRow(el, data.id, participant.actorUuid);

  // GM: per-player reset, tucked inside the panel's top-right corner.
  if (game.user.isGM) {
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "av-gr-reset";
    reset.innerHTML = `<i class="fa-solid fa-rotate-left"></i>`;
    reset.dataset.tooltip = "Reset this participant's roll";
    reset.addEventListener("click", (ev) => {
      ev.stopPropagation();
      resetRoll(data.id, participant.actorUuid);
    });
    el.appendChild(reset);
  }
  return el;
}

/* Wipe roll entries so they can be rolled again. Deleting the entry
   messages is the whole reset: every client's card and panel rebuild from
   that state. Consumables already spent stay spent — the system consumed
   them for real. */
async function resetRoll(rollId, actorUuid = null) {
  if (!game.user.isGM) return;
  const entries = entriesFor(rollId).filter((m) => !actorUuid || flag(m, ENTRY_FLAG).actorUuid === actorUuid);
  if (!entries.length) return;
  playSfx("ui_menu_cancel.wav");
  await ChatMessage.implementation.deleteDocuments(entries.map((m) => m.id));
}

/* Swap a rolled panel back to a fresh, rollable one in place. */
function resetPanel(rollId, actorUuid) {
  if (overlay?.rollId !== rollId) return;
  const master = masterMessage(rollId);
  const data = master ? flag(master, MASTER_FLAG) : null;
  const old = overlay.panels.get(actorUuid);
  if (!data || !old) return;
  const index = data.participants.findIndex((p) => p.actorUuid === actorUuid);
  if (index < 0) return;
  panelStates.delete(panelKey(rollId, actorUuid));
  const fresh = buildPanel(data, data.participants[index], index);
  old.replaceWith(fresh);
  overlay.panels.set(actorUuid, fresh);
}

function buildControls(el, data, participant, actor) {
  const state = getPanelState(data.id, participant.actorUuid);
  const controls = el.querySelector(".av-gr-controls");

  // Advantage 3-way toggle
  const adv = document.createElement("div");
  adv.className = "av-gr-adv";
  for (const [mode, label] of [[2, "ADV"], [1, "—"], [3, "DIS"]]) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.dataset.mode = mode;
    if (state.advantageMode === mode) b.classList.add("active");
    b.addEventListener("click", () => {
      state.advantageMode = mode;
      adv.querySelectorAll("button").forEach((x) => x.classList.toggle("active", Number(x.dataset.mode) === mode));
      broadcastPanelState(data.id, participant.actorUuid);
    });
    adv.appendChild(b);
  }
  controls.appendChild(adv);

  // Ability select (skills only — the system dialog offers all seven)
  if (data.kind === "skill") {
    const sel = document.createElement("select");
    sel.className = "av-gr-ability";
    const def = actor.system.skills[data.key].defaultAbility || actor.system.skills[data.key].ability[0];
    for (const [k, v] of Object.entries(CONFIG.FALLOUTZERO.abilities)) {
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = v.label;
      if (k === (state.ability ?? def)) opt.selected = true;
      sel.appendChild(opt);
    }
    sel.addEventListener("change", () => {
      state.ability = sel.value;
      // Marked-item advantage depends on the chosen ability — re-preview.
      el.applyAdvPreview?.();
      broadcastPanelState(data.id, participant.actorUuid);
    });
    controls.appendChild(sel);
  }

  // Situational bonus
  const bonus = document.createElement("input");
  bonus.className = "av-gr-bonus";
  bonus.placeholder = "+bonus (e.g. 2 or 1d4)";
  bonus.value = state.bonus;
  bonus.addEventListener("change", () => { state.bonus = bonus.value.trim(); broadcastPanelState(data.id, participant.actorUuid); });
  controls.appendChild(bonus);

  // Roll button
  const rollBtn = document.createElement("button");
  rollBtn.type = "button";
  rollBtn.className = "av-gr-roll";
  rollBtn.textContent = "ROLL";
  rollBtn.addEventListener("click", () => performGroupRoll(data, participant, actor, el));
  controls.appendChild(rollBtn);

  // Inventory strip: mark consumables to spend on this roll. Marking
  // previews the item's effect on the panel — advantage toggles flip live.
  const strip = el.querySelector(".av-gr-items");
  const consumables = rollRelevantConsumables(actor);
  if (!consumables.length) strip.classList.add("av-gr-empty");

  const applyAdvPreview = async () => {
    const abl = state.ability || actor.system.skills?.[data.key]?.defaultAbility || actor.system.skills?.[data.key]?.ability?.[0] || data.key;
    let adv = rollTermsFor(actor, data.kind, data.key, state.ability).defaultAdvantage + gmAdvDelta(data);
    for (const mark of state.marked) {
      const item = actor.items.get(mark.id);
      if (item) adv += advDeltaFor(await itemAdvChanges(item), data.kind, data.key, abl);
    }
    state.advantageMode = adv > 0 ? 2 : adv < 0 ? 3 : 1;
    el.querySelectorAll(".av-gr-adv button").forEach((b) =>
      b.classList.toggle("active", Number(b.dataset.mode) === state.advantageMode));
    broadcastPanelState(data.id, participant.actorUuid);
  };
  el.dataset.advPreview = "1";
  el.applyAdvPreview = applyAdvPreview;

  for (const item of consumables) {
    // Warm the cache while the panel is idle, and keep the caption the spent
    // row will use. Resolved long before anyone can click; if it somehow is
    // not, the mark just carries the item's own name, which is the same
    // fallback grantLabel() would pick.
    let grants = item.name;
    Promise.all([itemGrantNames(item), itemAdvChanges(item)])
      .then(([names, ch]) => { grants = grantLabel(item.name, ch, names); })
      .catch(() => {});
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "av-gr-item";
    btn.dataset.itemId = item.id;
    btn.dataset.tooltip = itemTooltip(item);
    btn.innerHTML = `<img src="${esc(item.img)}" alt=""><span class="av-gr-item-name">${esc(item.name)}</span><span class="av-gr-qty">${Number(item.system.quantity) || 0}</span>`;
    if (state.marked.some((m) => m.id === item.id)) btn.classList.add("marked");
    btn.addEventListener("click", () => {
      const idx = state.marked.findIndex((m) => m.id === item.id);
      if (idx >= 0) state.marked.splice(idx, 1);
      else state.marked.push({ id: item.id, name: item.name, img: item.img, tip: itemTooltip(item), label: grants });
      btn.classList.toggle("marked", idx < 0);
      renderSpentRow(el, data.id, participant.actorUuid);
      applyAdvPreview();
    });
    strip.appendChild(btn);
  }
}

/* What to caption a marked/spent item with: the status effect it grants, or
   the item itself when it grants no effect of its own. Grape Mentats attaches
   the Anxiolytic condition, so the row reads ANXIOLYTIC — the consumable is
   gone, the condition is what is now riding the roll.

   Order of preference:
     1. a condition the item's description links   (itemGrantNames)
     2. an advantage change attributed to anything but the item itself
     3. the item's own name

   Step 2 is a backstop for an effect that reaches the roll without a
   description link; step 1 is what normally answers, and it answers even when
   the condition changes something other than advantage.

   Deliberately NOT filtered by relevance to this particular check: the row
   says what you spent and what it gave you. The labels that fall onto the die
   during the reveal ARE relevance-filtered — those come from advSources — so
   the two answer different questions on purpose. */
function grantLabel(itemName, changes, condNames) {
  const linked = (condNames ?? []).find(Boolean);
  if (linked) return linked;
  const effect = (changes ?? []).map((c) => c.source).find((s) => s && s !== itemName);
  return effect ?? itemName;
}

/* The widget row above the dice: marked (pre-roll) or spent (post-roll)
   item icons everyone can see, each captioned with what it grants; hover
   reveals name + effects. */
function renderSpentRow(panelEl, rollId, actorUuid, spent = null) {
  const rowEl = panelEl.querySelector(".av-gr-spent");
  const items = spent ?? getPanelState(rollId, actorUuid).marked;
  rowEl.innerHTML = "";
  for (const it of items) {
    const w = document.createElement("div");
    w.className = "av-gr-spent-item" + (spent ? " consumed" : "");
    w.dataset.tooltip = it.tip ?? it.name;
    // The reveal drops each granted effect's name out of the icon that
    // granted it; advSources records the item by NAME, so carry it here.
    w.dataset.itemName = it.name ?? "";
    // `label` is stamped when the item is marked and carried through the
    // spend; recomputed here only for state that predates it.
    const label = it.label ?? grantLabel(it.name, it.changes);
    w.innerHTML =
      `<span class="av-gr-spent-icon"><img src="${esc(it.img)}" alt=""></span>` +
      `<span class="av-gr-spent-label">${esc(label)}</span>`;
    rowEl.appendChild(w);
  }
}

function broadcastPanelState(rollId, actorUuid) {
  const state = getPanelState(rollId, actorUuid);
  // Send-to-everyone-else; core never echoes the sender. Guarded because the
  // socket does not exist until `ready`, and a panel cannot be open before it.
  game.socket?.emit(SOCKET, {
    type: "grPanelState",
    rollId, actorUuid,
    patch: { advantageMode: state.advantageMode, ability: state.ability, marked: state.marked }
  });
  refreshMasterCard(rollId); // the card's waiting dice mirror the adv toggle
}

function onRemotePanelState({ rollId, actorUuid, patch }) {
  Object.assign(getPanelState(rollId, actorUuid), patch);
  refreshMasterCard(rollId);
  if (overlay?.rollId !== rollId) return;
  const panel = overlay.panels.get(actorUuid);
  if (!panel) return;
  renderSpentRow(panel, rollId, actorUuid);
  panel.querySelectorAll(".av-gr-adv button").forEach((b) =>
    b.classList.toggle("active", Number(b.dataset.mode) === patch.advantageMode));
}

/* ---- Performing the roll -------------------------------------------------- */

async function performGroupRoll(data, participant, actor, panelEl) {
  if (entriesFor(data.id).some((m) => flag(m, ENTRY_FLAG).actorUuid === participant.actorUuid)) return;
  const state = getPanelState(data.id, participant.actorUuid);
  const rollBtn = panelEl.querySelector(".av-gr-roll");
  rollBtn.disabled = true;

  // Spend marked consumables through the system's own flow first, so the
  // roll formula below sees the boosted actor. Chems/medicine cost 4 AP
  // (matching the sheet); food is free.
  const spent = [];
  for (const mark of state.marked) {
    const item = actor.items.get(mark.id);
    if (!item || Number(item.system.quantity ?? 0) < 1) continue;
    if (["chem", "medicine"].includes(item.type) && !(await actor.applyApCost(4))) break;
    // Capture effect attribution BEFORE consuming — at quantity 0 the item
    // document is deleted.
    const changes = await itemAdvChanges(item);
    // Resolved BEFORE lowerInventory below deletes the item at quantity 0 —
    // same reason `changes` is captured here.
    const condNames = await itemGrantNames(item);
    spent.push({
      name: mark.name, img: mark.img, tip: mark.tip, changes,
      // Carried onto the entry flag so every client captions the spent row
      // identically, without re-reading an item that no longer exists.
      label: mark.label ?? grantLabel(mark.name, changes, condNames)
    });
    await actor.lowerInventory(mark.id);
    playSfx("ui_pipboy_select.wav");
  }
  state.marked = [];

  // Situational bonus evaluated separately so the main formula is d20s plus
  // flat numbers — that keeps the reveal breakdown exact per part.
  let bonusVal = 0;
  if (state.bonus && Roll.validate(state.bonus)) {
    bonusVal = (await new Roll(state.bonus, actor.getRollData()).evaluate()).total;
  }
  const breakdown = buildBreakdown(actor, data.kind, data.key, state.ability, bonusVal);
  // The GM's pre-set modifier rides along as its own labelled step.
  if (Number(data.mod)) {
    breakdown.push({ label: String(data.modLabel || "SITUATION").toUpperCase(), value: Number(data.mod) });
  }
  // Re-derive advantage in case a consumed buff (Mentats etc.) granted it,
  // unless the player explicitly chose disadvantage.
  const terms = rollTermsFor(actor, data.kind, data.key, state.ability);
  let mode = state.advantageMode ?? 1;
  if (mode === 1 && terms.defaultAdvantage + gmAdvDelta(data) > 0) mode = 2;
  const formula = [diceExpr(mode), ...breakdown.map((b) => String(b.value))].join(" + ");

  const roll = await new Roll(formula, actor.getRollData()).evaluate();
  playSfx("terminal/ui_hacking_charscroll.wav");
  const d20 = roll.dice.find((d) => d.faces === 20);
  const dice = (d20?.results ?? []).map((r) => ({ v: r.result, kept: !(r.discarded === true || r.active === false) }));
  const ablUsed = data.kind === "skill"
    ? (state.ability || actor.system.skills[data.key].defaultAbility || actor.system.skills[data.key].ability[0])
    : data.key;
  const advSources = mode === 1 ? [] : await advSourcesFor(actor, data.kind, data.key, ablUsed, spent);
  // Force public: a participant's private/blind chat mode would whisper the
  // entry and desync every other client's overlay and tally.
  await roll.toMessage({
    speaker: ChatMessage.implementation.getSpeaker({ actor }),
    flavor: `${data.title} — ${data.label} ${data.kind === "skill" ? "Check" : "Test"}${data.dc != null ? ` (DC ${data.dc})` : ""}`,
    flags: {
      falloutzero: { type: "skill" },
      [PKG_ID]: { [ENTRY_FLAG]: {
        rollId: data.id, actorUuid: participant.actorUuid,
        spent: spent.map(({ name, img, tip }) => ({ name, img, tip })),
        total: roll.total, dice, breakdown, mode, advSources
      } }
    }
  }, { messageMode: "public" }); // key of CONFIG.ChatMessage.modes (v14)
}

/* Ordered reveal parts. Negative values are maluses; zero-value parts are
   skipped so the count-up only shows steps that move the number. */
function buildBreakdown(actor, kind, key, ability, bonusVal = 0) {
  const parts = [];
  if (kind === "skill") {
    const abl = ability || actor.system.skills[key].defaultAbility || actor.system.skills[key].ability[0];
    parts.push({ label: `SPECIAL (${abl.toUpperCase()})`, value: actor.getAbilityMod(abl) });
    parts.push({ label: "SKILL", value: actor.system.skills[key].value ?? 0 });
    parts.push({ label: "LUCK", value: actor.getAbilityMod("lck") });
  } else {
    parts.push({ label: `SPECIAL (${key.toUpperCase()})`, value: actor.system.abilities[key].mod });
  }
  parts.push({ label: "ITEMS", value: actor.system.boostDice || 0 });
  if (bonusVal) parts.push({ label: "BONUS", value: bonusVal });
  parts.push({ label: "PENALTIES", value: -(actor.system.penaltyTotal || 0) });
  return parts.filter((p) => p.value !== 0);
}

/* d20 face -> number sheet + row offset. */
function d20FaceStyle(face) {
  const sheets = [["d20_numbers.png", 1, 5], ["d20_numbers2.png", 6, 10], ["d20_numbers3.png", 11, 15], ["d20_numbers4.png", 16, 20]];
  const entry = sheets.find(([, lo, hi]) => face >= lo && face <= hi) ?? sheets[0];
  return { sheet: entry[0], rowy: (face - entry[1]) * -48 };
}

function setDieFace(die, face) {
  const f = d20FaceStyle(face);
  die.style.setProperty("--av-sheet", `url("${foundry.utils.getRoute(DICE_DIR)}/${f.sheet}")`);
  die.style.setProperty("--av-rowy", `${f.rowy}px`);
}

/* Builds a d20 sprite element for a specific face. */
function d20Element(face, { large = false } = {}) {
  const die = document.createElement("div");
  die.className = `av-die av-cols-7${large ? " av-die-lg" : ""}`;
  die.style.setProperty("--av-strip", `url("${foundry.utils.getRoute(DICE_DIR)}/d20.png")`);
  setDieFace(die, face);
  return die;
}


/* Drop one granted effect's name out of the spent-item icon that granted it
   and onto the die — e.g. marking Grape Mentats sends "Anxiolytic" falling in
   green from its icon at the top of the panel.

   The travel distance is measured now rather than written into the CSS: the
   gap between the spent row and the die depends on how many items were
   marked, and the die itself has already started collapsing the losing half
   of the pair by this point. Both boxes are read in the same frame and
   converted to panel-local coordinates, so the label lands on whatever the
   die's live position is.

   Everything here degrades to a no-op rather than throwing: a source whose
   icon is gone (a re-render mid-reveal) simply does not animate. */
function dropEffectLabel(panel, src) {
  if (!panel?.isConnected) return;
  const tile = panel.querySelector(
    `.av-gr-spent-item[data-item-name="${CSS.escape(src.item ?? "")}"]`
  );
  // Measure from the art, not the captioned tile, so the label falls out of
  // the icon instead of out from under its caption.
  const icon = tile?.querySelector(".av-gr-spent-icon") ?? tile;
  const die = panel.querySelector(".av-die.av-kept") ?? panel.querySelector(".av-die");
  if (!icon || !die) return;

  const panelBox = panel.getBoundingClientRect();
  const iconBox = icon.getBoundingClientRect();
  const dieBox = die.getBoundingClientRect();

  const label = document.createElement("span");
  // Positive value = advantage, negative = disadvantage. Same two colours the
  // details tab uses for these rows.
  label.className = `av-gr-drop ${Number(src.value) < 0 ? "malus" : "bonus"}`;
  label.textContent = String(src.effect ?? "").toUpperCase();
  label.style.left = `${iconBox.left - panelBox.left + iconBox.width / 2}px`;
  label.style.top = `${iconBox.bottom - panelBox.top + 2}px`;
  label.style.setProperty("--av-drop-dy", `${Math.max(24, dieBox.top + dieBox.height / 2 - iconBox.bottom)}px`);
  label.style.setProperty("--av-drop-ms", "900ms");

  icon.classList.add("av-gr-sending");
  setTimeout(() => icon.classList.remove("av-gr-sending"), 500);
  panel.appendChild(label);
  playSfx("ui_pipboy_select.wav");
  // Self-cleaning: the fill-mode holds the end frame, so the node has to go.
  setTimeout(() => label.remove(), 1000);
}

/* Every client animates a panel when its entry message arrives:
   big dice tumble → land untinted → discarded die fades away → the total
   counts up part by part (die, SPECIAL, SKILL, ITEMS...) → text and dice
   turn green/red against the DC. */
function applyEntryToOverlay(message, { animate = true } = {}) {
  const entry = flag(message, ENTRY_FLAG);
  if (!entry || overlay?.rollId !== entry.rollId) return;
  const panel = overlay.panels.get(entry.actorUuid);
  if (!panel || panel.dataset.rolled) return;
  panel.dataset.rolled = "1";
  panel.querySelector(".av-gr-controls").innerHTML = "";
  panel.querySelector(".av-gr-items").innerHTML = "";
  renderSpentRow(panel, entry.rollId, entry.actorUuid, entry.spent ?? []);

  const master = masterMessage(entry.rollId);
  const dc = master ? flag(master, MASTER_FLAG)?.dc ?? null : null;
  const total = Number(entry.total ?? 0);
  const pass = dc == null ? null : total >= dc;
  const diceEl = panel.querySelector(".av-gr-dice");
  const totalEl = panel.querySelector(".av-gr-total");
  const stepsEl = panel.querySelector(".av-gr-steps");
  const tint = pass === false ? "av-fail" : "av-pass";
  const dice = entry.dice ?? [];
  const kept = dice.find((d) => d.kept) ?? dice[0];
  const breakdown = entry.breakdown ?? [];

  const finish = () => {
    if (!panel.isConnected) return;
    totalEl.textContent = total;
    diceEl.querySelectorAll(".av-die.av-kept").forEach((d) => d.classList.add(tint));
    if (pass !== null) {
      panel.classList.add(pass ? "av-gr-passed" : "av-gr-failed");
      playSfx(pass ? "vats/ui_vats_ready.wav" : "ui_menu_cancel.wav");
    }
    refreshMasterCard(entry.rollId);
    // Once the LAST participant's reveal has played, every watching client
    // (roller and spectators alike) closes itself after a beat. Only on
    // live reveals — reopening a finished roll from the card stays open.
    if (animate) {
      const participants = master ? flag(master, MASTER_FLAG)?.participants ?? [] : [];
      if (participants.length && entriesFor(entry.rollId).length >= participants.length) {
        // Rescheduled by every reveal, so the window is always 3s after the
        // LAST one finishes — near-simultaneous rolls can't cut each other off.
        clearTimeout(closeTimer);
        closeTimer = setTimeout(() => {
          closeTimer = null;
          if (overlay?.rollId === entry.rollId) closeOverlay();
        }, 3000);
      }
    }
  };

  if (!animate) {
    for (const d of dice) {
      const die = d20Element(d.v, { large: true });
      die.classList.add("av-landed", "av-static", d.kept ? "av-kept" : "av-dropped");
      diceEl.appendChild(die);
    }
    finish();
    return;
  }

  // 1) Both dice tumble, then land on their faces (untinted).
  dice.forEach((d) => {
    const die = d20Element(d.v, { large: true });
    die.classList.add("av-rolling");
    diceEl.appendChild(die);
    setTimeout(() => {
      if (!die.isConnected) return;
      die.classList.remove("av-rolling");
      die.classList.add("av-landed", d.kept ? "av-kept" : "av-dropped");
      playSfx("ui_pipboy_clampon.wav");
      // 2) The losing die fades out.
      if (!d.kept) setTimeout(() => die.classList.add("av-fade-out"), 500);
    }, LAND_MS);
  });

  // 2b) Effect labels fall out of the item that granted them, onto the die.
  //     These are the named conditions behind the advantage/disadvantage —
  //     the reason one die was kept — so they play while the losing die is
  //     still fading, before the numbers start arriving. Sources with no
  //     item (conditions the actor already had) have nothing to fall from
  //     and are left to the details tab.
  const DROP_MS = 900;
  const DROP_STAGGER = 420;
  const drops = (entry.advSources ?? []).filter((s) => s?.item);
  let dropT = LAND_MS + 300;
  drops.forEach((src) => {
    setTimeout(() => dropEffectLabel(panel, src), dropT);
    dropT += DROP_STAGGER;
  });
  // Numbers wait for the last label to land, so the two never overlap.
  const afterDrops = drops.length ? dropT - DROP_STAGGER + DROP_MS : LAND_MS + 900;

  // 3) BG3 absorb: each modifier floats up into the kept die, morphing its
  //    face to the running result — clamped to the sheet's 1..20 — then the
  //    TRUE total appears over the dice a second later.
  const FLOAT_MS = 650;
  let shown = kept?.v ?? total;
  let t = Math.max(LAND_MS + 900, afterDrops);
  breakdown.forEach((part) => {
    setTimeout(() => {
      if (!panel.isConnected) return;
      const die = diceEl.querySelector(".av-die.av-kept");
      if (!die) return;
      const chip = document.createElement("span");
      chip.className = `av-gr-float ${part.value < 0 ? "malus" : "bonus"}`;
      chip.textContent = `${part.value > 0 ? "+" : ""}${part.value}`;
      die.appendChild(chip);
      playSfx("terminal/single/ui_hacking_charsingle_01.wav");
      setTimeout(() => {
        if (!die.isConnected) return;
        shown = Math.min(20, Math.max(1, shown + part.value));
        setDieFace(die, shown);
        chip.remove();
      }, FLOAT_MS - 140);
    }, t);
    t += FLOAT_MS + 160;
  });
  // 4) True total + verdict color, one beat after the last absorb.
  setTimeout(finish, t + 1000);
}

/* ---- Chat cards ----------------------------------------------------------- */

function tallyFor(data) {
  const messages = entriesFor(data.id);
  const results = data.participants.map((p) => {
    const msg = messages.find((m) => flag(m, ENTRY_FLAG).actorUuid === p.actorUuid);
    const e = msg ? flag(msg, ENTRY_FLAG) : null;
    // Fresh entries are still tumbling in the overlay — the card shows
    // rolling dice and withholds total/verdict until the same moment.
    const fresh = msg ? Date.now() - msg.timestamp < LAND_MS + 600 : false;
    return {
      ...p, rolled: !!e, fresh, total: e?.total ?? null, spent: e?.spent ?? [],
      dice: e?.dice ?? [], breakdown: e?.breakdown ?? [],
      mode: e?.mode ?? 1, advSources: e?.advSources ?? [],
      pass: e && !fresh && data.dc != null ? e.total >= data.dc : null
    };
  });
  const passed = results.filter((r) => r.pass === true).length;
  return { results, passed, rolled: results.filter((r) => r.rolled && !r.fresh).length, anyFresh: results.some((r) => r.fresh) };
}

/* Inline dice cell for a card row. Unrolled: rest-pose d20(s) reflecting
   the participant's live advantage toggle — one white die when undecided,
   two green for advantage, two red for disadvantage. Rolled: the actual
   faces, kept die tinted by outcome, dropped die ghosted. */
function cardDiceCell(data, r) {
  const cell = document.createElement("span");
  cell.className = "av-gr-card-dice";
  if (r.rolled && r.fresh) {
    // Suspense window: the faces exist but the card tumbles alongside the
    // overlay until LAND_MS elapses (a scheduled refresh reveals them).
    for (const d of r.dice) {
      const die = document.createElement("div");
      die.className = "av-die av-rolling";
      die.style.setProperty("--av-strip", `url("${foundry.utils.getRoute(DICE_DIR)}/d20.png")`);
      cell.appendChild(die);
    }
    return cell;
  }
  if (r.rolled) {
    const tint = r.pass === false ? "av-fail" : "av-pass";
    for (const d of r.dice) {
      const die = d20Element(d.v);
      die.classList.add("av-landed", "av-static", d.kept ? tint : "av-discarded");
      cell.appendChild(die);
    }
    return cell;
  }
  const state = getPanelState(data.id, r.actorUuid);
  const mode = state.advantageMode;
  const count = mode === 2 || mode === 3 ? 2 : 1;
  const tint = mode === 2 ? "av-pass" : mode === 3 ? "av-fail" : "";
  for (let i = 0; i < count; i++) {
    const die = document.createElement("div");
    die.className = `av-die av-waiting${tint ? ` ${tint}` : ""}`;
    die.style.setProperty("--av-strip", `url("${foundry.utils.getRoute(DICE_DIR)}/d20.png")`);
    cell.appendChild(die);
  }
  return cell;
}

/* The expandable math tab: pre-roll it previews the modifiers the actor
   would bring; post-roll it replays the recorded math to the final total. */
function detailsFor(data, r) {
  const wrap = document.createElement("div");
  wrap.className = "av-gr-card-details";
  let parts = r.breakdown;
  let dieLine = null;
  if (r.rolled) {
    const kept = r.dice.find((d) => d.kept) ?? r.dice[0];
    dieLine = `DIE ${kept?.v ?? "?"}${r.dice.length > 1 ? ` (${r.dice.map((d) => d.v).join(" / ")})` : ""}`;
  } else {
    const actor = fromUuidSync(r.actorUuid);
    const state = getPanelState(data.id, r.actorUuid);
    parts = actor ? buildBreakdown(actor, data.kind, data.key, state.ability, 0) : [];
  }
  const rows = [];
  if (dieLine) rows.push(`<div class="av-gr-detail-row die"><span>${esc(dieLine)}</span></div>`);
  // Advantage/disadvantage attribution: which EFFECT granted the extra die,
  // and which spent item delivered it (e.g. "Neuro-Stimulant (via Mentats)").
  if (r.rolled && r.mode !== 1) {
    const word = r.mode === 2 ? "ADVANTAGE" : "DISADVANTAGE";
    const cls = r.mode === 2 ? "adv" : "dis";
    if (r.advSources?.length) {
      for (const s of r.advSources) {
        rows.push(`<div class="av-gr-detail-row ${cls}"><span>${esc(word)}</span><span>${esc(s.effect)}${s.item ? ` (via ${esc(s.item)})` : ""}</span></div>`);
      }
    } else {
      rows.push(`<div class="av-gr-detail-row ${cls}"><span>${esc(word)}</span><span>chosen manually</span></div>`);
    }
  }
  if (r.rolled && r.spent?.length) {
    for (const s of r.spent) {
      rows.push(`<div class="av-gr-detail-row item"><span>ITEM USED</span><span>${esc(s.name)}</span></div>`);
    }
  }
  for (const p of parts) {
    rows.push(`<div class="av-gr-detail-row ${p.value < 0 ? "malus" : "bonus"}"><span>${esc(p.label)}</span><span>${p.value > 0 ? "+" : ""}${Number(p.value)}</span></div>`);
  }
  if (!rows.length) rows.push(`<div class="av-gr-detail-row"><span>No modifiers</span></div>`);
  if (r.rolled) rows.push(`<div class="av-gr-detail-row total"><span>TOTAL</span><span>${Number(r.total)}</span></div>`);
  wrap.innerHTML = rows.join("");
  return wrap;
}

function renderMasterCard(message, html) {
  const data = flag(message, MASTER_FLAG);
  if (!data) return;
  const { results, passed, rolled } = tallyFor(data);
  const done = rolled === data.participants.length;
  const card = document.createElement("div");
  card.className = "av-gr-card";
  card.innerHTML = `
    <div class="av-gr-card-head">
      <span class="av-gr-card-title">${esc(data.title)}</span>
      <span class="av-gr-card-sub">${esc(data.label)}${data.dc != null ? (data.hideDc && !game.user.isGM ? " · DC ███" : ` · DC ${Number(data.dc)}`) : ""}</span>
    </div>
    ${data.dc != null ? `<div class="av-gr-card-tally ${done ? (passed > 0 ? "pass" : "fail") : ""}">${passed} / ${data.participants.length} PASSED</div>` : `<div class="av-gr-card-tally">${rolled} / ${data.participants.length} ROLLED</div>`}
    <ul class="av-gr-card-rows"></ul>
    <div class="av-gr-card-hint">${data.status === "closed" || done ? "" : "Click to open the roll"}</div>`;
  const rowsEl = card.querySelector(".av-gr-card-rows");
  for (const r of results) {
    const li = document.createElement("li");
    li.className = r.pass === true ? "pass" : r.pass === false ? "fail" : "";
    const row = document.createElement("div");
    row.className = "av-gr-card-row";
    row.innerHTML = `
      <span class="av-gr-card-name" style="color: ${esc(r.color ?? "#ffb641")}">${esc(r.name)}</span>
      <span class="av-gr-card-spent">${r.spent.map((s) => `<img src="${esc(s.img)}" data-tooltip="${esc(s.tip ?? s.name)}">`).join("")}</span>
      <span class="av-gr-card-total">${r.rolled && !r.fresh ? Number(r.total) : ""}</span>`;
    row.insertBefore(cardDiceCell(data, r), row.querySelector(".av-gr-card-spent"));
    const details = detailsFor(data, r);
    details.hidden = true;
    // Name click expands the math tab; keep it from also reopening the overlay.
    row.querySelector(".av-gr-card-name").addEventListener("click", (ev) => {
      ev.stopPropagation();
      details.hidden = !details.hidden;
    });
    li.appendChild(row);
    li.appendChild(details);
    rowsEl.appendChild(li);
  }
  // GM: reset the whole roll, inside the card's top-right corner. Available
  // even once finished — that's when a redo is most likely wanted.
  if (game.user.isGM && data.status !== "closed") {
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "av-gr-reset av-gr-card-reset";
    reset.innerHTML = `<i class="fa-solid fa-rotate-left"></i>`;
    reset.dataset.tooltip = "Reset this roll for everyone";
    reset.addEventListener("click", (ev) => {
      ev.stopPropagation();
      resetRoll(data.id);
    });
    card.appendChild(reset);
  }

  // Once every participant has rolled the card is a record, not a door:
  // no reopening, no END ROLL — just the results and their breakdowns.
  if (data.status !== "closed" && !done) {
    card.classList.add("av-gr-joinable");
    card.addEventListener("click", () => openOverlay(data.id));
    if (game.user.isGM) {
      // END ROLL only matters while someone still owes a roll.
      const end = document.createElement("button");
      end.type = "button";
      end.className = "av-gr-card-end";
      end.textContent = "END ROLL";
      end.addEventListener("click", (ev) => {
        ev.stopPropagation();
        message.setFlag(PKG_ID, MASTER_FLAG, { ...data, status: "closed" });
      });
      card.appendChild(end);
    }
  }
  const content = html.querySelector(".message-content");
  content.innerHTML = "";
  content.appendChild(card);
}

function refreshMasterCard(rollId) {
  const master = masterMessage(rollId);
  if (master) ui.chat?.updateMessage(master);
}

/* ---- Registration --------------------------------------------------------- */

export function registerGroupRolls(moduleId = PKG_ID) {
  game.settings.register(moduleId, "groupRollSounds", {
    name: "Group Roll Sounds",
    hint: "Pip-Boy and V.A.T.S. sound effects for the cinematic group roll overlay.",
    scope: "client", config: true, type: Boolean, default: true
  });
  game.settings.register(moduleId, "groupRollPerkMap", {
    scope: "world", config: false, type: Object, default: {}
  });

  game.keybindings.register(moduleId, "closeGroupRoll", {
    name: "Close Group Roll Overlay",
    editable: [{ key: "Escape" }],
    precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY,
    onDown: () => {
      if (!overlay) return false;
      closeOverlay();
      return true;
    }
  });

  Hooks.on("createChatMessage", (message) => {
    if (!game.ready) return;
    const master = flag(message, MASTER_FLAG);
    if (master && Date.now() - message.timestamp < 10000) openOverlay(master.id);
    const entry = flag(message, ENTRY_FLAG);
    if (entry) {
      applyEntryToOverlay(message);
      refreshMasterCard(entry.rollId);
      // Second refresh once the suspense window closes: the card's rolling
      // dice land, the total appears, and the tally updates.
      setTimeout(() => refreshMasterCard(entry.rollId), LAND_MS + 700);
    }
  });

  // A reset deletes entry messages; every client rebuilds from that.
  Hooks.on("deleteChatMessage", (message) => {
    const entry = flag(message, ENTRY_FLAG);
    if (!entry) return;
    clearTimeout(closeTimer);
    closeTimer = null;
    resetPanel(entry.rollId, entry.actorUuid);
    refreshMasterCard(entry.rollId);
  });

  Hooks.on("updateChatMessage", (message, changes) => {
    const master = flag(message, MASTER_FLAG);
    if (master?.status === "closed" && overlay?.rollId === master.id) closeOverlay();
  });

  Hooks.on("renderChatMessageHTML", (message, html) => {
    if (flag(message, MASTER_FLAG)) renderMasterCard(message, html);
    // Entry rolls are data carriers — the master card presents them inline.
    if (flag(message, ENTRY_FLAG)) html.classList.add("av-gr-hidden-entry");
  });

  // GM conveniences: a first-class /groll chat command (shows up in the
  // command autocomplete) and a launch button above the chat input.
  foundry.applications.sidebar.tabs.ChatLog.CHAT_COMMANDS.groll = {
    rgx: /^\/groll\b\s*([^]*)/i,
    fn: () => {
      openRequestDialog();
      return false; // no chat message
    }
  };

  Hooks.on("renderChatLog", (app, element) => {
    if (!game.user?.isGM) return;
    const form = element.querySelector(".chat-form");
    if (!form || form.querySelector(".av-gr-launch")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "av-gr-launch";
    btn.innerHTML = `<i class="fa-solid fa-dice-d20"></i> Request Group Roll`;
    btn.addEventListener("click", () => openRequestDialog());
    form.insertAdjacentElement("afterbegin", btn);
  });
}

function openRequestDialog() {
  if (!game.user.isGM) return ui.notifications.warn("GM only");
  new GroupRollRequest().render(true);
}

/* The public surface. A module would hang this off `game.modules.get(id).api`;
   a system's equivalent is the namespace falloutzero.mjs already creates.

   It has to be attached in `setup`, NOT `init`: this file's top-level runs
   while falloutzero.mjs is still being evaluated, so its own init hook — which
   does `game.falloutzero = { applications, rollItemMacro }`, replacing the
   object wholesale — fires AFTER this one and would discard anything written
   earlier. `setup` runs after every init hook has completed. */
Hooks.once("setup", () => {
  game.falloutzero ??= {};
  game.falloutzero.groupRoll = {
    request: (opts) => createGroupRoll(opts),
    open: (rollId) => openOverlay(rollId),
    dialog: () => openRequestDialog()
  };
});

// Settings and keybindings must be registered during init.
Hooks.once("init", () => registerGroupRolls());
