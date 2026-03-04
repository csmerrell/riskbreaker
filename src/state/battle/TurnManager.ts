import { makeState } from '../Observable';
import { EnemyDef, useBattle } from './useBattle';
import { PartyMember, useParty } from '../useParty';
import { BattleManager } from './BattleManager';
import { getEffectiveStat } from './UnitStats';

export class TurnManager {
    public forecastReady = makeState<boolean>(false);
    constructor(private parent: BattleManager) {}

    private getUnits() {
        const party = useParty().partyState.value.party;
        const enemies = useBattle().battleState.value.enemies;
        return [...party, ...enemies];
    }

    private unitCTs: {
        unit: EnemyDef | PartyMember;
        ctVal: number;
    }[] = [];
    public start() {
        while (!Object.values(this.unitCTs).some((unit) => unit.ctVal >= 100)) {
            this.unitCTs = this.getUnits().map((unit) => {
                const speed = getEffectiveStat('speed', unit.stats);
                return {
                    unit,
                    ctVal:
                        (this.unitCTs.find((u) => u.unit.id === unit.id)?.ctVal ?? 0) +
                        (speed / 2 + Math.random() * speed),
                };
            }, {});
        }
        this.updateForecast();
        this.forecastReady.set(true);
    }

    public reset() {
        this.unitCTs = [];
        this.forecastReady.set(false);
    }

    public forecast = makeState<(EnemyDef | PartyMember)[]>([]);
    public updateForecast() {
        let forecastCtMap = [...this.unitCTs];
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

    private tickCT(ctMap: typeof this.unitCTs) {
        return ctMap.map((unitMapping) => ({
            ...unitMapping,
            ctVal: unitMapping.ctVal + getEffectiveStat('speed', unitMapping.unit.stats),
        }));
    }
}
