export function allowMovement(token, notify = true) {
    let blockCombat = function (token) {
        let curCombat = game.combats.active;

        if (curCombat && curCombat.started) {
            let entry = curCombat.combatant;

            return !(entry.tokenId == token.id || (curCombat.previous.tokenId == token.id));
        }

        return true;
    }

    if (!game.user.isGM && token != undefined) {
        if (blockCombat(token)) {
            //prevent the token from moving
            if (notify && (!(token._movementNotified ?? false))) {
                ui.notifications.warn("Movement is based on combat turn, it's currently not your turn");
                token._movementNotified = true;
                setTimeout(function (token) {
                    delete token._movementNotified;
                }, 2000, token);
            }
            return false;
        }
    }

    return true;
}