export type ConditionReadableResource = 'CurrentHealth' | 'MaxHealth';
export type ConditionTargetableUnitPool = 'enemy' | 'party';

export type ResourceCondition = {
    type: 'resourceThreshold';
    targetResource?: ConditionReadableResource;
    comparator: '<' | '>';
};

export type QuantityCondition = {
    type: 'unitQuantity';
    comparator: '<' | '>';
};

export type RelativeThresholdType = 'lowest' | 'highest';
export type QuantitativeThresholdCondition = {
    threshold: number;
    isPercent?: true;
};
export type RelativeThresholdCondition = {
    threshold: RelativeThresholdType;
    isPercent?: true;
};

export type AnyCondition = {
    type: 'any';
};

// unitPositional is excluded from this engine. Build it from scratch in the host game
// when a concrete use case exists.
export type ConditionType = 'resourceThreshold' | 'unitQuantity' | 'any';

export type ConditionState = {
    type: ConditionType;
    unitPool: ConditionTargetableUnitPool;
} & (
    | AnyCondition
    | ((RelativeThresholdCondition | QuantitativeThresholdCondition) &
          (ResourceCondition | QuantityCondition))
);

export type ConditionList = ConditionState[];

// Type guards

export function isAnyCondition(condition: { type: ConditionType }): condition is AnyCondition {
    return condition.type === 'any';
}

export function isRelativeThreshold(
    threshold: number | RelativeThresholdType,
): threshold is RelativeThresholdType {
    return isNaN(parseInt(`${threshold}`, 10));
}

export function isQuantitativeThreshold(
    threshold: number | RelativeThresholdType,
): threshold is number {
    return !isNaN(parseInt(`${threshold}`, 10));
}

export function isResourceCondition(condition: {
    type: ConditionType;
}): condition is ResourceCondition {
    return condition.type === 'resourceThreshold';
}

export function isQuantityCondition(condition: {
    type: ConditionType;
}): condition is QuantityCondition {
    return condition.type === 'unitQuantity';
}
