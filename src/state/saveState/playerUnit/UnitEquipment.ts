import { makeState, Observable } from '@/state/Observable';

export type EquippableSlotKey = 'Head' | 'Body' | 'Acc1' | 'Acc2' | 'Arm1' | 'Arm2';
export type Equippable = {
    name: string;
};
export type EquipmentState = EquipmentSaveState;
export type EquipmentSaveState = Partial<Record<EquippableSlotKey, Equippable | undefined>>;

export class UnitEquipment {
    private equipment: Observable<EquipmentState>;

    constructor(equipment: EquipmentSaveState) {
        this.equipment = makeState<EquipmentState>(equipment ?? {});
    }

    equip(slot: EquippableSlotKey, equipment: Equippable) {
        this.equipment.set({
            ...this.equipment.value,
            [slot]: equipment,
        });
    }

    remove(slot: EquippableSlotKey) {
        const toUpdate = { ...this.equipment.value };
        delete toUpdate[slot];
        this.equipment.set(toUpdate);
    }

    get(): Observable<EquipmentState> {
        return this.equipment;
    }

    export(): EquipmentState {
        return this.equipment.value;
    }
}
