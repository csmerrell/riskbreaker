import { vec } from 'excalibur';
import { resources } from '@/resource';

import { BreakSkill } from '@/game/actions/Riskbreaker/Break';
import { HotbarActionComponent } from '@/game/actions/HotbarAction.component';

import { nanoid } from 'nanoid';
import { emptyStatMods } from '@/state/battle/UnitStats';

import type { CompositeActorConfig } from '@/game/actors/CompositeActor/CompositeActor';
import type { PartyMember, SkillMetadata } from '@/state/useParty';
import { StaggerBashSkill } from '@/game/actions/Riskbreaker/StaggerBash';
import { PressTheLineSkill } from '@/game/actions/Riskbreaker/PressTheLine';

const RiskbreakerDefaultAbilities = {
    staggerBash: {
        name: 'Stagger Bash',
        skillKey: 'staggerBash',
        action: (() => {
            const skill = new StaggerBashSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.riskbreaker,
                    iconPos: vec(5, 0),
                    label: 'Stagger Bash',
                }),
            });
            return skill;
        })(),
    },
    pressTheLine: {
        name: 'Press the Line',
        skillKey: 'pressTheLine',
        action: (() => {
            const skill = new PressTheLineSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.riskbreaker,
                    iconPos: vec(4, 0),
                    label: 'Press the Line',
                }),
            });
            return skill;
        })(),
    },
    break: {
        name: 'Break',
        skillKey: 'break',
        action: (() => {
            const skill = new BreakSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.riskbreaker,
                    iconPos: vec(0, 0),
                    label: 'Break',
                }),
            });
            return skill;
        })(),
    },
} as const satisfies Record<string, SkillMetadata>;

export const riskbreakerLoadout: PartyMember = {
    id: nanoid(16),
    alignment: 'ally',
    name: 'Riskbreaker',
    config: {
        battlePosition: 'left-1',
        leader: true,
    },
    appearance: {
        armor: 'riskbreakerLeathers',
        hair: 'shortMessy',
        mainHand: 'sword',
        offHand: 'shield',
    } as CompositeActorConfig,
    equipment: {
        mainHand: 'worn_scimitar',
    },
    abilities: RiskbreakerDefaultAbilities,
    equippedAbilities: {
        dPad: {},
        faceButton: {
            left: RiskbreakerDefaultAbilities.pressTheLine.action,
            up: RiskbreakerDefaultAbilities.staggerBash.action,
            down: RiskbreakerDefaultAbilities.break.action,
        },
    },
    stats: {
        hp: 620,
        currentHp: 520,
        speed: 22,
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
