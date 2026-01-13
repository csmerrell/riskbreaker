export { UnitState } from './playerUnit/UnitState';

import { ConditionList, ConditionState } from '@/game/strategems/Condition';
import { EquipmentSaveState } from './playerUnit/UnitEquipment';
import type { HotbarAction, HotbarSet } from '@/ui/views/deprecated/BattleScreen/state/useCrossHotbar';
import { PrimitivesOf } from '@/lib/types/ClassHelper';

export type HotbarSaveState = PrimitivesOf<HotbarSet>;

export type UnitRosterSaveState = {
    unitPath: string;
    strategems: StrategemSaveState[];
    equipment: EquipmentSaveState;
    hotbar: Omit<HotbarSaveState, 'id'>;
    actions: Omit<HotbarAction, 'cooldown' | 'timer'>[];
};

export type UnitBattlePartySaveState = {
    id: number;
    line: 'front' | 'mid' | 'back';
    cell: 'top' | 'mid' | 'bottom';
};

export type StrategemSaveState = {
    conditionList: ConditionList;
    targetCondition: ConditionState;
    actionPath: string;
};

export type SaveState = {
    roster: Record<number, UnitRosterSaveState>;
    battleParty: UnitBattlePartySaveState[];
};
