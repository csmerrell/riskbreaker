# Spellblade
One of the "Matron's Blades." To be named a blade is to receive a blade forged by the matron, name and blessing engraved.

(Matron is a bear forging swords.)

Only 3 weapons can be received in the entire game. Weak on its own, the matron's blade draws strength from nature in action. The 3 blades are built not for strength, but for character.  

## Spellblades
Spellblade damage aggregates all stats (not just str/mag).

- Forteuse
    - +8% dmg reduction / investiture lvl
    - +12% max hp / investiture lvl
    - +1% regen / investiture lvl
- Agylle
    - +4% CT reduction / investiture lvl
- Enspere
    - (Party) +2 all stats (except agl) per investiture lvl.

## Skills
- (Basic) Investing Strike 
    - (Constraint) Restricts weapon selection to only spellblades.
    - Draws a buff from a ley locus, then attacks
    - Investiture caps @ skill lvl
    - Loci buffs:
        - General: +2 all stats / investiture
        - Wood: 1% Regen / investiture 
        - Rock: + Barrier
        - Water: Splash (AoE)
        - Crystal: Mirror all stat boosts to ally
        - Heat: +5% dmg boost
        - Air: +8% eva boost
    - [HiddenLinks]:
        - [Locus Infusion]
            - At `4 - (floor(0, locusInfusion_lvl - 1))` investiture lvl, infuse a random locus
- Draw Investiture
    - (Start of battle): Immediately draw investiture to `Floor(1, investingStrike_lvl - 1)`.
    - Cooldown: 2
    - On Burn:
        - Execute 2 divesting strikes
- Divesting Strike
    - Attack & Consume 1 level of investiture.
        - Wood: Apply 1 crown laurel to all party members (heals 25% if below 80% HP)
        - Rock: 50% dmg reduction next (n) hits received (any party member)
        - Water: Crashing Tide (Replace strike w/ 150% dmg split between all enemies)
        - Crystal: Reflect 25% dmg from 3 hits received (any pt member)
- Ley Link
    - Follow up ally's next 2 attacks with Divesting Strikes.
    - 80% CT cost
- Open Channel
    - Always Burns
    - Opens a 2nd investiture channel for the remainder of battle.
        -  Draws 1 level of investiture.
    - If 2nd investiture drops to 0, the channel is locked.
- Matron's Embrace
    - +1 Water/Wood investiture
    - Single target heal
    - +2% regen
    - +50% stagger barrier
- Matron's Protection
    - +1 Rock/Crystal investiture
    - 25% dmg reduction 3 hits
    - 75% CT cost
- Matron's Claws
    - +1 Heat/Air investiture
    - Adds def-piercing follow-up damage to next 3 attacks
        - `FLOOR(5, SUM(stats) / numStats) * INVESTITURE_LV`
    - 25% CT cost

## Deferred Skills
- Matron's Plea
    - `FLOOR(2, -4 + (1 * triggeredEffect))` Cooldown
    - Grow 2 known, missing ley loci
    - Full heal each ally below 50% health
    - +20% all-enemy stagger per investiture level
    - +1 all investiture (Can exceed skill level)
    - Burn: Max out all investiture