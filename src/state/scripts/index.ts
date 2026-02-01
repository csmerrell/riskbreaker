import { unique } from './unique/';
import { common } from './common';
import type { GameScript, ScriptedEvent } from './types/GameScript';

export const scripts = {
    unique,
    common,
};

export function isGameScript(o: unknown): o is GameScript {
    return (o as GameScript).events !== undefined;
}

export function getScript(path: string): GameScript {
    const parts = path.split('_');
    const found = parts.reduce(
        (acc, pathPart) => {
            let found;
            if (acc === undefined) {
                return;
            } else if (Object.keys(acc).length === 0) {
                found = (scripts as Record<string, unknown>)[pathPart];
            } else {
                found = (acc as Record<string, unknown>)[pathPart];
            }
            if (!found) {
                acc = undefined;
                return;
            }
            acc = found;
            return acc;
        },
        {} as GameScript | unknown | undefined,
    );

    if (found === undefined) {
        throw new Error(`Tried to access script that doesn\'t exist: [${path}]`);
    } else if (!isGameScript(found)) {
        throw new Error(`Script path found an invalid script: [${path}]`);
    } else {
        return found;
    }
}

export function executeTypedEvent(event: ScriptedEvent): Promise<void> {
    switch (event.type) {
        case 'compositeAnimation':
        case 'uniqueAnimation':
            return common.scriptCharacterAnimation(event);
        case 'dialogue':
        case 'dialogueMarker':
            return common.scriptDialogue(event);
    }
}
