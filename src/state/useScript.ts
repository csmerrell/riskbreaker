import { executeTypedEvent } from './scripts';
import { captureControls, unCaptureControls } from '@/game/input/useInput';
import {
    GameScript,
    isTypedEvent,
    isTypedEventArray,
    isUntypedEvent,
} from './scripts/types/GameScript';

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
        runScript,
    };
}
