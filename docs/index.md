# Riskbreaker - An open-world adventure rpg
A two person party with 5-lane turn based combat.

Each character gets: 
- 3 deep specializations

## Title Candidates
- Estelle Igni: To Light Fires in the Night Sky

## Specializations
- Riskbreaker
- Bladesealer
- Moonfang
- Soulsword
- Kohr Ascetic
- Spellblade
- Naturalist
- Shadeweaver
- Lifebinder
- Dramaturge
- Astrologian


## Equipment 

### Weapon Types
- Sword
    - Foil
    - Soulsword
- Gun
- Dagger
- Bow
- Glaive
- Whip
- Book

### Armors
- Body
- Helm
- Accessory

### Misc
- Shield
- Fan
- Lyre

## Spritesheet needs
- Idle (2 frame)
- Hurt (2 frame)
- Incapacitated (3 frame)
- Campfire (1 frame)
- Attack (Melee - 2 frame)
- Attack (Range - 1 frame)
- Chant (2 frame)
- Cast (1 frame)

## Combat Mechanics

### Lanes
There are only 5 spaces ("lanes") in each battle. All abilities target whole spaces.

### Charge Time
All action order is determined by action costs.

Each action has:
- Leading CT cost.
- Trailing CT cost. 

Action execution order is determined by CT cost. When an action is input, its order in the execution timeline is set.

A character acts again as soon as:
- The action executes.
- Its trailing CT completes.

### Offhands
All weapons have different offhand CT penalties. Certain items (eg - Daggers, Guns) have 0 offhand CT penalty.

Skills that require a specific weapon type suffer any offhand penalties if the required weapon is in the offhand.

Some weapons (eg - Glaives) can only be equipped in the mainhand, and they inflict their own CT penalty on offhand weapons.

### Battle Start
At battle start, order goes as follows: 
- Each enemy queues its action.
- Player inputs their actions in either order.