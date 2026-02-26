import {
    ConditionState,
    ConditionTargetableUnitPool,
    isAnyCondition,
    isQuantitativeThreshold,
    isResourceCondition,
    ResourceCondition,
} from './Condition';
import type { IBattleActor } from '@/game/actors/IBattleActor';
import { useBattleState } from '@/state/useBattleState';
import { sortArrayRandom } from '@/lib/helpers/number.helper';

function getUnitPool(unitPoolKey: ConditionTargetableUnitPool): IBattleActor[] {
    const { getUnitsByAlignment } = useBattleState();
    return getUnitsByAlignment(unitPoolKey).filter((a) => !a.willBeDead());
}

function computeHealthForThreshold(
    resource: 'MaxHealth' | 'CurrentHealth',
    actor: IBattleActor,
    isPercent: boolean,
): number {
    return resource === 'MaxHealth'
        ? actor.maxHealth()
        : isPercent
          ? Math.floor(100 * (actor.forecastedHealth() / actor.maxHealth()))
          : actor.forecastedHealth();
}

export function getTargetsByHealth(
    condition: ConditionState & ResourceCondition,
    unitPool: IBattleActor[],
): IBattleActor[] {
    const { targetResource: resource, comparator, threshold, isPercent } = condition;
    let units: IBattleActor[] = [];

    if (isQuantitativeThreshold(threshold)) {
        units = unitPool.filter((unit) => {
            const health = computeHealthForThreshold(resource, unit, isPercent);
            return (
                (comparator === '<' && health < threshold) ||
                (comparator === '>' && health > threshold)
            );
        });
    } else {
        units = [...unitPool];
    }

    return units.sort((a, b) => {
        const health_A = computeHealthForThreshold(resource, a, isPercent);
        const health_B = computeHealthForThreshold(resource, b, isPercent);
        if (comparator === '<' || threshold === 'lowest') {
            return health_A - health_B;
        } else {
            return health_B - health_A;
        }
    });
}

export function getTargets(condition: ConditionState): IBattleActor[] {
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
    return [];
}
