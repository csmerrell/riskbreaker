import { useExploration } from '@/state/useExploration';
import { LaneKey, useParty } from '@/state/useParty';
import { Component, Entity, vec, Vector } from 'excalibur';
import { KeyedAnimationActor } from '../actors/KeyedAnimationActor';
import { CompositeActor } from '../actors/CompositeActor/CompositeActor';
import { BattleUnit, useBattle } from '@/state/battle/useBattle';
import { useGameContext } from '@/state/useGameContext';
import { getScale } from '@/lib/helpers/screen.helper';
import { ref } from 'vue';
import { addMenu, removeMenu } from '@/state/ui/useMenuRegistry';
import TargetIndicator from '@/ui/components/menus/TargetIndicator.vue';
import { registerInputListener, suspendInputs, unregisterInputListener } from '../input/useInput';

type AreaType = 'single' | 'area_adjacent' | 'all';

type TargetOptionsBase = {
    targetTypes: ('ally' | 'enemy')[];
    targetPriority: 'ally' | 'enemy';
    areaType: 'single' | 'area_adjacent' | 'all';
};

type AreaTargetOptions = TargetOptionsBase & {
    areaType: 'area_adjacent';
    range: number;
};

type NonAreaTargetOptions = {
    areaType: Exclude<AreaType, 'area_adjacent'>;
};

export type ActionTargetOptions = TargetOptionsBase & (AreaTargetOptions | NonAreaTargetOptions);

export function isAreaTargetActionOpts(
    actionOpts: ActionTargetOptions,
): actionOpts is AreaTargetOptions {
    return actionOpts.areaType === 'area_adjacent';
}

export class TargetComponent extends Component {
    constructor(public opts: ActionTargetOptions) {
        super();
    }

    onAdd(_owner: Entity): void {}

    private listeners: string[] = [];
    public async promptTarget() {
        const { battleManager } = useExploration().getExplorationManager();
        await battleManager.cameraManager!.restoreCenter();

        const targetLanes = this.getTargetLanes();
        let currentLaneIdx = 0;

        // Apply shader to initial lane
        battleManager.setTargetedLane(targetLanes[currentLaneIdx]);

        const anchor = ref(this.getIndicatorAnchor(targetLanes[currentLaneIdx]));
        const indicator = addMenu(TargetIndicator, {
            position: anchor,
            props: {
                type: 'arrow',
                direction: 'down',
                blink: true,
                scale: getScale(),
            },
        });

        return new Promise<LaneKey>((resolve, reject) => {
            this.listeners = [
                registerInputListener(() => {
                    currentLaneIdx = currentLaneIdx - 1;
                    if (currentLaneIdx < 0) {
                        currentLaneIdx = targetLanes.length - 1;
                    }
                    battleManager.setTargetedLane(targetLanes[currentLaneIdx]);
                    anchor.value = this.getIndicatorAnchor(targetLanes[currentLaneIdx]);
                }, ['menu_left', 'movement_left']),
                registerInputListener(() => {
                    currentLaneIdx = currentLaneIdx + 1;
                    if (currentLaneIdx >= targetLanes.length) {
                        currentLaneIdx = 0;
                    }
                    battleManager.setTargetedLane(targetLanes[currentLaneIdx]);
                    anchor.value = this.getIndicatorAnchor(targetLanes[currentLaneIdx]);
                }, ['menu_right', 'movement_right']),
                registerInputListener(() => {
                    this.listeners.forEach((l) => unregisterInputListener(l));
                    removeMenu(indicator.id);
                    battleManager.setTargetedLane(undefined);
                    battleManager.turnManager.activateUnit();
                    reject();
                }, 'cancel'),
                registerInputListener(() => {
                    this.listeners.forEach((l) => unregisterInputListener(l));
                    removeMenu(indicator.id);
                    resolve(targetLanes[currentLaneIdx]);
                }, 'confirm'),
            ];
        });
    }

    private getIndicatorAnchor(lane: LaneKey): Vector {
        const engine = useGameContext().game.value;

        return engine
            .worldToScreenCoordinates(engine.currentScene.camera.pos.add(this.lanePositions[lane]))
            .scale(getScale());
    }

    private lanePositions = {
        'left-2': vec(-100, -10),
        'left-1': vec(-50, -10),
        mid: vec(0, -10),
        'right-1': vec(50, -10),
        'right-2': vec(100, -10),
    };
    private orderedLanes: LaneKey[] = ['left-2', 'left-1', 'mid', 'right-1', 'right-2'];
    private getTargetLanes(): LaneKey[] {
        const { battleManager } = useExploration().getExplorationManager();
        const { targetTypes } = this.opts;
        let allowedUnits: BattleUnit[] = [];
        const party = useParty().partyState.value.party;
        const enemies = useBattle().battleState.value.enemies;
        if (targetTypes.includes('ally')) {
            allowedUnits = [...allowedUnits, ...party];
        }
        if (targetTypes.includes('enemy')) {
            allowedUnits = [...allowedUnits, ...enemies];
        }

        return [
            ...this.orderedLanes.filter((laneKey) => {
                return battleManager.laneUnitMap[laneKey].some(
                    (unit: KeyedAnimationActor<string> | CompositeActor) => {
                        return allowedUnits.find(
                            (u) => u.alignment === this.opts.targetPriority && u.id === unit.unitId,
                        );
                    },
                );
            }),
            ...this.orderedLanes.filter((laneKey) => {
                return battleManager.laneUnitMap[laneKey].some(
                    (unit: KeyedAnimationActor<string> | CompositeActor) => {
                        return allowedUnits.find(
                            (u) => u.alignment !== this.opts.targetPriority && u.id === unit.unitId,
                        );
                    },
                );
            }),
        ];
    }
}
