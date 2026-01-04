import { Axes, Buttons } from 'excalibur';
import { InputMap, MappedCommand } from './InputMap';
import { useGameContext } from '@/state/useGameContext';

export const defaultGamepadMap: Record<Buttons, MappedCommand[]> = {
    [Buttons.Face1]: ['confirm', 'hotbarFDown'],
    [Buttons.Face2]: ['cancel', 'hotbarFRight'],
    [Buttons.Face3]: ['context_menu_1', 'hotbarFUp'],
    [Buttons.Face4]: ['inspect_details', 'hotbarFLeft'],
    [Buttons.DpadDown]: ['menu_down', 'movement_down', 'hotbarDDown'],
    [Buttons.DpadRight]: ['menu_right', 'movement_right', 'hotbarDRight'],
    [Buttons.DpadUp]: ['menu_up', 'movement_up', 'hotbarDUp'],
    [Buttons.DpadLeft]: ['menu_left', 'movement_left', 'hotbarDLeft'],
    [Buttons.LeftBumper]: ['tab_left'],
    [Buttons.RightBumper]: ['tab_right'],
    [Buttons.LeftTrigger]: ['shoulder_left'],
    [Buttons.RightTrigger]: ['shoulder_right'],
    [Buttons.LeftStick]: [],
    [Buttons.RightStick]: [],
    [Buttons.Select]: ['context_menu_2'],
    [Buttons.Start]: ['pause_menu'],
    [Buttons.CenterButton]: [],
    [Buttons.MiscButton1]: [],
    [Buttons.Unknown]: [],
};

export const axisMap: Record<
    Axes,
    (polledAxisValue: number, siblingAxisValue: number) => MappedCommand[]
> = {
    [Axes.LeftStickX]: (polledAxisValue: number, siblingAxisValue: number) => {
        if (polledAxisValue > 0.3) {
            return Math.abs(polledAxisValue) < Math.abs(siblingAxisValue)
                ? ['movement_right']
                : ['menu_right', 'movement_right'];
        } else if (polledAxisValue < -0.3) {
            return Math.abs(polledAxisValue) < Math.abs(siblingAxisValue)
                ? ['movement_left']
                : ['menu_left', 'movement_left'];
        } else {
            return [];
        }
    },
    [Axes.LeftStickY]: (polledAxisValue: number, siblingAxisValue: number) => {
        if (polledAxisValue > 0.3) {
            return Math.abs(polledAxisValue) < Math.abs(siblingAxisValue)
                ? ['movement_down']
                : ['menu_down', 'movement_down'];
        } else if (polledAxisValue < -0.3) {
            return Math.abs(polledAxisValue) < Math.abs(siblingAxisValue)
                ? ['movement_up']
                : ['menu_up', 'movement_up'];
        } else {
            return [];
        }
    },
    [Axes.RightStickX]: (_polledAxisValue: number, _siblingAxisValue: number) => [],
    [Axes.RightStickY]: (_polledAxisValue: number, _siblingAxisValue: number) => [],
};

const axisComparisons = [
    [Axes.LeftStickX, Axes.LeftStickY],
    [Axes.LeftStickY, Axes.LeftStickX],
    [Axes.RightStickX, Axes.RightStickY],
    [Axes.RightStickY, Axes.RightStickX],
];

const heldButtons = [
    Buttons.DpadDown,
    Buttons.DpadLeft,
    Buttons.DpadRight,
    Buttons.DpadUp,
    Buttons.RightTrigger,
    Buttons.LeftTrigger,
];
const debouncedInputs: MappedCommand[] = ['menu_right', 'menu_left', 'menu_down', 'menu_up'];
const debounceCounts = debouncedInputs.reduce(
    (acc: Partial<Record<MappedCommand, number>>, key) => {
        return {
            ...acc,
            [key]: 0,
        };
    },
    {},
);

const gamepadInputs = new InputMap();

export function useGamepad() {
    function initGamepads() {
        const buttonMap = { ...defaultGamepadMap };
        const { game } = useGameContext();
        const { input } = game.value;

        input.gamepads.toggleEnabled(true);
        input.gamepads.setMinimumGamepadConfiguration({
            axis: 2,
            buttons: 12,
        });

        input.gamepads.on('connect', (connection) => {
            connection.gamepad.on('button', (e) => {
                const { button } = e;
                buttonMap[button].forEach((key) => {
                    gamepadInputs[key] = true;
                });
            });
        });
    }

    function mapHeldControls() {
        const buttonMap = { ...defaultGamepadMap };
        const result = new InputMap();

        const debouncedCommands: Partial<Record<MappedCommand, boolean>> = {};
        function checkCommandDebounce(command: MappedCommand) {
            if (debounceCounts[command] === undefined) {
                return false;
            }

            debounceCounts[command]++;
            debouncedCommands[command] = true;
            if (debounceCounts[command] > 1 && debounceCounts[command] < 6) {
                return true;
            }
        }

        navigator.getGamepads().forEach((gp) => {
            if ((gp?.buttons.length ?? 0) < 12) {
                return;
            }

            heldButtons.forEach((key) => {
                if (gp.buttons[key].pressed) {
                    buttonMap[key].forEach((command) => {
                        if (checkCommandDebounce(command)) {
                            return;
                        }
                        result[command] = true;
                    });
                }
            });

            axisComparisons.forEach(([primaryKey, secondaryKey]: [Axes, Axes]) => {
                const primaryValue = gp.axes[primaryKey];
                const siblingValue = gp.axes[secondaryKey];
                axisMap[primaryKey](primaryValue, siblingValue).forEach(
                    (command: MappedCommand) => {
                        if (checkCommandDebounce(command)) {
                            return;
                        }
                        result[command] = true;
                    },
                );
            });
        });

        //reset debounce counts
        debouncedInputs.forEach((command) => {
            if (debounceCounts[command] > 0 && !debouncedCommands[command]) {
                debounceCounts[command] = 0;
            }
        });

        return result;
    }

    function getGamepadInputs() {
        return new InputMap({
            ...gamepadInputs.definedInputs(),
            ...mapHeldControls().definedInputs(),
        });
    }

    return {
        clear: () => gamepadInputs.clear(),
        getGamepadInputs,
        initGamepads,
    };
}
