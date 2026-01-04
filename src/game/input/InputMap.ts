import { PrimitivesOf, TypedKeys } from '@/lib/types/ClassHelper';

export type GameCommand = {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in keyof InputMap]: InputMap[K] extends () => any ? never : K;
};

export const mutuallyExclusiveMappings: (keyof InputMap)[][] = [];
const primaryButtons: (keyof InputMap)[] = [
    'confirm',
    'cancel',
    'inspect_details',
    'pause_menu',
    'context_menu_2',
    'context_menu_1',
    'tab_right',
    'tab_left',
    'shoulder_left',
    'shoulder_right',
];
const menuMovement: (keyof InputMap)[] = ['menu_up', 'menu_down', 'menu_left', 'menu_right'];
const characterMovement: (keyof InputMap)[] = ['menu_up', 'menu_down', 'menu_left', 'menu_right'];
mutuallyExclusiveMappings.push([...primaryButtons]);
mutuallyExclusiveMappings.push([...primaryButtons, ...menuMovement]);
mutuallyExclusiveMappings.push([...primaryButtons, ...characterMovement]);

export class InputMap {
    confirm?: boolean;
    cancel?: boolean;
    inspect_details?: boolean;
    tab_left?: boolean;
    tab_right?: boolean;
    shoulder_left?: boolean;
    shoulder_right?: boolean;
    pause_menu?: boolean;
    context_menu_2?: boolean;
    context_menu_1?: boolean;
    menu_left?: boolean;
    menu_right?: boolean;
    menu_up?: boolean;
    menu_down?: boolean;
    movement_left?: boolean;
    movement_right?: boolean;
    movement_up?: boolean;
    movement_down?: boolean;
    hotbarFDown?: boolean;
    hotbarFRight?: boolean;
    hotbarFUp?: boolean;
    hotbarFLeft?: boolean;
    hotbarDDown?: boolean;
    hotbarDRight?: boolean;
    hotbarDUp?: boolean;
    hotbarDLeft?: boolean;
    hotbar1?: boolean;
    hotbar2?: boolean;
    hotbar3?: boolean;
    hotbar4?: boolean;
    hotbar5?: boolean;
    hotbar6?: boolean;
    hotbar7?: boolean;
    hotbar8?: boolean;
    hotbar9?: boolean;
    hotbar10?: boolean;

    constructor(copy?: Partial<GameCommand>) {
        if (copy) {
            Object.assign(this, copy);
        }
    }

    static allCommands(): MappedCommand[] {
        const sample = new InputMap();
        return Object.keys(sample)
            .filter((key: keyof InputMap) => {
                return typeof sample[key] !== 'function';
            })
            .map((key) => key as MappedCommand);
    }

    public definedInputs(): Partial<GameCommand> {
        const result: Record<string, GameCommand> = {};
        Object.entries(this).forEach(([key, val]) => {
            if (val !== undefined && typeof val !== 'function') {
                result[key] = val;
            }
        });
        return result;
    }

    public isEmpty() {
        return (
            Object.values(this).filter((v) => typeof v !== 'function' && v !== undefined).length ===
            0
        );
    }

    public clear(options: { exemptCommands?: MappedCommand[] } = {}) {
        const { exemptCommands = [] } = options;
        TypedKeys(this).forEach((key) => {
            if (typeof this[key] !== 'function' && !exemptCommands.includes(key as MappedCommand)) {
                delete this[key];
            }
        });
    }
}

export type MappedCommand = keyof PrimitivesOf<InputMap>;
