import { Axes, Buttons } from 'excalibur';
import { InputMap, MappedCommand } from './InputMap';
import { useGameContext } from '@/state/useGameContext';

export const defaultGamepadMap: Record<Buttons, MappedCommand[]> = {
    [Buttons.Face1]: ['confirm', 'hotbarFDown'],
    [Buttons.Face2]: ['cancel', 'hotbarFRight'],
    [Buttons.Face3]: ['inspect_details', 'hotbarFLeft'],
    [Buttons.Face4]: ['context_menu_1', 'hotbarFUp'],
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

export function useGamepad() {
    const buttonMap = { ...defaultGamepadMap };

    function initGamepads() {
        const { game } = useGameContext();
        const { input } = game.value;

        input.gamepads.toggleEnabled(true);
        input.gamepads.setMinimumGamepadConfiguration({
            axis: 2,
            buttons: 12,
        });
    }

    function getGamepadInputs() {
        const { inputType } = useGameContext();
        const result = new InputMap();

        navigator.getGamepads().forEach((gp) => {
            if (!gp || (gp.buttons.length ?? 0) < 12) {
                return;
            }

            // Poll all buttons
            (Object.entries(buttonMap) as [string, MappedCommand[]][]).forEach(
                ([buttonStr, commands]) => {
                    const button = Number(buttonStr) as Buttons;
                    if (gp.buttons[button]?.pressed) {
                        inputType.set('controller');
                        commands.forEach((command) => {
                            result[command] = true;
                        });
                    }
                },
            );

            // Poll analog sticks
            (axisComparisons as [Axes, Axes][]).forEach(
                ([primaryKey, secondaryKey]: [Axes, Axes]) => {
                    const primaryValue = gp.axes[primaryKey];
                    const siblingValue = gp.axes[secondaryKey];
                    axisMap[primaryKey](primaryValue, siblingValue).forEach(
                        (command: MappedCommand) => {
                            inputType.set('controller');
                            result[command] = true;
                        },
                    );
                },
            );
        });
        return result;
    }

    function getUnmappedButton(mapped: MappedCommand) {
        return (Object.entries(buttonMap) as unknown as [Buttons, MappedCommand[]][]).find(
            ([_key, value]) => value.includes(mapped),
        )?.[0];
    }

    return {
        buttonMap,
        getGamepadInputs,
        getUnmappedButton,
        initGamepads,
    };
}
