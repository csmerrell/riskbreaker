import { SaveState } from './saveState';
import { initBattleParty } from './useBattleParty';
import { initRoster } from './useRoster';

function saveState() {}

function loadSave(savedState: SaveState) {
    initRoster(savedState);
    initBattleParty(savedState);
}

const gameState = {
    saveState,
    loadSave,
};

export type GameState = typeof gameState;

export function useGameState() {
    return gameState;
}
