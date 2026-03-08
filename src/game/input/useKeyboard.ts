import { Keys } from 'excalibur';
import { InputMap, MappedCommand } from './InputMap';
import { useGameContext } from '@/state/useGameContext';
import { TypedKeys } from '@/lib/types/ClassHelper';

export const defaultKeyboardMap: Partial<Record<Keys, MappedCommand[]>> = {
    [Keys.Enter]: ['confirm'],
    [Keys.Esc]: ['cancel'],
    [Keys.B]: ['context_menu_1'],
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
    [Keys.Key1]: ['hotbar1'],
    [Keys.Num2]: ['hotbar2'],
    [Keys.Key2]: ['hotbar2'],
    [Keys.Num3]: ['hotbar3'],
    [Keys.Key3]: ['hotbar3'],
    [Keys.Num4]: ['hotbar4'],
    [Keys.Key4]: ['hotbar4'],
    [Keys.Num5]: ['hotbar5'],
    [Keys.Key5]: ['hotbar5'],
    [Keys.Num6]: ['hotbar6'],
    [Keys.Key6]: ['hotbar6'],
    [Keys.Num7]: ['hotbar7'],
    [Keys.Key7]: ['hotbar7'],
    [Keys.Num8]: ['hotbar8'],
    [Keys.Key8]: ['hotbar8'],
    [Keys.Num9]: ['hotbar9'],
    [Keys.Key9]: ['hotbar9'],
    [Keys.Num0]: ['hotbar10'],
    [Keys.Key0]: ['hotbar10'],
};

export function useKeyboard() {
    const keyMap = { ...defaultKeyboardMap };

    function initKeyboard() {
        const { game } = useGameContext();
        const { input } = game.value;
        input.keyboard.toggleEnabled(true);
        
        // Prevent Tab from triggering browser focus navigation
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
            }
        });
    }

    function getKeyboardInputs() {
        const { game, inputType } = useGameContext();
        const { input } = game.value;
        const result = new InputMap();

        // Poll all mapped keys
        TypedKeys(keyMap).forEach((key) => {
            if (input.keyboard.isHeld(key)) {
                inputType.set('keyboard');
                keyMap[key]?.forEach((command) => {
                    result[command] = true;
                });
            }
        });

        return result;
    }

    function getUnmappedKey(mapped: MappedCommand) {
        return (Object.entries(keyMap) as [Keys, MappedCommand[]][]).find(([_key, value]) =>
            value.includes(mapped),
        )?.[0];
    }

    return {
        keyMap,
        getKeyboardInputs,
        getUnmappedKey,
        initKeyboard,
    };
}
