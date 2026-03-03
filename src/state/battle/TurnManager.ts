import { makeState } from '../Observable';
import { useBattle } from '../useBattle';
import { useParty } from '../useParty';
import { BattleManager } from './BattleManager';

export class TurnManager {
    private time = 0;
    constructor(private parent: BattleManager) {}

    private getUnits() {
        const party = useParty().partyState.value.party;
        const enemies = useBattle().battleState.value.enemies;
        return [...party, ...enemies];
    }

    private unitCTs: {
        unit: UnitStats;
        ctVal: number;
    }[] = [];
    public start() {
        while (!Object.values(this.unitCTMap).some((unit) => unit.ctVal >= 100)) {
            this.unitCTs = this.getUnits().map((unit) => {
                const speed = unit.stats.current?.speed ?? unit.stats.speed;
                return {
                    unit,
                    ctVal:
                        this.unitCTs.find((u) => u.id === unit.id)!.ctVal +
                        (speed / 2 + Math.random() * speed),
                };
            }, {});
        }
    }

    public forecast = makeState<string[]>([]);
    private updateForecast() {
        const forecastCtMap = { ...this.unitCTMap };
        const forecasts = [];
        while (forecasts.length < 25) {
            const ready = Object.entries(this.unitCTMap)
                .filter(([_id, ctVal]) => ctVal >= 100)
                .map(([id, ctVal]) => ({ id, ctVal }))
                .sort((u1, u2) => u1.ctVal - u2.ctVal);
            while (ready.length > 0) {
                const unit = ready.shift()!;
                forecasts.push(unit.id);
                forecastCtMap[unit.id] = 0;
            }
        }
    }
}
