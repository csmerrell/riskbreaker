import { ConditionList } from './Condition';
import { getTargets } from './Targeting';

export class StrategemCondition {
    constructor(private conditions: ConditionList) {}

    public eval(): boolean {
        for (const condition of this.conditions) {
            if (getTargets(condition).length === 0) {
                return false;
            }
        }
        return true;
    }
}
