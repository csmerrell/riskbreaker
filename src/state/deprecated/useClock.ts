import { makeState } from '../Observable';
import { useGameContext } from '../useGameContext';

const CLOCKSPEED_1X = 30;
const CLOCKSPEED_1_5X = 22;
const CLOCKSPEED_2X = 15;

const gameLoadTime = makeState<number>(Date.now());
const saveLoadTime = makeState<number>();
const baseTickRate = 510;
const tickRate = makeState<number>(baseTickRate);
tickRate.subscribe(() => resetTicks);
const tick = makeState<number>();
const isRunning = makeState<boolean>(false);
const clockMs = makeState<number>(CLOCKSPEED_1X);
const clockSpeed = {
    clockMs,
    CLOCKSPEED_1X,
    CLOCKSPEED_1_5X,
    CLOCKSPEED_2X,
};

let tickInterval: NodeJS.Timeout;

clockMs.subscribe(() => {
    const { game } = useGameContext();
    if (clockMs.value === CLOCKSPEED_1X) {
        game.value.timescale = 1.0;
        tickRate.set(baseTickRate);
    } else if (clockMs.value === CLOCKSPEED_1_5X) {
        game.value.timescale = 1.5;
        tickRate.set(baseTickRate * 0.75);
    } else {
        game.value.timescale = 2.0;
        tickRate.set(baseTickRate * 0.5);
    }
    resetTicks();
});

function resetTicks() {
    if (tickInterval) {
        clearInterval(tickInterval);
    }

    tick.value = Date.now();
    tickInterval = setInterval(() => {
        tick.set(Date.now());
    }, tickRate.value);
    isRunning.set(true);
}

function suspendClock() {
    clearInterval(tickInterval);
    isRunning.set(false);
}

function resumeClock() {
    resetTicks();
    isRunning.set(true);
}

const clock = {
    clockSpeed,
    isRunning,
    gameLoadTime,
    saveLoadTime,
    tick,
    tickRate,
    resumeClock,
    suspendClock,
};

export function useClock() {
    return clock;
}
