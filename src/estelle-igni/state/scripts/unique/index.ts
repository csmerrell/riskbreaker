import { GameScript } from '../types/GameScript';
import { newGameScripts } from './newGame';

export const unique = {
    ...newGameScripts,
} as const satisfies Record<string, GameScript>;
