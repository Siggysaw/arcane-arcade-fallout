import DamageApplicationElement from './damage-application.mjs'
import AwardApplication from './award.mjs'
import GMScreen from './gm-screen.mjs'
import PerkListApplication from './perk-list.mjs'
import LevelUpApplication from './level-up.mjs'
import ChoosePerk from './choose-perk.mjs'
import CraftingBench from './crafting-bench.mjs'


window.customElements.define('damage-application', DamageApplicationElement)

export {
    DamageApplicationElement,
    AwardApplication,
    GMScreen,
    PerkListApplication,
    LevelUpApplication,
    ChoosePerk,
    CraftingBench,
}
