import {
    ConditionState,
    ConditionTargetableUnitPool,
    isAnyCondition,
    isQuantitativeThreshold,
    isResourceCondition,
    ResourceCondition,
} from './Condition';
import { HealthComponent } from '../actors/StrategemActor/components/HealthComponent';
import { AssembledBattleUnit, useBattleParty } from '@/state/deprecated/useBattleParty';
import { useEnemyWave } from '@/state/deprecated/useEnemyWave';
import { sortArrayRandom } from '@/lib/helpers/number.helper';

export function getUnitPool(unitPoolKey: ConditionTargetableUnitPool) {
    switch (unitPoolKey) {
        case 'party':
            const { party } = useBattleParty();
            return party.value.filter((p) => !p.actor.willBeDead()) as AssembledBattleUnit[];
        case 'enemy':
            const { currentWave } = useEnemyWave();
            return currentWave.value.filter((e) => !e.actor.willBeDead()) as AssembledBattleUnit[];
        default:
            return [];
    }
}

function computeHealthForThreshold(
    resource: 'MaxHealth' | 'CurrentHealth',
    healthComp: HealthComponent,
    isPercent: boolean,
) {
    return resource === 'MaxHealth'
        ? healthComp.maxHealth()
        : isPercent
          ? Math.floor(100 * (healthComp.forecastedHealth / healthComp.maxHealth()))
          : healthComp.forecastedHealth;
}

export function getTargetsByHealth(
    condition: ConditionState & ResourceCondition,
    unitPool: AssembledBattleUnit[],
) {
    const { targetResource: resource, comparator, threshold, isPercent } = condition;
    let units: AssembledBattleUnit[] = [];
    if (isQuantitativeThreshold(threshold)) {
        units = unitPool.filter((unit) => {
            const healthComp = unit.actor.getComponent(HealthComponent);
            const health = computeHealthForThreshold(resource, healthComp, isPercent);
            return (
                (comparator === '<' && health < threshold) ||
                (comparator === '>' && health > threshold)
            );
        });
    } else {
        units = [...unitPool];
    }

    return units.sort((a, b) => {
        const healthComp_A = a.actor.getComponent(HealthComponent);
        const health_A = computeHealthForThreshold(resource, healthComp_A, isPercent);
        const healthComp_B = b.actor.getComponent(HealthComponent);
        const health_B = computeHealthForThreshold(resource, healthComp_B, isPercent);
        if (comparator === '<' || threshold === 'lowest') {
            return health_A - health_B;
        } else {
            return health_B - health_A;
        }
    });
}

export function getTargets(condition: ConditionState) {
    if (isAnyCondition(condition)) {
        return sortArrayRandom(getUnitPool(condition.unitPool));
    } else if (isResourceCondition(condition)) {
        if (
            condition.targetResource === 'MaxHealth' ||
            condition.targetResource === 'CurrentHealth'
        ) {
            return getTargetsByHealth(condition, getUnitPool(condition.unitPool));
        }
    }
}
