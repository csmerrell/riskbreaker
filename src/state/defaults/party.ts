import { CompositeActorConfig } from '@/game/actors/CompositeActor/CompositeActor';
import { PartyMember } from '../useParty';
import { nanoid } from 'nanoid';
import { emptyStatMods } from '../battle/UnitStats';
import { ShieldChargeSkill } from '@/game/actions/Riskbreaker/ShieldCharge';
import { vec } from 'excalibur';
import { StaggerBashSkill } from '@/game/actions/Riskbreaker/StaggerBash';
import { AttackSkill } from '@/game/actions/Attack';

export const RiskbreakerDefault: PartyMember = {
    id: nanoid(16),
    alignment: 'ally',
    name: 'Riskbreaker',
    config: {
        battlePosition: 'left-1',
        leader: true,
    },
    appearance: {
        armor: 'riskbreakerLeathers',
        mainHand: 'sword',
        offHand: 'shield',
        hair: 'shortMessy',
    } as CompositeActorConfig,
    equipment: {
        mainHand: 'worn_scimitar',
        offHand: 'worn_buckler',
    },
    abilities: {
        staggerBash: {
            name: 'Stagger Bash',
            skillKey: 'staggerBash',
            hotkey: 'right.hotbarDLeft',
            spritePos: vec(1, 4),
            action: new StaggerBashSkill(),
        },
        shieldCharge: {
            name: 'Shield Charge',
            skillKey: 'shieldCharge',
            hotkey: 'right.hotbarFLeft',
            spritePos: vec(4, 6),
            action: new ShieldChargeSkill(),
        },
        attack: {
            name: 'Attack',
            skillKey: 'attack',
            hotkey: 'right.hotbarFDown',
            spritePos: vec(3, 9),
            action: new AttackSkill(),
        },
    },
    passives: {
        challengeTheOdds: {
            name: 'Challenge the Odds',
        },
    },
    stats: {
        hp: 125,
        currentHp: 75,
        speed: 24,
        strength: 6,
        dexterity: 5,
        balance: 10,
        intelligence: 2,
        wisdom: 7,
        lucidity: 1,
        fortitude: 8,
        mods: emptyStatMods(),
        effects: {},
    },
};

export const AstrologianDefault: PartyMember = {
    id: nanoid(16),
    name: 'Astrologian',
    alignment: 'ally',
    config: {
        battlePosition: 'left-2',
    },
    appearance: {
        armor: 'stonecallerRobe',
        hair: 'dragonBob',
    } as CompositeActorConfig,
    equipment: {
        mainHand: 'worn_tome',
    },
    abilities: {
        starflash: {
            name: 'Starflash',
            skillKey: 'starflash',
            hotkey: 'right.hotbarDLeft',
        },
        compress: {
            name: 'Compress',
            skillKey: 'compress',
            hotkey: 'right.hotbarFDown',
        },
        pulse: {
            name: 'Pulse',
            skillKey: 'pulse',
            hotkey: 'right.hotbarFRight',
        },
    },
    passives: {
        distillLight: {
            name: 'Distill Light',
        },
    },
    stats: {
        hp: 80,
        currentHp: 80,
        speed: 9,
        strength: 2,
        dexterity: 2,
        balance: 6,
        intelligence: 10,
        wisdom: 10,
        lucidity: 10,
        fortitude: 4,
        mods: emptyStatMods(),
        effects: {},
    },
};
