import { CompositeActorConfig } from '@/game/actors/CompositeActor/CompositeActor';
import { PartyMember, SkillMetadata } from '../useParty';
import { nanoid } from 'nanoid';
import { emptyStatMods } from '../battle/UnitStats';
import { PressTheLineSkill } from '@/game/actions/Riskbreaker/PressTheLine';
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
    rallyStance: {
        name: 'Rally Stance',
        skillKey: 'rallyStance',
        action: (() => {
            const skill = new BreakSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.riskbreaker,
                    iconPos: vec(1, 1),
                    label: 'Rally Stance',
                }),
            });
            return skill;
        })(),
    },
    interceptorStance: {
        name: 'Interceptor Stance',
        skillKey: 'interceptorStance',
        action: (() => {
            const skill = new BreakSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.riskbreaker,
                    iconPos: vec(2, 1),
                    label: 'Interceptor Stance',
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
    allBreaker: {
        name: 'All Breaker',
        skillKey: 'allBreaker',
        action: (() => {
            const skill = new BreakSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.riskbreaker,
                    iconPos: vec(2, 0),
                    label: 'All Breaker',
                }),
            });
            return skill;
        })(),
    },
    allBolster: {
        name: 'All Bolster',
        skillKey: 'allBolster',
        action: (() => {
            const skill = new BreakSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.riskbreaker,
                    iconPos: vec(3, 0),
                    label: 'All Bolster',
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
};

const ArtificerDefaultAbilities: Record<string, SkillMetadata> = {
    infuse: {
        name: 'Infuse',
        skillKey: 'infuse',
        action: (() => {
            const skill = new BreakSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.artificer,
                    iconPos: vec(0, 0),
                    label: 'Infuse',
                }),
            });
            return skill;
        })(),
    },
    infusionCharge: {
        name: 'Infusion Charge',
        skillKey: 'infusionCharge',
        action: (() => {
            const skill = new BreakSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.artificer,
                    iconPos: vec(1, 0),
                    label: 'Infusion Charge',
                }),
            });
            return skill;
        })(),
    },
    manaDispersal: {
        name: 'Mana Dispersal',
        skillKey: 'manaDispersal',
        action: (() => {
            const skill = new BreakSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.artificer,
                    iconPos: vec(2, 0),
                    label: 'Mana Dispersal',
                }),
            });
            return skill;
        })(),
    },
    healthInfusion: {
        name: 'Health Infusion',
        skillKey: 'healthInfusion',
        action: (() => {
            const skill = new BreakSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.artificer,
                    iconPos: vec(3, 0),
                    label: 'Health Infusion',
                }),
            });
            return skill;
        })(),
    },
    screwBit: {
        name: 'Screw Bit',
        skillKey: 'screwBit',
        action: (() => {
            const skill = new BreakSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.artificer,
                    iconPos: vec(4, 0),
                    label: 'Screw Bit',
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
    dismantleWhack: {
        name: 'Dismantle Whack',
        skillKey: 'dismantleWhack',
        action: (() => {
            const skill = new BreakSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.artificer,
                    iconPos: vec(6, 0),
                    label: 'Dismantle Whack',
                }),
            });
            return skill;
        })(),
    },
    infuseLens: {
        name: 'Infuse Lens',
        skillKey: 'infuseLens',
        action: (() => {
            const skill = new BreakSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.artificer,
                    iconPos: vec(7, 0),
                    label: 'Infuse Lens',
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
    scrutinize: {
        name: 'Scrutinize',
        skillKey: 'scrutinize',
        action: (() => {
            const skill = new BreakSkill({
                hotbarActionComponent: new HotbarActionComponent({
                    iconSrc: resources.image.icons.skills.artificer,
                    iconPos: vec(9, 0),
                    label: 'Scrutinize',
                }),
            });
            return skill;
        })(),
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

const artificerEquippedTemplate = {
    dPad: {
        up: AstrologianDefaultAbilities.starflash.action,
        down: AstrologianDefaultAbilities.compress.action,
        left: RiskbreakerDefaultAbilities.rallyStance.action,
        right: ArtificerDefaultAbilities.healthInfusion.action,
    },
    faceButton: {
        up: ArtificerDefaultAbilities.siphonBit.action,
        down: ArtificerDefaultAbilities.infuse.action,
        left: ArtificerDefaultAbilities.screwBit.action,
        right: ArtificerDefaultAbilities.dismantleWhack.action,
    },
};

const riskbreakerEquippedTemplate = {
    dPad: {
        up: RiskbreakerDefaultAbilities.interceptorStance.action,
        down: RiskbreakerDefaultAbilities.challengeTheOdds.action,
        left: RiskbreakerDefaultAbilities.temperStance.action,
        right: RiskbreakerDefaultAbilities.allBolster.action,
    },
    faceButton: {
        left: RiskbreakerDefaultAbilities.pressTheLine.action,
        up: RiskbreakerDefaultAbilities.staggerBash.action,
        down: RiskbreakerDefaultAbilities.break.action,
        right: RiskbreakerDefaultAbilities.chainStrike.action,
    },
};

export const RiskbreakerDefault: PartyMember = {
    id: nanoid(16),
    alignment: 'ally',
    name: 'Artificer',
    config: {
        battlePosition: 'left-1',
        leader: true,
    },
    appearance: {
        armor: 'artificerCoveralls',
        hair: 'throwback_Brown',
        hat: 'goggles',
    } as CompositeActorConfig,
    equipment: {
        mainHand: 'artificer_scrawl',
        offHand: undefined,
        head: 'lifegiver_lens',
        body: 'mana_stitched_cloak',
        accessory1: 'vampire_focus',
        accessory2: 'ley_analyzer',
    },
    abilities: RiskbreakerDefaultAbilities,
    equippedAbilities: artificerEquippedTemplate,
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

export const AstrologianDefault: PartyMember = {
    id: nanoid(16),
    name: 'Bladesealer',
    alignment: 'ally',
    config: {
        battlePosition: 'mid',
    },
    appearance: {
        armor: 'bladesealerYoroi',
        hair: 'featherTail_Black',
        hat: 'kitsune',
        mainHand: 'glaive',
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
