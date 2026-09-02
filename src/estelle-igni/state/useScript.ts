import { executeTypedEvent, getScript } from './scripts';
import { captureControls, unCaptureControls } from '@/game/input/useInput';
import {
    GameScript,
    isTypedEvent,
    isTypedEventArray,
    isUntypedEvent,
} from './scripts/types/GameScript';

async function runScript(script: GameScript | string) {
    if (typeof script === 'string') {
        script = getScript(script);
    }
    while (script.events.length > 0) {
        const event = script.events.shift()!;
        if (isTypedEvent(event)) {
            if (event.preDelay) {
                await new Promise((resolve) => {
                    setTimeout(resolve, event.preDelay);
                });
            }
            await executeTypedEvent(event);
            if (event.postDelay) {
                await new Promise((resolve) => {
                    setTimeout(resolve, event.preDelay);
                });
            }
        } else if (isTypedEventArray(event)) {
            await event.map((e) => executeTypedEvent(e));
        } else if (isUntypedEvent(event)) {
            await event();
        }
    }
}

export function useScript() {
    return {
        runScript,
    };
}
