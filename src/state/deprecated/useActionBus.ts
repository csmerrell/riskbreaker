import { makeState } from '../Observable';
import { TargetStrategyComponent } from '@/game/actions/components/TargetStrategyComponent';
import { useClock } from './useClock';
import { useGameContext } from '../useGameContext';
import { useBattleState } from './useBattleState';
import { StrategemActor } from '@/game/actors/StrategemActor/StrategemActor';
import { inputGlobalDebounce, registerInputListener } from '@/game/input/useInput';

const queue = makeState<[StrategemActor, number][]>([]);
const battleClock = makeState<'1x' | '2x' | 'liteWait' | 'fullWait'>('fullWait');

const order: (typeof battleClock.value)[] = ['fullWait', 'liteWait', '1x', '2x'];
function adjustBattleClock(step: 1 | -1) {
    const currentOrderIdx = order.findIndex((t) => t === battleClock.value);
    const newIdx = Math.max(0, Math.min(order.length - 1, currentOrderIdx + step));
    battleClock.set(order[newIdx]);
    const { clockSpeed } = useClock();
    const { clockMs, CLOCKSPEED_1X, CLOCKSPEED_2X } = clockSpeed;
    const { setLogicClock } = useGameContext();
    switch (battleClock.value) {
        case 'fullWait':
            if (actionListener !== null) {
                setLogicClock('off');
            }
            break;
        case 'liteWait':
            setLogicClock('on');
            clockMs.set(CLOCKSPEED_1X);
            break;
        case '1x':
            clockMs.set(CLOCKSPEED_1X);
            break;
        case '2x':
            clockMs.set(CLOCKSPEED_2X);
            break;
    }
}

function isWaitMode() {
    return battleClock.value.toLowerCase().includes('wait');
}

registerInputListener(() => {
    adjustBattleClock(-1);
    return true;
}, 'tab_left');

registerInputListener(() => {
    adjustBattleClock(1);
    return true;
}, 'tab_right');

const { tick, tickRate } = useClock();

function clearQueue() {
    queue.set([]);
}

function queueAction(toQueue: StrategemActor, activationTime: number) {
    const idx = queue.value.findIndex(([_a, time]) => time < activationTime) - 1;
    if (idx === -1) {
        queue.value.unshift([toQueue, activationTime]);
    } else if (idx < -1) {
        queue.value.push([toQueue, activationTime]);
    } else {
        queue.value.splice(idx, 0, [toQueue, activationTime]);
    }
}

function isActionQueued(actor: StrategemActor) {
    return queue.value.some(([a]) => actor.id === a.id);
}

let actionListener: Promise<void> | null = null;
tick.subscribe(pollQueuedActions);

function pollQueuedActions() {
    if (queue.value.length === 0) return;

    if (isWaitMode()) {
        if (actionListener !== null) {
            return;
        }
        const { setLogicClock, logicClockOff } = useGameContext();

        const [actor, _activationTime] = queue.value[queue.value.length - 1];
        if (actor.alignment === 'party') {
            if (battleClock.value === 'fullWait') {
                setLogicClock('off');
            }
            actionListener = actor.promptAction().then(() => {
                unqueueAction();
                actionListener = null;
                setTimeout(() => {
                    setLogicClock('on');
                }, inputGlobalDebounce);
            });
        } else {
            if (!unqueueAction()) {
                if (battleClock.value === 'fullWait') {
                    setLogicClock('off');
                }
                setTimeout(() => {
                    pollQueuedActions();
                }, tickRate.value);
            } else if (logicClockOff.value) {
                setLogicClock('on');
            }
        }
    } else {
        if (actionListener !== null) {
            actionListener = null;
        }
        unqueueAction();
    }
}

function unqueueAction() {
    const [actor, time] = queue.value.pop();
    if (actor.canAct()) {
        const { getAllUnits } = useBattleState();
        if (
            getAllUnits().some(
                (a) => a.isActing && !a.isChanneling && a.alignment !== actor.alignment,
            )
        ) {
            queue.value.push([actor, time]);
            return false;
        }

        //re-evaluate intent in case it has changed.
        const action = actor.getIntent()?.action;
        if (!action) {
            return true;
        }
        const targets = action.getComponent(TargetStrategyComponent).getTargets();
        if (
            targets.some((t) => t.isActing) ||
            !targets.some((t) => !(t.isDead() || t.willBeDead()))
        ) {
            queue.value.push([actor, time]);
            return false;
        }

        const arcComplete = actor.pulseIntent();
        action.execute(arcComplete);
        return true;
    } else if (!actor.isDead()) {
        queue.value.push([actor, time]);
        return false;
    }
}

const actionBus = {
    queue,
    battleClock,
    adjustBattleClock,
    isWaitMode,
    clearQueue,
    queueAction,
    isActionQueued,
};

export function useActionBus() {
    return actionBus;
}
