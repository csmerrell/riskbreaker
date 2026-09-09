import { vec } from 'excalibur';
import { resources } from '@/resource';

import { CompressSkill } from '@/game/actions/Astrologian/Compress';
import { HotbarActionComponent } from '@/game/actions/HotbarAction.component';

import { nanoid } from 'nanoid';
import { emptyStatMods } from '@/state/battle/UnitStats';

import type { CompositeActorConfig } from '@/game/actors/CompositeActor/CompositeActor';
import type { PartyMember, SkillMetadata } from '@/state/useParty';

const AstrologianDefaultAbilities: Record<string, SkillMetadata> = {
    compress: {
        name: 'Compress',
        skillKey: 'compress',
        action: (() => {
            const skill = new CompressSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.astrologian,
                    iconPos: vec(2, 0),
                    label: 'Compress',
                }),
            });
            return skill;
        })(),
    },
};

export const astrologianLoadout: PartyMember = {
    id: nanoid(16),
    name: 'Astrologian',
    alignment: 'ally',
    config: {
        battlePosition: 'left-2',
    },
    appearance: {
        armor: 'astrologianCloak',
        hair: 'tightCurls',
        hat: 'sageHat',
    } as CompositeActorConfig,
    equipment: {
        mainHand: 'worn_tome',
    },
    abilities: AstrologianDefaultAbilities,
    equippedAbilities: {
        dPad: {},
        faceButton: {
            left: AstrologianDefaultAbilities.compress.action,
        },
    },
    stats: {
        hp: 620,
        currentHp: 350,
        speed: 9,
        strength: 48,
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
