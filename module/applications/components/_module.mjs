import DamageApplicationElement from './damage-application.mjs'
import AwardApplication from './award.mjs'
import GMApplication from './gm-screen.mjs'
import PerkListApplication from './perk-list.mjs'
import LevelUpApplication from './level-up.mjs'
import ChoosePerk from './choose-perk.mjs'
import CraftingBench from './crafting-bench.mjs'
import SelectUpgrade from './select-upgrade.mjs'
import ChemApplication from './chem-application.mjs'
import AbilityRoll from './ability-roll.mjs'


window.customElements.define('damage-application', DamageApplicationElement)

export {
    DamageApplicationElement,
    AwardApplication,
    GMApplication,
    PerkListApplication,
    LevelUpApplication,
    ChoosePerk,
    CraftingBench,
    SelectUpgrade,
    ChemApplication,
    AbilityRoll
}
