import DamageApplicationElement from './damage-application.mjs'
import AwardApplication from './award.mjs'
import PerkListApplication from './perk-list.mjs'
import LevelUpApplication from './level-up.mjs'
import ChoosePerk from './choose-perk.mjs'

window.customElements.define('damage-application', DamageApplicationElement)

export {
    DamageApplicationElement,
    AwardApplication,
    PerkListApplication,
    LevelUpApplication,
    ChoosePerk,
}
