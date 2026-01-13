import { useDb } from '@/state/deprecated/useDb';
import { UnitRosterSaveState } from '..';
import { EquipmentState, UnitEquipment } from './UnitEquipment';
import { StrategemState, UnitStrategems } from './UnitStrategems';
import { UnitDefinition, UnitClassKey } from '@/db/units/BattleUnit';
import { HotbarSet } from '@/ui/views/deprecated/BattleScreen/state/useCrossHotbar';

export type UnitStoredState = {
    strategems: StrategemState[];
    equipment: EquipmentState;
};

export class UnitState {
    public unitName: UnitClassKey;
    public unitDef: UnitDefinition;
    public strategems: UnitStrategems;
    public equipment: UnitEquipment;
    public hotbar: HotbarSet;

    constructor(initialState: UnitRosterSaveState) {
        const { dbResource } = useDb();
        this.unitName = initialState.unitPath.split('/').pop() as UnitClassKey;
        this.unitDef = dbResource[initialState.unitPath] as UnitDefinition;
        this.strategems = new UnitStrategems(initialState.strategems);
        this.equipment = new UnitEquipment(initialState.equipment);
        this.hotbar = new HotbarSet(initialState.hotbar);
    }

    export() {
        return {
            strategems: this.strategems.export(),
            equipment: this.equipment.export(),
        };
    }
}
