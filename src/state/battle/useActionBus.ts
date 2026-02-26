import { makeState } from '../../../strategemMigration/src/state/Observable';
import { useBattleClock } from './useBattleClock';
import { useGameContext } from '../../../strategemMigration/src/state/useGameContext';
import { useBattleState } from './useBattleState';
import { StrategemAgent } from '@/game/strategems/StrategemAgent';
import { TargetStrategyComponent } from '@/game/actions/components/TargetStrategyComponent';

// How long to wait after player action input before resuming the clock.
// Prevents accidental double-inputs from the same keypress that confirmed the action.
const INPUT_DEBOUNCE_MS = 200;

const queue = makeState<[StrategemAgent, number][]>([]);
const battleClock = makeState<'1x' | '2x' | 'liteWait' | 'fullWait'>('fullWait');

// When true, party agents with empty strategems[] halt the clock and await promptAction().
// When false (live ATB), the 0-priority strategem injection path is used instead.
const isManualMode = makeState<boolean>(true);

const order: (typeof battleClock.value)[] = ['fullWait', 'liteWait', '1x', '2x'];

function adjustBattleClock(step: 1 | -1) {
    const currentOrderIdx = order.findIndex((t) => t === battleClock.value);
    const newIdx = Math.max(0, Math.min(order.length - 1, currentOrderIdx + step));
    battleClock.set(order[newIdx]);
    const { clockSpeed } = useBattleClock();
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

const { tick, tickRate } = useBattleClock();

function clearQueue() {
    queue.set([]);
}

function queueAction(toQueue: StrategemAgent, activationTime: number) {
    const idx = queue.value.findIndex(([_a, time]) => time < activationTime) - 1;
    if (idx === -1) {
        queue.value.unshift([toQueue, activationTime]);
    } else if (idx < -1) {
        queue.value.push([toQueue, activationTime]);
    } else {
        queue.value.splice(idx, 0, [toQueue, activationTime]);
    }
}

function isActionQueued(agent: StrategemAgent) {
    return queue.value.some(([a]) => a.actor.actorId === agent.actor.actorId);
}

let actionListener: Promise<void> | null = null;
tick.subscribe(pollQueuedActions);

function pollQueuedActions() {
    if (queue.value.length === 0) return;

    // If we're already awaiting player input, do not dequeue another unit
    if (actionListener !== null) return;

    if (isWaitMode()) {
        if (!unqueueAction()) {
            if (battleClock.value === 'fullWait') {
                const { setLogicClock } = useGameContext();
                setLogicClock('off');
            }
            setTimeout(() => {
                pollQueuedActions();
            }, tickRate.value);
        } else {
            const { logicClockOff, setLogicClock } = useGameContext();
            if (logicClockOff.value && actionListener === null) {
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

function unqueueAction(): boolean {
    const [agent, time] = queue.value.pop();
    const actor = agent.actor;

    if (!actor.canAct()) {
        if (!actor.isDead()) {
            queue.value.push([agent, time]);
            return false;
        }
        // Dead actor — consume the slot, no retry needed
        return true;
    }

    // Cross-alignment gate: no party action while an enemy is mid-action, and vice versa.
    // isChanneling guard removed — was dead code (never set to true anywhere).
    const { getAllUnits } = useBattleState();
    if (getAllUnits().some((a) => a.isActing && a.alignment !== actor.alignment)) {
        queue.value.push([agent, time]);
        return false;
    }

    // Re-evaluate intent — conditions may have changed since the unit was enqueued
    const intent = agent.getIntent();
    const action = intent?.action;

    if (!action) {
        if (actor.alignment === 'party' && isManualMode.value) {
            // Halt clock and await player input.
            // The selected action is executed directly — never injected into strategems[].
            const { setLogicClock } = useGameContext();
            if (battleClock.value === 'fullWait') {
                setLogicClock('off');
            }
            actionListener = agent
                .promptAction()
                .then((selectedAction) => {
                    const arcComplete = agent.pulseIntent ? agent.pulseIntent() : Promise.resolve();
                    selectedAction.execute(arcComplete);
                })
                .finally(() => {
                    actionListener = null;
                    setTimeout(() => {
                        setLogicClock('on');
                    }, INPUT_DEBOUNCE_MS);
                });
            return true;
        }
        // Intentless non-party agent, or non-manual mode party agent with no pre-queued
        // strategem: consume the turn. CT was never reset so SpeedComponent will re-fire.
        return true;
    }

    // Target validity: don't fire if any target is mid-action
    const targets = action.getComponent(TargetStrategyComponent).getTargets();
    if (targets.some((t) => t.isActing) || !targets.some((t) => !(t.isDead() || t.willBeDead()))) {
        queue.value.push([agent, time]);
        return false;
    }

    // All checks pass — fire
    const arcComplete = agent.pulseIntent ? agent.pulseIntent() : Promise.resolve();
    action.execute(arcComplete);
    return true;
}

const actionBus = {
    queue,
    battleClock,
    isManualMode,
    adjustBattleClock,
    isWaitMode,
    clearQueue,
    queueAction,
    isActionQueued,
};

export function useActionBus() {
    return actionBus;
}
