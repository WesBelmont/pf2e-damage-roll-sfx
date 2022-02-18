const MODULE_NAME = 'pf2e-damage-roll-sfx';

Hooks.on('init', () => {
    game.settings.register(MODULE_NAME, 'bludgeoning-success', {
        name: 'Bludgeoning Hit SFX',
        scope: "world",
        config: true,
        default: "modules/pf2e-damage-roll-sfx/sounds/bludgeoning-hit.ogg",
        filePicker: 'audio'
    });
    game.settings.register(MODULE_NAME, 'bludgeoning-criticalSuccess', {
        name: 'Bludgeoning Critical Hit SFX',
        scope: "world",
        config: true,
        default: "modules/pf2e-damage-roll-sfx/sounds/bludgeoning-crit.ogg",
        filePicker: 'audio'
    });
    game.settings.register(MODULE_NAME, 'piercing-success', {
        name: 'Piercing Hit SFX',
        scope: "world",
        config: true,
        default: "modules/pf2e-damage-roll-sfx/sounds/piercing-hit.ogg",
        filePicker: 'audio'
    });
    game.settings.register(MODULE_NAME, 'piercing-criticalSuccess', {
        name: 'Piercing Critical Hit SFX',
        scope: "world",
        config: true,
        default: "modules/pf2e-damage-roll-sfx/sounds/piercing-crit.ogg",
        filePicker: 'audio'
    });
    game.settings.register(MODULE_NAME, 'slashing-success', {
        name: 'Slashing Hit SFX',
        scope: "world",
        config: true,
        default: "modules/pf2e-damage-roll-sfx/sounds/slashing-hit.ogg",
        filePicker: 'audio'
    });
    game.settings.register(MODULE_NAME, 'slashing-criticalSuccess', {
        name: 'Slashing Critical Hit SFX',
        scope: "world",
        config: true,
        default: "modules/pf2e-damage-roll-sfx/sounds/slashing-crit.ogg",
        filePicker: 'audio'
    });
    game.settings.register(MODULE_NAME, 'miss', {
        name: 'Miss SFX',
        scope: "world",
        config: true,
        default: "modules/pf2e-damage-roll-sfx/sounds/miss.ogg",
        filePicker: 'audio'
    });
    game.settings.register(MODULE_NAME, 'crit-miss', {
        name: 'Critical Miss SFX',
        scope: "world",
        config: true,
        default: "modules/pf2e-damage-roll-sfx/sounds/crit-miss.ogg",
        filePicker: 'audio'
    });
    game.settings.register(MODULE_NAME, 'spell-divine', {
        name: 'Divine Spell Damage SFX',
        scope: "world",
        config: true,
        default: "modules/pf2e-damage-roll-sfx/sounds/spell-divine.ogg",
        filePicker: 'audio'
    });
    game.settings.register(MODULE_NAME, 'spell-arcane', {
        name: 'Arcane Spell Damage SFX',
        scope: "world",
        config: true,
        default: "modules/pf2e-damage-roll-sfx/sounds/spell-arcane.ogg",
        filePicker: 'audio'
    });
    game.settings.register(MODULE_NAME, 'spell-occult', {
        name: 'Occult Spell Damage SFX',
        scope: "world",
        config: true,
        default: "modules/pf2e-damage-roll-sfx/sounds/spell-occult.ogg",
        filePicker: 'audio'
    });
    game.settings.register(MODULE_NAME, 'spell-primal', {
        name: 'Primal Spell Damage SFX',
        scope: "world",
        config: true,
        default: "modules/pf2e-damage-roll-sfx/sounds/spell-primal.ogg",
        filePicker: 'audio'
    });
    // game.settings.register(MODULE_NAME, 'ranged-success', {
    //     name: 'Ranged Hit SFX',
    //     scope: "world",
    //     config: true,
    //     default: "modules/pf2e-damage-roll-sfx/sounds/ranged-hit.ogg",
    //     filePicker: 'audio'
    // });
    // game.settings.register(MODULE_NAME, 'ranged-criticalSuccess', {
    //     name: 'Ranged Critical Hit SFX',
    //     scope: "world",
    //     config: true,
    //     default: "modules/pf2e-damage-roll-sfx/sounds/ranged-crit.ogg",
    //     filePicker: 'audio'
    // });
})

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)]
}

function applyDamageSFX(message, flags) {
    //check if the message is a damage card
    if(!flags?.damageRoll) {
        return
    }
    //set damage types
    let damageType = []
    for (const key in flags.damageRoll.types) {
        if (key == 'slashing' || key == 'piercing' || key == 'bludgeoning') {
            damageType.push(key)
        }
    }
    message.data.sound = game.settings.get(MODULE_NAME, `${randomChoice(damageType)}-${flags.damageRoll.outcome}`)
    
}

function applySpellSFX(message, flags) {
    //only continue if if the message is a spell with a roll
    if (flags.origin?.type !== 'spell' || message.data.roll == undefined) {
        return
    }
    //if the card is an attack that misses, play the miss sfx
    //attack roll has flags.context.outome and type:'spell-attack-roll'
    if (flags?.context?.type == 'spell-attack-roll') {
        if (flags.context.outcome == 'failure') {
            message.data.sound = game.settings.get(MODULE_NAME, 'miss')
        }
        if (flags.context.outcome == 'criticalFailure') {
            message.data.sound = game.settings.get(MODULE_NAME, 'crit-miss')
        }
        return
    }
    const spellTags = ['arcane', 'divine', 'occult', 'primal']
    const spellType = []
    spellTags.forEach(element => {
        if (message.data.flavor.includes(element)){
            spellType.push(element)
        }
    })
    if (spellType.length == 0) {return}
    message.data.sound = game.settings.get(MODULE_NAME, `spell-${randomChoice(spellType)}`)
}

function removeAttackSFX(message, flags) {
    if (flags?.context?.type != 'attack-roll') {
        return
    }
    const outcome = flags.context.outcome
    if (outcome === undefined) {
        return
    }
    //disable default attack sound if the damage is going to be rolled immediately
    if (game.settings.settings.get('xdy-pf2e-workbench.autoRollDamageForStrike')) {
        if (game.settings.get('xdy-pf2e-workbench', 'autoRollDamageForStrike')) {
            if (outcome === 'success' || outcome === 'criticalSuccess') {
                message.data.sound = ''
                return
            }
        }
    }
    if (outcome === 'failure') {
        message.data.sound = game.settings.get(MODULE_NAME, 'miss')
        return
    }
    if (outcome === 'criticalFailure') {
        message.data.sound = game.settings.get(MODULE_NAME, 'crit-miss')
        return
    }
}

Hooks.on('createChatMessage', (message) => {
    let flags = message.data.flags.pf2e
    
    removeAttackSFX(message, flags)
    applyDamageSFX(message, flags)
    applySpellSFX(message, flags)
});