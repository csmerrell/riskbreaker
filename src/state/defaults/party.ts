import { CompositeActorConfig } from '@/game/actors/CompositeActor/CompositeActor';
import { PartyMember, SkillMetadata } from '../useParty';
import { nanoid } from 'nanoid';
import { emptyStatMods } from '../battle/UnitStats';
import { ShieldChargeSkill } from '@/game/actions/Riskbreaker/ShieldCharge';
import { vec } from 'excalibur';
import { StaggerBashSkill } from '@/game/actions/Riskbreaker/StaggerBash';
import { AttackSkill } from '@/game/actions/Attack';
import { HotbarActionComponent } from '@/game/actions/HotbarAction.component';

const RiskbreakerDefaultAbilities: Record<string, SkillMetadata> = {
    staggerBash: {
        name: 'Stagger Bash',
        skillKey: 'staggerBash',
        action: (() => {
            const skill = new StaggerBashSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconPos: vec(4, 1),
                    label: 'Stagger Bash',
                }),
            });
            return skill;
        })(),
    },
    shieldCharge: {
        name: 'Shield Charge',
        skillKey: 'shieldCharge',
        action: (() => {
            const skill = new ShieldChargeSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconPos: vec(6, 4),
                    label: 'Shield Charge',
                }),
            });
            return skill;
        })(),
    },
    attack: {
        name: 'Attack',
        skillKey: 'attack',
        action: (() => {
            const skill = new AttackSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconPos: vec(9, 3),
                    label: 'Attack',
                }),
            });
            return skill;
        })(),
    },
};
export const RiskbreakerDefault: PartyMember = {
    id: nanoid(16),
    alignment: 'ally',
    name: 'Riskbreaker',
    config: {
        battlePosition: 'left-1',
        leader: true,
    },
    appearance: {
        armor: 'bladesealerYoroi',
        mainHand: 'sword',
        offHand: 'shield',
        hair: 'sideSweep',
        hat: 'kitsune',
    } as CompositeActorConfig,
    equipment: {
        mainHand: 'worn_scimitar',
        offHand: 'worn_buckler',
        head: undefined,
        body: 'worn_leather_garb',
        accessory1: undefined,
        accessory2: undefined,
    },
    abilities: RiskbreakerDefaultAbilities,
    equippedAbilities: {
        dPad: {
            up: RiskbreakerDefaultAbilities.staggerBash.action,
        },
        faceButton: {
            down: RiskbreakerDefaultAbilities.attack.action,
            left: RiskbreakerDefaultAbilities.shieldCharge.action,
        },
    },
    stats: {
        hp: 125,
        currentHp: 75,
        speed: 22,
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

const AstrologianDefaultAbilities: Record<string, SkillMetadata> = {
    starflash: {
        name: 'Starflash',
        skillKey: 'starflash',
    },
    compress: {
        name: 'Compress',
        skillKey: 'compress',
    },
    pulse: {
        name: 'Pulse',
        skillKey: 'pulse',
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
        armor: 'moonfangAttire',
        hair: 'tightCurls',
    } as CompositeActorConfig,
    equipment: {
        mainHand: 'worn_tome',
    },
    abilities: AstrologianDefaultAbilities,
    equippedAbilities: {
        dPad: {
            down: AstrologianDefaultAbilities.starflash.action,
        },
        faceButton: {
            down: AstrologianDefaultAbilities.pulse.action,
            left: AstrologianDefaultAbilities.compress.action,
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
