import { GameScript } from '../types/GameScript';
import { intro } from './intro';
import { newGameOriginSelect } from './newGameOriginSelect';
import { newGameTitle } from './newGameTitle';

export const unique = {
    intro,
    newGameTitle,
    newGameOriginSelect,
} as const satisfies Record<string, GameScript>;
