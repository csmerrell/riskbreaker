import { ConditionList } from './Condition';
import { getTargets } from './Targeting';

export class StrategemCondition {
    constructor(private conditions: ConditionList) {}

    public eval(): boolean {
        let result = true;
        for (const condition of this.conditions) {
            if (getTargets(condition).length === 0) {
                result = false;
                break;
            }
        }

        return result;
    }
}
