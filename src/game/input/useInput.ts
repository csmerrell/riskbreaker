import { Buttons, Engine } from 'excalibur';
import { defaultGamepadMap, useGamepad } from './useGamepads';
import { InputMap, MappedCommand } from './InputMap';
import { nanoid } from 'nanoid';
import { useGameContext } from '@/state/useGameContext';
import { useKeyboard } from './useKeyboard';
import { TypedKeys } from '@/lib/types/ClassHelper';
import { makeState } from '@/state/Observable';

export function initControls(engine: Engine) {
    engine.input.toggleEnabled(true);
    const { initKeyboard } = useKeyboard();
    initKeyboard();

    const { initGamepads } = useGamepad();
    initGamepads();
}

export type InputListener = {
    id: string;
    cb: (commands?: InputMap) => void;
    registrationOrder: number;
};
const stackOwners = ['root'];
const stackOwner = makeState<string>(stackOwners[0]);
const listenerStack: Record<string, InputListener[]>[] = [{}];
let inputDebounceMap: Partial<Record<MappedCommand, number>> = {};
let registrationCounter = 0;
const currentListeners = () => listenerStack[listenerStack.length - 1];
function notifyListeners(result: InputMap) {
    if (inputDisabled) {
        return;
    }

    const debounceSnapshot = { ...inputDebounceMap };
    // Sort commands by most recent listener registration to handle button collisions correctly
    const sortedEntries = (
        Object.entries(currentListeners()) as [MappedCommand, InputListener[]][]
    ).sort(([_keyA, listenersA], [_keyB, listenersB]) => {
        const maxOrderA = Math.max(...listenersA.map((l) => l.registrationOrder));
        const maxOrderB = Math.max(...listenersB.map((l) => l.registrationOrder));
        return maxOrderB - maxOrderA; // Most recent first
    });

    let done = false;
    sortedEntries.forEach(([key, listeners]: [MappedCommand, InputListener[]]) => {
        if (done) return;

        if (!key.match(/\*|all/) && result[convergedCommandMap[key]!.key]) {
            inputDebounceMap[key] = (inputDebounceMap[key] ?? 0) + 1;
            if (inputDebounceMap[key] > 1 && inputDebounceMap[key] < 6) {
                return;
            }
        }

        if ((key as 'all') === 'all') {
            return;
        } else if ((key as '*') === '*') {
            listeners.find((listener) => {
                listener.cb(result);
                done = true;
            });
        } else if (result[convergedCommandMap[key]!.key]) {
            const commandKey = convergedCommandMap[key]!.key;
            listeners.find((listener) => {
                listener.cb();
                done = true;
                delete result[commandKey];
                const collisions = consumeCollisions(result, [commandKey]);
                // Sync debounce counters for all consumed commands
                collisions.forEach((cmd) => {
                    inputDebounceMap[cmd] = inputDebounceMap[key];
                });
            });
        }
    });

    (Object.keys(inputDebounceMap) as MappedCommand[]).forEach((key) => {
        if (inputDebounceMap[key] === debounceSnapshot[key]) {
            delete inputDebounceMap[key];
        }
    });
}

export function consumeCollisions(inputs: InputMap, commands: MappedCommand[]): MappedCommand[] {
    const { buttonMap, getUnmappedButton } = useGamepad();
    const { keyMap, getUnmappedKey } = useKeyboard();
    const consumedCommands: MappedCommand[] = [];

    commands.forEach((commandKey) => {
        const sharedInputs = [
            ...(buttonMap[getUnmappedButton(commandKey)!] ?? []),
            ...(keyMap[getUnmappedKey(commandKey)!] ?? []),
        ];
        sharedInputs.forEach((key) => {
            if (inputs[key]) {
                consumedCommands.push(key);
                delete inputs[key];
            }
        });
    });

    return consumedCommands;
}

function notifyHoldListeners(result: InputMap) {
    currentListeners()['all']?.forEach((listener) => {
        listener.cb(result);
    });
}

export function getCurrentOwner() {
    return stackOwner.value;
}

export function captureControls(key?: string) {
    console.log('Captured by:', key);
    const ownerKey = key ?? nanoid(16);
    listenerStack.push({});
    stackOwners.push(ownerKey);
    stackOwner.set(ownerKey);
    return ownerKey;
}

export function unCaptureControls() {
    console.log('Released by:', stackOwner.value);
    if (listenerStack.length === 1) {
        throw new Error(
            'Tried to pop the root listenerStack. Someone called unCaptureControls without a preceding call to captureControls',
        );
    }
    listenerStack.pop();
    const poppedOwner = stackOwners.pop();
    stackOwner.set(stackOwners[stackOwners.length - 1]);
    return poppedOwner;
}

export const inputGlobalDebounce = 50;
let commands: InputMap;
export function readInput() {
    const { getGamepadInputs } = useGamepad();
    const { getKeyboardInputs } = useKeyboard();

    commands = new InputMap({
        ...getKeyboardInputs().definedInputs(),
        ...getGamepadInputs().definedInputs(),
    });

    notifyHoldListeners(commands);
    if (!commands.isEmpty()) {
        notifyListeners(commands);
        setTimeout(() => {
            requestAnimationFrame(readInput);
        }, inputGlobalDebounce);
    } else {
        inputDebounceMap = {};
        requestAnimationFrame(readInput);
    }
}

const convergedCommandMap = TypedKeys(defaultGamepadMap).reduce(
    (acc: Partial<Record<MappedCommand, { key: MappedCommand; value: Buttons }>>, key) => {
        defaultGamepadMap[key].forEach((command) => {
            acc[command] = {
                key: command, // Map each command to itself
                value: key,
            };
        });
        return acc;
    },
    {},
);

let inputDisabled = false;
export function suspendInputs() {
    inputDisabled = true;
    return {
        restoreInput: () => {
            inputDisabled = false;
        },
    };
}

export function registerInputListener(cb: () => void, command: MappedCommand | MappedCommand[]) {
    const id = nanoid(16);
    const registrationOrder = ++registrationCounter;
    (Array.isArray(command) ? command : [command]).forEach((arg) => {
        const commandMapping = convergedCommandMap[arg];
        if (!commandMapping) {
            return;
        }
        const commandKey = commandMapping.key;
        currentListeners()[commandKey] = [
            ...(currentListeners()[commandKey] ?? []),
            {
                id,
                cb,
                registrationOrder,
            },
        ];
    });
    return id;
}

export function registerWildcardListener(cb: (commands: InputMap) => void) {
    const id = nanoid(16);
    const registrationOrder = ++registrationCounter;
    currentListeners()['*'] = [
        ...(currentListeners()['*'] ?? []),
        {
            id,
            cb: cb as () => boolean,
            registrationOrder,
        },
    ];
    return id;
}

export function registerHoldListener(cb: (commands?: InputMap) => void) {
    const id = nanoid(16);
    const registrationOrder = ++registrationCounter;
    currentListeners()['all'] = [
        ...(currentListeners()['all'] ?? []),
        { id, cb, registrationOrder },
    ];
    return id;
}

export function unregisterInputListener(id: string) {
    for (let i = listenerStack.length; i--; i >= 0) {
        if (listenerStack[i]) {
            Object.entries(listenerStack[i]).forEach(
                ([key, val]: [keyof InputMap, InputListener[]]) => {
                    const found = val.findIndex((cb) => cb.id === id);
                    if (found >= 0) {
                        listenerStack[i][key].splice(found, 1);
                    }

                    if (listenerStack[i][key].length === 0) {
                        delete listenerStack[i][key];
                    }
                },
            );
        }
    }
}

function pause() {
    const { togglePause } = useGameContext();
    togglePause();
}

export function provideInput() {
    requestAnimationFrame(readInput);
    registerInputListener(pause, 'pause_menu');
}

export function useInput() {
    return {
        stackOwner,
    };
}
