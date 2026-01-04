import { ActionMetadata } from '@/db/actions/Action';
import { ConditionList, ConditionState } from '@/game/strategems/Condition';
import { makeState, Observable } from '@/state/Observable';
import { StrategemSaveState } from '..';
import { useDb } from '@/state/useDb';
import { getSourceMap, injectSources } from '@/lib/helpers/resource.helper';
import { Resource } from 'excalibur';

export type StrategemState = {
    conditionList: ConditionList;
    targetCondition: ConditionState;
    action: ActionMetadata;
};

export class UnitStrategems {
    public strategems: Observable<StrategemState[]>;
    private sourceMap: Record<string, Resource<unknown>> = {};

    constructor(strategemSaveState: StrategemSaveState[]) {
        this.strategems = makeState<StrategemState[]>(
            strategemSaveState?.map((savedState) => {
                const { conditionList, targetCondition, actionPath } = savedState;
                const { dbResource } = useDb();
                this.sourceMap = {
                    ...this.sourceMap,
                    ...getSourceMap(dbResource[actionPath] as object),
                };
                const mappedAction = injectSources(
                    dbResource[actionPath],
                    this.sourceMap,
                ) as ActionMetadata;
                return {
                    conditionList,
                    targetCondition,
                    action: mappedAction,
                };
            }),
        );
    }

    getSourceMap() {
        return this.sourceMap;
    }

    add(strategem: StrategemState, idx: number | undefined) {
        if (idx !== undefined) {
            this.strategems.set([
                ...this.strategems.value.slice(0, idx),
                strategem,
                ...(idx > this.strategems.value.length ? [] : this.strategems.value.slice(idx)),
            ]);
        } else {
            this.strategems.set([...this.strategems.value, strategem]);
        }
    }

    update(strategem: StrategemState, idx: number) {
        this.strategems.set([
            ...this.strategems.value.slice(0, idx),
            strategem,
            ...this.strategems.value.slice(idx + 1),
        ]);
    }

    remove(idx: number) {
        this.strategems.set([
            ...this.strategems.value.slice(0, idx),
            ...this.strategems.value.slice(idx + 1),
        ]);
    }

    export(): StrategemState[] {
        return this.strategems.value;
    }

    get(): StrategemState[] {
        return this.strategems.value;
    }
}
