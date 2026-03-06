import { resources } from '@/resource';
import { Buttons, Keys, SpriteSheet } from 'excalibur';

export type SpriteMap = [number, number, { width?: number; height?: number }];
export type ControlSpriteMap = Partial<Record<Buttons | Keys, SpriteMap>>;

export const GAMEPAD_GRID_CONFIG = {
    rows: 30,
    columns: 43,
    spriteWidth: 16,
    spriteHeight: 16,
};

// Lazy initialization to avoid race condition with resource loading
let _gamepadSpriteSheet: SpriteSheet | null = null;
export const gamepadSpriteSheet = () => {
    if (!_gamepadSpriteSheet) {
        _gamepadSpriteSheet = SpriteSheet.fromImageSource({
            image: resources.image.controls.gamepad,
            grid: GAMEPAD_GRID_CONFIG,
        });
    }
    return _gamepadSpriteSheet;
};

// Static keyboard spritesheet configuration
export const KEYBOARD_STATIC_GRID_CONFIG = {
    rows: 15,
    columns: 23,
    spriteWidth: 16,
    spriteHeight: 16,
};

let _keyboardSpriteSheet: SpriteSheet | null = null;
export const keyboardSpriteSheet = () => {
    if (!_keyboardSpriteSheet) {
        _keyboardSpriteSheet = SpriteSheet.fromImageSource({
            image: resources.image.controls.keyboard,
            grid: KEYBOARD_STATIC_GRID_CONFIG,
        });
    }
    return _keyboardSpriteSheet;
};

// Animated keyboard spritesheet configuration
export const KEYBOARD_ANIMATED_GRID_CONFIG = {
    rows: 25,
    columns: 24,
    spriteWidth: 16,
    spriteHeight: 16,
};

let _animatedKeyboardSpriteSheet: SpriteSheet | null = null;
export const animatedKeyboardSpriteSheet = () => {
    if (!_animatedKeyboardSpriteSheet) {
        _animatedKeyboardSpriteSheet = SpriteSheet.fromImageSource({
            image: resources.image.controls.keyboard_black_animated,
            grid: KEYBOARD_ANIMATED_GRID_CONFIG,
        });
    }
    return _animatedKeyboardSpriteSheet;
};

export const gamepadSpriteMap: ControlSpriteMap = {
    [Buttons.Face1]: [15, 2, { width: 1 }],
    [Buttons.Face2]: [15, 3, { width: 1 }],
    [Buttons.Face3]: [15, 4, { width: 1 }],
    [Buttons.Face4]: [15, 5, { width: 1 }],
    [Buttons.LeftBumper]: [1, 7, { width: 1 }],
    [Buttons.LeftTrigger]: [1, 8, { width: 1 }],
    [Buttons.RightBumper]: [8, 7, { width: 1 }],
    [Buttons.RightTrigger]: [8, 8, { width: 1 }],
};

export const animatedGamepadSpriteMap: ControlSpriteMap = {
    [Buttons.Face1]: [17, 2, { width: 1 }],
    [Buttons.Face2]: [17, 3, { width: 1 }],
};

// Static sprite positions (23×15 grid)
export const keySpriteMap: ControlSpriteMap = {
    Enter: [7, 13, { width: 3 }],
    Tab: [7, 12, { width: 2 }],
    Escape: [9, 12, { width: 2 }],
    [Keys.F]: [4, 5, { width: 1 }],
};

// Animated sprite positions - frames are arranged vertically
export const animatedKeySpriteMap: ControlSpriteMap = {
    Tab: [19, 11, { width: 2 }],
    Escape: [0, 20, { width: 2 }],
    Enter: [0, 24, { width: 3 }],
};
