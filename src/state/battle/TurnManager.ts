import { makeState } from '../Observable';
import { BattleUnit, EnemyDef, useBattle } from './useBattle';
import { PartyMember } from '../useParty';
import { BattleManager } from './BattleManager';
import { getEffectiveStat } from './UnitStats';
import { getActorAnchor, getMenuPosition, MenuAnchor } from '../ui/useActorAnchors';
import { addMenu, MenuInstance, removeMenu } from '../ui/useMenuRegistry';
import { Actor, vec, Vector } from 'excalibur';
import TargetIndicator from '@/ui/components/menus/TargetIndicator.vue';
import ActiveUnitMenu from '@/ui/components/menus/activeUnitMenu/ActiveUnitMenu.vue';
import CrossHotbar from '@/ui/components/menus/crossHotbar/CrossHotbar.vue';
import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import { getScale } from '@/lib/helpers/screen.helper';
import { loopUntil } from '@/lib/helpers/async.helper';

type CTMapping = {
    unit: BattleUnit;
    ctVal: number;
};
export class TurnManager {
    public forecastReady = makeState<boolean>(false);
    public activeUnit = makeState<BattleUnit | null>(null);
    constructor(private parent: BattleManager) {}

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
            removeMenu(menu.instance.id);
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
        const { getUnits } = useBattle();
        while (!Object.values(this.unitCTs).some((unit) => unit.ctVal >= 100)) {
            this.unitCTs = getUnits().map((unit) => {
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

    public endTurn(ctCost: number) {
        this.setUnitCT(this.activeUnit.value!, 100 - ctCost);
        this.advanceTurn();
        setTimeout(() => {
            this.activateUnit();
        }, 250);
    }

    private tickCT(ctMap: typeof this.unitCTs) {
        return ctMap.map((unitMapping) => ({
            ...unitMapping,
            ctVal: unitMapping.ctVal + getEffectiveStat('speed', unitMapping.unit.stats),
        }));
    }

    public activateUnit() {
        const unit = this.unitCTs.reduce(
            (active: CTMapping, unitCT) => (unitCT.ctVal > (active?.ctVal ?? 0) ? unitCT : active),
            this.unitCTs[0],
        ).unit;

        this.activeUnit.set(unit);
        this.menus.forEach((m) => {
            removeMenu(m.instance.id);
        });
        if (unit.alignment === 'enemy') {
            this.activateEnemy(unit);
        } else if (unit.alignment === 'ally') {
            this.activatePartyMember(unit);
        }
    }

    public moveMenus(opts: { actor: Actor; dependentPromise: Promise<void> }) {
        return Promise.all(this.menus.map((m) => this.moveMenu(m, opts)));
    }

    private async moveMenu(
        menu: { instance: MenuInstance; key: 'arrow' | 'menu' | 'hotbar' },
        opts: { actor: Actor; dependentPromise: Promise<void> },
    ) {
        const restoreTransition = menu.instance.hooks?.suppressTransition();
        return new Promise<void>(async (resolve) => {
            const move = () => {
                const offset: Vector = this[`${menu.key}Offset`].scale(getScale());
                menu.instance.position.value = getMenuPosition(opts.actor.pos, offset);
                if (opts.actor.vel.magnitude === 0) {
                    opts.actor.events.off('preupdate', move);
                    restoreTransition?.();
                    resolve();
                }
            };
            await loopUntil(
                () => opts.actor.vel.magnitude > 0,
                () => {},
            );
            opts.actor.events.on('preupdate', move);
        });
    }

    public removeActiveUnitMenus() {
        this.menus.forEach((m) => {
            removeMenu(m.instance.id);
        });
    }

    private activateEnemy(_unit: EnemyDef) {}

    private arrowAnchor?: MenuAnchor;
    private arrowOffset = vec(1, -16);
    private menuAnchor?: MenuAnchor;
    private menuOffset = vec(0, -19);
    private hotbarAnchor?: MenuAnchor;
    private hotbarOffset = vec(1, -21);
    private menus: { key: 'arrow' | 'menu' | 'hotbar'; instance: MenuInstance }[] = [];
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

        this.arrowAnchor = getActorAnchor(actor, { offset: this.arrowOffset.scale(getScale()) });
        this.menus.push({
            instance: addMenu(TargetIndicator, {
                position: this.arrowAnchor.anchor.pos,
                props: {
                    type: 'arrow',
                    direction: 'down',
                    blink: true,
                    scale: getScale(),
                },
            }),
            key: 'arrow',
        });

        this.menuAnchor = getActorAnchor(actor, { offset: this.menuOffset.scale(getScale()) });
        this.menus.push({
            instance: addMenu(ActiveUnitMenu, {
                position: this.menuAnchor.anchor.pos,
                props: {
                    unit,
                    actor,
                },
            }),
            key: 'menu',
        });

        this.hotbarAnchor = getActorAnchor(actor, { offset: this.hotbarOffset.scale(getScale()) });
        this.menus.push({
            instance: addMenu(CrossHotbar, {
                position: this.hotbarAnchor.anchor.pos,
                props: {
                    unit,
                    actor,
                },
            }),
            key: 'hotbar',
        });
    }
}
