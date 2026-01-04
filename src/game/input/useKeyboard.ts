import { Keys } from 'excalibur';
import { InputMap, MappedCommand } from './InputMap';
import { useGameContext } from '@/state/useGameContext';
import { TypedKeys } from '@/lib/types/ClassHelper';

export const defaultKeyboardMap: Partial<Record<Keys, MappedCommand[]>> = {
    [Keys.Enter]: ['confirm'],
    [Keys.Esc]: ['cancel'],
    [Keys.P]: ['context_menu_1'],
    [Keys.F]: ['inspect_details'],
    [Keys.ArrowDown]: ['menu_down'],
    [Keys.S]: ['movement_down'],
    [Keys.ArrowRight]: ['menu_right'],
    [Keys.D]: ['movement_right'],
    [Keys.ArrowUp]: ['menu_up'],
    [Keys.W]: ['movement_up'],
    [Keys.ArrowLeft]: ['menu_left'],
    [Keys.A]: ['movement_left'],
    [Keys.Q]: ['tab_left'],
    [Keys.E]: ['tab_right'],
    [Keys.ControlLeft]: ['shoulder_left'],
    [Keys.ControlRight]: ['shoulder_left'],
    [Keys.ShiftLeft]: ['shoulder_right'],
    [Keys.ShiftRight]: ['shoulder_right'],
    [Keys.Tab]: ['context_menu_2'],
    [Keys.Space]: ['pause_menu'],
    [Keys.Num1]: ['hotbar1'],
    [Keys.Num2]: ['hotbar2'],
    [Keys.Num3]: ['hotbar3'],
    [Keys.Num4]: ['hotbar4'],
    [Keys.Num5]: ['hotbar5'],
    [Keys.Num6]: ['hotbar6'],
    [Keys.Num7]: ['hotbar7'],
    [Keys.Num8]: ['hotbar8'],
    [Keys.Num9]: ['hotbar9'],
    [Keys.Num0]: ['hotbar10'],
};

const heldKeys = [
    Keys.ArrowDown,
    Keys.ArrowUp,
    Keys.ArrowLeft,
    Keys.ArrowRight,
    Keys.W,
    Keys.A,
    Keys.S,
    Keys.D,
    Keys.ControlLeft,
    Keys.ControlRight,
    Keys.ShiftLeft,
    Keys.ShiftRight,
];
const debouncedInputs: MappedCommand[] = [
    'menu_right',
    'menu_left',
    'menu_down',
    'menu_up',
    'movement_right',
    'movement_left',
    'movement_down',
    'movement_up',
];
const debounceCounts = debouncedInputs.reduce(
    (acc: Partial<Record<MappedCommand, number>>, key) => {
        return {
            ...acc,
            [key]: 0,
        };
    },
    {},
);

const keyboardInputs = new InputMap();

export function useKeyboard() {
    function initKeyboard() {
        const keyMap = { ...defaultKeyboardMap };
        const { game } = useGameContext();
        const { input } = game.value;

        input.keyboard.toggleEnabled(true);
        input.keyboard.on('press', (e) => {
            const { key } = e;
            keyMap[key]?.forEach((command) => {
                keyboardInputs[command] = true;
            });
        });

        input.keyboard.on('hold', (e) => {
            const { key } = e;
            heldKeys.forEach((heldKey) => {
                if (key === heldKey) {
                    keyMap[key]?.forEach((command) => {
                        keyboardInputs[command] = true;
                    });
                }
            });
        });

        input.keyboard.on('release', (e) => {
            const { key } = e;
            heldKeys.forEach((heldKey) => {
                if (key === heldKey) {
                    keyMap[key]?.forEach((command) => {
                        keyboardInputs[command] = false;
                    });
                }
            });
        });
    }

    let persistentKeys: MappedCommand[] = [];
    function cullDebouncedHeldControls() {
        persistentKeys = [];
        TypedKeys(debounceCounts).forEach((command) => {
            if (keyboardInputs[command]) {
                debounceCounts[command]++;
                if (debounceCounts[command] > 1 && debounceCounts[command] < 10) {
                    delete keyboardInputs[command];
                } else {
                    persistentKeys.push(command);
                }
            } else {
                debounceCounts[command] = 0;
                delete keyboardInputs[command];
            }
        });
        return heldKeys;
    }

    function getKeyboardInputs() {
        cullDebouncedHeldControls();
        return new InputMap({
            ...keyboardInputs.definedInputs(),
        });
    }

    function clear() {
        keyboardInputs.clear({ exemptCommands: persistentKeys });
    }

    return {
        clear,
        getKeyboardInputs,
        initKeyboard,
    };
}
