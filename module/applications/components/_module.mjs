import DamageApplicationElement from './damage-application.mjs'
import AwardApplication from './award.mjs'
import PerkListApplication from './perk-list.mjs'
import LevelUpApplication from './level-up.mjs'

window.customElements.define('damage-application', DamageApplicationElement)

export { DamageApplicationElement, AwardApplication, PerkListApplication, LevelUpApplication }
