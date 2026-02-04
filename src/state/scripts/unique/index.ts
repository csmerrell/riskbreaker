import { GameScript } from '../types/GameScript';
import { intro } from './intro';
import { newGameTitle } from './newGameTitle';

export const unique = {
    intro,
    newGameTitle,
} as const satisfies Record<string, GameScript>;
