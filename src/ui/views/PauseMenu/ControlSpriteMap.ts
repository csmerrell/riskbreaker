import { resources } from '@/resource';
import { Keys, SpriteSheet } from 'excalibur';

export type SpriteMap = [number, number, { width?: number; height?: number }];
export type ControlSpriteMap = Partial<Record<Keys, SpriteMap>>;

// Static keyboard spritesheet configuration
export const keyboardSpriteSheet = SpriteSheet.fromImageSource({
    image: resources.image.controls.keyboard,
    grid: {
        rows: 15,
        columns: 23,
        spriteWidth: 16,
        spriteHeight: 16,
    },
});

// Animated keyboard spritesheet configuration
export const animatedKeyboardSpriteSheet = SpriteSheet.fromImageSource({
    image: resources.image.controls.keyboard_black_animated,
    grid: {
        rows: 15,
        columns: 92, // 23 columns × 4 animation frames
        spriteWidth: 16,
        spriteHeight: 16,
    },
});

// Static sprite positions (23×15 grid)
export const keySpriteMap: ControlSpriteMap = {
    Enter: [7, 13, { width: 3 }],
    Tab: [7, 12, { width: 2 }],
    Escape: [9, 12, { width: 2 }],
};

// Animated sprite positions - frames are arranged vertically
export const animatedKeySpriteMap: ControlSpriteMap = {
    Tab: [19, 11, { width: 2 }],
    Escape: [0, 20, { width: 2 }],
};
