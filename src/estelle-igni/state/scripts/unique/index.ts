import { GameScript } from '../types/GameScript';
import { gauntletScripts } from './gauntlet';
import { newGameScripts } from './newGame';

export const unique = {
    ...newGameScripts,
    ...gauntletScripts,
} as const satisfies Record<string, GameScript>;
