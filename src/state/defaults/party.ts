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
    skills: {
        shieldBash: {
            name: 'Shield Bash',
        },
    },
    passives: {
        challengeTheOdds: {
            name: 'Challenge the Odds',
        },
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
    skills: {
        starflash: {
            name: 'Starflash',
        },
    },
    passives: {
        distillLight: {
            name: 'Distill Light',
        },
    },
};
