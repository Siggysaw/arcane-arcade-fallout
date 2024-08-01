/**
 * Filter a collection of Items by type and return them sorted
 * @param {Array} collection The list of Items
 * @param {String} type The Type of item we're looking for
 * @returns The filtered, sorted list
 */
export const filter_items = async (
  collection,
  type,
  enrichDescription = true,
) => {
  let items = collection.filter((element) => {
    return element.type == type
  })

  if (enrichDescription) {
    for (const item of items)
      item.system.enrichedDescription = await enrich(item.system.description)
  }

  return items
}

/**
 * Filter a collection of Techniques by approach
 * @param {Array} collection The list of Techniques
 * @param {String} approach The Approach we want
 * @returns The items in the collection matching the specified approach
 */
export const filter_techniques = (collection, approach) => {
  return collection.filter(
    (element) =>
      element.type === 'technique' && element.system.approach === approach,
  )
}

export const filter_statuses = (collection, type) => {
  return collection.filter((e) => e.system.type === type)
}

export const onlyUnique = (array) => {
  return array.filter((value, index, array) => array.indexOf(value) === index)
}

/**
 * Enrich a HTML block
 * @param {String} html The HTML to be enriched
 * @param {Boolean} secrets Whether to render secret blocks
 * @returns
 */
export const enrich = async (html, secrets = false) => {
  if (html) {
    return await TextEditor.enrichHTML(html, {
      secrets: secrets,
      async: true,
    })
  } else {
    return html
  }
}

export const enrichInlineMove = async (match) => {
  const uuid = match[1]
  const item = await fromUuid(uuid)
  const itemName = match[2] ?? item.name
  const itemDesc = match[2] ?? item.name
  console.log("Checking for Compendium?")
  const container = document.createElement('div')
  container.className = 'inline-item'
  let html = ''
  if (item) {
    html = `<h3>@UUID[${uuid}]{${itemName}}</h3>${item.system.description}`
  } else {
    html = `@UUID[${uuid}]{${itemName}}`
  }

  container.innerHTML = await TextEditor.enrichHTML(html, { async: true })
  return container
}

export const enrichInlineTechnique = async (match) => {
  const uuid = match[1]
  const item = await fromUuid(uuid)
  const itemName = match[2] ?? item.name
  console.log("Checking Compenidum 2")
  const container = document.createElement('div')
  container.className = 'inline-item'
  let html = ''
  if (item) {
    html = `<h3>@UUID[${uuid}]{${itemName}}<br /><small class="fire-dark">${game.i18n.localize(
      `legends.techniques.approaches.${item.system.approach}`,
    )}</small></h3>`
    html += item.system.description
  } else {
    html = `@UUID[${uuid}]{${itemName}}`
  }

  container.innerHTML = await TextEditor.enrichHTML(html, { async: true })
  return container
}

export const enrichNpc = async (match) => {
  const uuid = match[1]
  const npc = await fromUuid(uuid)
  console.log("Checking Compenidum 3")
  const npcName = match[2] ?? npc.name

  const container = document.createElement('div')
  container.className = 'inline-npc'
  let html = `<h3>@UUID[${uuid}]{${npcName}}</h3>`

  if (npc && npc.type === 'npc') {
    html = `<img src="${npc.img}" class="portrait" />`
    html += `<h3>@UUID[${uuid}]{${npcName}}</h3>`
    html += await enrich(npc.system.description)
    html += '<div class="boxout">'
    html += `<p><strong class="title">${game.i18n.localize(
      'legends.actor-sheet.npc.drive',
    )}:</strong> ${npc.system.drive}</p>`

    html += `<p><strong class="title">${game.i18n.localize(
      'legends.principle.title',
    )}:</strong> `
    html += npc.system.principle
      ? `${npc.system.principleName} (${npc.system.principle.max})`
      : `<em>${game.i18n.localize('legends.common.none')}</em>`
    html += `</p>`

    html += `<p><strong class="title">${game.i18n.localize(
      'legends.items.types.condition',
    )}:</strong> `
    html +=
      npc.system.conditionNames.length > 0
        ? npc.system.conditionNames.join(', ')
        : `<em>${game.i18n.localize('legends.common.none')}</em>`
    html += '</p>'

    html += `<p><strong class="title">${game.i18n.localize(
      'legends.actor-sheet.fatigue',
    )}:</strong> `
    for (let f = 1; f <= npc.system.fatigue.max; f++) {
      html += '<span class="fatigue-box"></span>'
      if (f % 5 == 0 && f !== npc.system.fatigue.max) html += '&nbsp;&nbsp;'
    }
    html += '</p>'

    html += `<p><strong class="title">${game.i18n.localize(
      'legends.items.types.technique',
    )}:</strong> `
    html +=
      npc.system.techniqueUUIDs.length > 0
        ? npc.system.techniqueUUIDs
            .map((technique) => {
              return `@UUID[${technique}]`
            })
            .join(', ')
        : `<em>${game.i18n.localize('legends.common.none')}</em>`

    html += '</p>'
    html += '</div>'
  }

  container.innerHTML = await TextEditor.enrichHTML(html, { async: true })
  return container
}
