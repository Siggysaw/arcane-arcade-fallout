export function registerSystemSettings() {
    game.settings.register(CONFIG.FALLOUTZERO.systemId, 'MigrationVersion', {
        name: 'Migration Version',
        hint: 'The current migration version of the system',
        scope: 'world',
        config: false,
        type: String,
        default: '0.0.0',
    })
    game.settings.register('core', 'CarryLoad', {
        name: 'Exact Carry Load Calculator',
        hint: 'Checked: 23 x 10mm ammo = 2.3 load | Unchecked: 23 x 10mm ammo = 2 load',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
        requiresReload: true,
    })
    game.settings.register('core', 'CapsLoad', {
        name: 'Do Caps Have Load?',
        hint: 'Checked: 50 caps is 1 Load',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        requiresReload: true,
    })
    game.settings.register('core', 'AmmoLoad', {
        name: 'Does Ammo Have Load?',
        hint: 'Checked: 10 Ammo is 1 load',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        requiresReload: true,
    })
    game.settings.register('core', 'JunkLoad', {
        name: 'Does Junk Have Load?',
        hint: 'If Checked: 5 Junk is 1 Load, 10 Material is 1 Load',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        requiresReload: true,
    })
    game.settings.register('core', 'Sheet-Color', {
        name: 'Your Sheet Theme Color',
        hint: 'An override for sheet color. Green = #1bff80 / Amber = #ffb641 or you can use custom hex or just say "red" or "green" Blank puts it back to User Color being used.',
        scope: 'client',
        config: true,
        type: String,
        default: '',
        requiresReload: true,
    })
    game.settings.register('core', 'VaultTec', {
        name: 'Use Vault-Tec Colors',
        hint: 'An Alternate Color Scheme Sponsored By Vault Tec!',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        requiresReload: true,
    })
    game.settings.register('core', 'DeductMovementAPInCombat', {
        name: 'Auto deduct movement AP',
        hint: 'Automatically reduces AP based on character movement when in combat. [Requires Elevation Ruler]',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        requiresReload: true,
    })
    game.settings.register('core', 'AutoRecycleAP', {
        name: 'Auto recycle AP',
        hint: 'Automatically recycles AP when combat round advances',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        requiresReload: true,
    })
    game.settings.register('core', 'DamageChatCard', {
        name: 'Damage chat card',
        hint: 'Show chat card for GM and actor user when actor takes damage',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        requiresReload: true,
    })
}

export function registerHbsHelpers() {
    Handlebars.registerHelper('isVaultTec', function (options) {
        if (game.settings.get('core', 'VaultTec')) {
            return options.fn(this)
        }
        return options.inverse(this)
    })

    Handlebars.registerHelper('toLowerCase', function (str) {
        return str.toLowerCase()
    })

    Handlebars.registerHelper('Reload', function (v1) {
        if (v1.includes("Manual Reload")) {
            return 1
        }
        if (v1.includes("Quick Reload")) {
            return 4
        }
        return 6
    })

    Handlebars.registerHelper('log', function (v1) {
        console.log(v1)
    })

    Handlebars.registerHelper('setChecked', function (value, test) {
        if (value == undefined) return ''
        return value == test ? 'checked' : ''
    })

    // If Player is a GM
    Handlebars.registerHelper('GM', function (options) {
        if (game.user.role === 4) {
            return options.fn(this)
        }
        return options.inverse(this)
    })

    // If Character is a NPC
    Handlebars.registerHelper('NPC', function (actorType, options) {
        if (actorType == 'npc') {
            return options.fn(this)
        }
        return options.inverse(this)
    })
    // If Vault Tec Sheets
    Handlebars.registerHelper('VaultTec', function (actorType, options) {
        if (game.settings.get('core', 'VaultTec')) {
            return options.fn(this)
        }
        return options.inverse(this)
    })
    // If Value equals something
    Handlebars.registerHelper('Check', function (v1, v2, options) {
        if (v1 == v2) {
            return options.fn(this)
        }
        return options.inverse(this)
    })

    Handlebars.registerHelper('IsIn', function (item, list) {
        if (list.includes(item)) {
            return true
        }
        return false
    })

    // Greater Than or Equal
    Handlebars.registerHelper('GreaterThan', function (v1, v2, options) {
        if (v1 >= v2) {
            return options.fn(this)
        }
        return options.inverse(this)
    })
    // Less Than
    Handlebars.registerHelper('LesserThan', function (v1, v2, options) {
        if (v1 < v2) {
            return options.fn(this)
        }
        return options.inverse(this)
    })

    // Less Than
    Handlebars.registerHelper('DifferentFrom', function (v1, v2, options) {
        if (v1 != v2) {
            return options.fn(this)
        }
        return options.inverse(this)
    })

    // Sum Of
    Handlebars.registerHelper('Sum', function (v1, v2) {
        let sum = Number(v1) + Number(v2)
        return sum
    })
    Handlebars.registerHelper('Sum3', function (v1, v2, v3) {
        let sum = Number(v1) + Number(v2) + Number(v3)
        return sum
    })
    Handlebars.registerHelper('Subtract', function (v1, v2) {
        let subtract = Number(v1) - Number(v2)
        return subtract
    })
    Handlebars.registerHelper('Skills', function (v1, v2, v3, v4) {
        let sum = Number(v1) + Number(v2) + Number(v3) - Number(v4)
        return sum
    })
    //division
    Handlebars.registerHelper('LckMod', function (v1, v2) {
        let div = Math.floor(Number(v1) / Number(v2))
        if (div < -1) {
            div = -1
        }
        return div
    })
    //multiplication
    Handlebars.registerHelper('Multiply', function (v1, v2) {
        let mathResult = Math.floor(Number(v1) * Number(v2))
        return mathResult
    })

    Handlebars.registerHelper('NotEqual', function (v1, v2) {
        return v1 !== v2
    })

    Handlebars.registerHelper('Equals', function (v1, v2) {
        return v1 === v2
    })

    //Format a Compendium Link for a given title
    Handlebars.registerHelper('FormatCompendium', function (itemName, compendium) {
        let compendiumObject, myItem
        try {
            compendiumObject = game.packs.find((u) => u.metadata.name == compendium)
            myItem = compendiumObject.tree.entries.find(
                (u) => u.name.toLowerCase() == itemName.toLowerCase(),
            )
            if (myItem) {
                return `<a class="content-link"  draggable="true" data-link data-uuid="Compendium.arcane-arcade-fallout.${compendium}.Item.${myItem._id}" 
            data-id="${myItem._id}" data-type="Item" data-pack="arcane-arcade-fallout.${compendium}">
            ${itemName}</a>`
            } else {
                return `${itemName}`
            }
        } catch {
            return `${itemName}`
        }
    })

    Handlebars.registerHelper('SpecialKeyToLabel', function (key) {
        return FALLOUTZERO.abilities[key].label || ''
    })
}