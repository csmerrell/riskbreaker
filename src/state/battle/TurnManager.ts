import { makeState } from '../Observable';
import { EnemyDef, useBattle } from './useBattle';
import { PartyMember, useParty } from '../useParty';
import { BattleManager } from './BattleManager';
import { getEffectiveStat } from './UnitStats';
import { getActorAnchor } from '../ui/useActorAnchors';
import { addMenu, MenuInstance, removeMenu } from '../ui/useMenuRegistry';
import { vec } from 'excalibur';
import TargetIndicator from '@/ui/components/menus/TargetIndicator.vue';
import ActiveUnitMenu from '@/ui/components/menus/activeUnitMenu/ActiveUnitMenu.vue';
import CrossHotbar from '@/ui/components/menus/crossHotbar/CrossHotbar.vue';
import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';

type BattleUnit = EnemyDef | PartyMember;
type CTMapping = {
    unit: BattleUnit;
    ctVal: number;
};
export class TurnManager {
    public forecastReady = makeState<boolean>(false);
    public activeUnit = makeState<BattleUnit | null>(null);
    constructor(private parent: BattleManager) {}

    private getUnits(): BattleUnit[] {
        const party = useParty().partyState.value.party;
        const enemies = useBattle().battleState.value.enemies;
        return [...party, ...enemies];
    }

    private unitCTs: CTMapping[] = [];
    public start() {
        this.advanceTurn({ random: true });
        this.updateForecast();
        this.forecastReady.set(true);
        setTimeout(() => {
            this.activateUnit();
        }, 1000);
    }

    public reset() {
        this.unitCTs = [];
        this.forecastReady.set(false);
        this.menus.forEach((menu) => {
            removeMenu(menu.id);
        });
    }

    public forecast = makeState<(EnemyDef | PartyMember)[]>([]);
    public updateForecast(modifiedCTs: CTMapping[] = []) {
        let forecastCtMap = [...this.unitCTs];
        modifiedCTs.forEach((modified) => {
            const idx = forecastCtMap.findIndex((u) => u.unit.id === modified.unit.id);
            if (idx >= 0) {
                forecastCtMap[idx] = modified;
            }
        });

        const forecasts = [];
        while (forecasts.length < 25) {
            forecastCtMap = forecastCtMap.sort((u1, u2) => u2.ctVal - u1.ctVal);

            while (forecastCtMap[0].ctVal >= 100) {
                const unitMapping = forecastCtMap.shift()!;
                forecasts.push(unitMapping.unit);
                forecastCtMap.push({
                    ...unitMapping,
                    ctVal: 10,
                });
            }
            forecastCtMap = this.tickCT(forecastCtMap);
        }
        this.forecast.set(forecasts);
    }

    public setUnitCT(unit: BattleUnit, ctVal: number) {
        const idx = this.unitCTs.findIndex((u) => u.unit.id === unit.id);
        if (idx < 0) return;
        this.unitCTs[idx].ctVal = ctVal;
        this.updateForecast();
    }

    public advanceTurn(opts: { random?: boolean } = {}) {
        const { random = false } = opts;
        while (!Object.values(this.unitCTs).some((unit) => unit.ctVal >= 100)) {
            this.unitCTs = this.getUnits().map((unit) => {
                const speed = getEffectiveStat('speed', unit.stats);
                return {
                    unit,
                    ctVal:
                        (this.unitCTs.find((u) => u.unit.id === unit.id)?.ctVal ?? 0) +
                        (random ? speed / 2 + Math.random() * speed : speed),
                };
            }, {});
        }
    }

    private tickCT(ctMap: typeof this.unitCTs) {
        return ctMap.map((unitMapping) => ({
            ...unitMapping,
            ctVal: unitMapping.ctVal + getEffectiveStat('speed', unitMapping.unit.stats),
        }));
    }

    private activateUnit() {
        const unit = this.unitCTs.reduce(
            (active: CTMapping, unitCT) => (unitCT.ctVal > (active?.ctVal ?? 0) ? unitCT : active),
            this.unitCTs[0],
        ).unit;

        this.activeUnit.set(unit);
        if (unit.alignment === 'enemy') {
            this.activateEnemy(unit);
        } else if (unit.alignment === 'party') {
            this.activatePartyMember(unit);
        }
    }

    private activateEnemy(_unit: EnemyDef) {}

    private menus: MenuInstance[] = [];
    private async activatePartyMember(unit: PartyMember) {
        const actor = Object.values(this.parent.laneUnitMap)
            .flat()
            .find((a) => a.unitId === unit.id) as CompositeActor;
        if (!actor) {
            throw new Error(
                "[ActiveUnitMenu] was made visible, but the active unit wasn't found in the battle manager's lane map",
            );
        }

        await this.parent.cameraManager!.focusUnit(actor);

        const arrowAnchor = getActorAnchor(actor, { offset: vec(4, -64) });
        this.menus.push(
            addMenu(TargetIndicator, {
                position: arrowAnchor.anchor.pos,
                props: {
                    type: 'arrow',
                    direction: 'down',
                    blink: true,
                    scale: 4,
                },
            }),
        );

        const menuAnchor = getActorAnchor(actor, { offset: vec(0, -78) });
        this.menus.push(
            addMenu(ActiveUnitMenu, {
                position: menuAnchor.anchor.pos,
                props: {
                    unit,
                    actor,
                },
            }),
        );

        const hotbarAnchor = getActorAnchor(actor, { offset: vec(4, -84) });
        this.menus.push(
            addMenu(CrossHotbar, {
                position: hotbarAnchor.anchor.pos,
                props: {
                    unit,
                    actor,
                },
            }),
        );
    }
}
