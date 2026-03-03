import { CompositeActorConfig } from '@/game/actors/CompositeActor/CompositeActor';
import { PartyMember } from '../useParty';
import { nanoid } from 'nanoid';

export const RiskbreakerDefault: PartyMember = {
    id: nanoid(16),
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
        shieldBash: {
            name: 'Shield Bash',
        },
    },
    passives: {
        challengeTheOdds: {
            name: 'Challenge the Odds',
        },
    },
    stats: {
        hp: 125,
        speed: 10,
        strength: 6,
        dexterity: 5,
        balance: 10,
        intelligence: 2,
        wisdom: 7,
        lucidity: 1,
        fortitude: 8,
        current: {},
        mods: {},
        effects: {},
    },
};

export const AstrologianDefault: PartyMember = {
    id: nanoid(16),
    name: 'Astrologian',
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
        },
    },
    passives: {
        distillLight: {
            name: 'Distill Light',
        },
    },
    stats: {
        hp: 80,
        speed: 9,
        strength: 2,
        dexterity: 2,
        balance: 6,
        intelligence: 10,
        wisdom: 10,
        lucidity: 10,
        fortitude: 4,
        current: {},
        mods: {},
        effects: {},
    },
};
