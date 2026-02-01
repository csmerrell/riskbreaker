import { GameScript } from '../types/GameScript';
import { intro } from './intro';

export const unique = {
    intro,
} as const satisfies Record<string, GameScript>;
