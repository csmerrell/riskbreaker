import { useClock } from '@/state/deprecated/useClock';
import { StrategemAction } from '../actions/StrategemAction';
import { CooldownComponent } from '../actions/components/CooldownComponent';
import { TargetStrategyComponent } from '../actions/components/TargetStrategyComponent';
import { StrategemState } from '@/state/saveState/playerUnit/UnitStrategems';
import { StrategemCondition } from './StrategemCondition';
import { buildAction } from '../actions/ActionFactory';
import { StrategemActor } from '../actors/StrategemActor/StrategemActor';

export type Condition = () => boolean;

export class Strategem {
    private condition: StrategemCondition;
    public action: StrategemAction;

    constructor(
        private owner: StrategemActor,
        definition: StrategemState,
    ) {
        this.action = buildAction(this.owner, definition.action, definition.targetCondition);
        this.condition = new StrategemCondition(definition.conditionList);
    }

    checkActivation() {
        const { tick } = useClock();
        if (this.action.hasComponent(CooldownComponent)) {
            const cd = this.action.getComponent(CooldownComponent);
            const diff = tick.value - cd.lastUsed;
            if (diff < cd.cooldown) {
                return false;
            }
        }
        if (this.action.hasComponent(TargetStrategyComponent)) {
            if (this.action.getComponent(TargetStrategyComponent).getTargets().length === 0) {
                return false;
            }
        }

        if (!this.condition.eval()) return false;

        return true;
    }
}
