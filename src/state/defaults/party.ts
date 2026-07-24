import { CompositeActorConfig } from '@/game/actors/CompositeActor/CompositeActor';
import { PartyMember, SkillMetadata } from '../useParty';
import { nanoid } from 'nanoid';
import { emptyStatMods } from '../battle/UnitStats';
import { ShieldChargeSkill } from '@/game/actions/Riskbreaker/ShieldCharge';
import { vec } from 'excalibur';
import { StaggerBashSkill } from '@/game/actions/Riskbreaker/StaggerBash';
import { BreakSkill } from '@/game/actions/Riskbreaker/Break';
import { HotbarActionComponent } from '@/game/actions/HotbarAction.component';
import { resources } from '@/resource';
import { CompressSkill } from '@/game/actions/Astrologian/Compress';

const RiskbreakerDefaultAbilities: Record<string, SkillMetadata> = {
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
    shieldCharge: {
        name: 'Shield Charge',
        skillKey: 'shieldCharge',
        action: (() => {
            const skill = new ShieldChargeSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.riskbreaker,
                    iconPos: vec(4, 0),
                    label: 'Shield Charge',
                }),
            });
            return skill;
        })(),
    },
    temperStance: {
        name: 'Temper Stance',
        skillKey: 'temperStance',
        action: (() => {
            const skill = new BreakSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.riskbreaker,
                    iconPos: vec(0, 1),
                    label: 'Temper Stance',
                }),
            });
            return skill;
        })(),
    },
    challengeTheOdds: {
        name: 'Challenge the Odds',
        skillKey: 'challengeTheOdds',
        action: (() => {
            return new BreakSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.riskbreaker,
                    iconPos: vec(1, 0),
                    label: 'Challenge the Odds',
                }),
            });
        })(),
    },
    chainStrike: {
        name: 'Chain Strike',
        skillKey: 'chainStrike',
        action: (() => {
            const skill = new BreakSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.riskbreaker,
                    iconPos: vec(6, 0),
                    label: 'Chain Strike',
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
    siphonBit: {
        name: 'Siphon Bit',
        skillKey: 'siphonBit',
        action: (() => {
            const skill = new BreakSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.artificer,
                    iconPos: vec(5, 0),
                    label: 'Siphon Bit',
                }),
            });
            return skill;
        })(),
    },
    infuseAir: {
        name: 'Infuse Air',
        skillKey: 'infuseAir',
        action: (() => {
            const skill = new BreakSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.artificer,
                    iconPos: vec(8, 0),
                    label: 'Infuse Air',
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
        hair: 'poofyBob',
        hat: 'plumedHat',
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
            down: RiskbreakerDefaultAbilities.temperStance.action,
            left: RiskbreakerDefaultAbilities.challengeTheOdds.action,
            right: RiskbreakerDefaultAbilities.infuseAir.action,
        },
        faceButton: {
            down: RiskbreakerDefaultAbilities.break.action,
            right: RiskbreakerDefaultAbilities.chainStrike.action,
            left: RiskbreakerDefaultAbilities.shieldCharge.action,
            up: RiskbreakerDefaultAbilities.siphonBit.action,
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
        action: (() => {
            const skill = new CompressSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.default,
                    iconPos: vec(4, 4),
                    label: 'Starflash',
                }),
            });
            return skill;
        })(),
    },
    compress: {
        name: 'Compress',
        skillKey: 'compress',
        action: (() => {
            const skill = new CompressSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.default,
                    iconPos: vec(6, 1),
                    label: 'Compress',
                }),
            });
            return skill;
        })(),
    },
    pulse: {
        name: 'Pulse',
        skillKey: 'pulse',
        action: (() => {
            const skill = new CompressSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.default,
                    iconPos: vec(5, 0),
                    label: 'Pulse',
                }),
            });
            return skill;
        })(),
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
