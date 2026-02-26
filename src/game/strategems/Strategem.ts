import type { IBattleActor } from '@/game/actors/IBattleActor';
import { StrategemAction } from '@/game/actions/StrategemAction';
import { TargetStrategyComponent } from '@/game/actions/components/TargetStrategyComponent';
import { ConditionList } from './Condition';
import { StrategemCondition } from './StrategemCondition';

// Strategem takes a pre-built StrategemAction — it no longer calls buildAction internally.
// StrategemAgent constructs the action via ActionFactory and passes it in.
export class Strategem {
    private condition: StrategemCondition;
    public action: StrategemAction;

    constructor(
        private owner: IBattleActor,
        conditionList: ConditionList,
        action: StrategemAction,
    ) {
        this.action = action;
        this.condition = new StrategemCondition(conditionList);
    }

    public checkActivation(): boolean {
        // CooldownComponent is excluded (was dead code — never instantiated anywhere).
        // Build cooldowns fresh from a concrete use case when needed.

        if (this.action.hasComponent(TargetStrategyComponent)) {
            if (this.action.getComponent(TargetStrategyComponent).getTargets().length === 0) {
                return false;
            }
        }

        if (!this.condition.eval()) return false;

        return true;
    }
}
