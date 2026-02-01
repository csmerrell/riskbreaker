import { getScript, executeTypedEvent } from './scripts';
import { captureControls, unCaptureControls } from '@/game/input/useInput';
import { watch } from 'vue';
import { makeState } from './Observable';
import type { useRoute } from 'vue-router';
import type { Engine } from 'excalibur';
import {
    GameScript,
    isTypedEvent,
    isTypedEventArray,
    isUntypedEvent,
} from './scripts/types/GameScript';

const activeEngine = makeState<Engine>();
const renderTick = makeState<() => Promise<void>>();

export function enableScripts(route: ReturnType<typeof useRoute>, nextTick: () => Promise<void>) {
    renderTick.set(nextTick);
    watch(
        () => route.query,
        (next) => {
            if (next.script && getScript(next.script as string)) {
                nextTick().then(() => {
                    runScript(getScript(next.script as string));
                });
            }
        },
    );
}

function setScriptEngine(engine: Engine) {
    activeEngine.set(engine);
}

function getScriptEngine() {
    return activeEngine.value;
}

async function runScript(script: GameScript) {
    captureControls();
    while (script.events.length > 0) {
        const event = script.events.shift();
        if (isTypedEvent(event)) {
            await executeTypedEvent(event);
        } else if (isTypedEventArray(event)) {
            await event.map((e) => executeTypedEvent(e));
        } else if (isUntypedEvent(event)) {
            await event();
        }
    }
    unCaptureControls();
}

export function useScript() {
    return {
        renderTick,
        getScriptEngine,
        setScriptEngine,
        runScript,
    };
}
