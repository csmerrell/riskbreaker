import { BattleCellKey, BattleLineKey } from '@/ui/views/BattleScreen/BattleLine.vue';

export type ConditionReadableResource = 'CurrentHealth' | 'MaxHealth';
export type ConditionTargetableUnitPool = 'enemy' | 'party';
export type LineDensityPositional = {
    line: 'mostDense';
};
export type CellDensityPositional = {
    cell: 'mostDense';
};
export type TargetLinePositional = {
    line: BattleLineKey;
};
export type TargetCellPositional = {
    cell: BattleCellKey;
};
export type PositionalConditionState =
    | LineDensityPositional
    | CellDensityPositional
    | TargetLinePositional
    | TargetCellPositional;
export type PositionalCondition = {
    type: 'unitPositional';
    position: PositionalConditionState;
};

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

export type ConditionType = 'unitPositional' | 'resourceThreshold' | 'unitQuantity' | 'any';
export type ConditionState = {
    type: ConditionType;
    unitPool: ConditionTargetableUnitPool;
} & (
    | AnyCondition
    | ((RelativeThresholdCondition | QuantitativeThresholdCondition) &
          (PositionalCondition | ResourceCondition | QuantityCondition))
);

export type ConditionList = ConditionState[];

//typeguards
export function isAnyCondition(condition: { type: ConditionType }): condition is AnyCondition {
    return condition.type === 'any';
}

export function isPositionalCondition(condition: {
    type: ConditionType;
}): condition is PositionalCondition {
    return condition.type === 'unitPositional';
}

export function isLineDensityPositional(
    pos: PositionalConditionState,
): pos is LineDensityPositional {
    return 'line' in pos && pos.line === 'mostDense';
}

export function isCellDensityPositional(
    pos: PositionalConditionState,
): pos is CellDensityPositional {
    return 'cell' in pos && pos.cell === 'mostDense';
}

export function isTargetLinePositional(pos: PositionalConditionState): pos is TargetLinePositional {
    return 'line' in pos && pos.line !== 'mostDense';
}

export function isTargetCellPositional(pos: PositionalConditionState): pos is TargetCellPositional {
    return 'cell' in pos && pos.cell !== 'mostDense';
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
    return condition.type === 'unitPositional';
}
