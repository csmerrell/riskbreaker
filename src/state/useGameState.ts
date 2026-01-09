import { useExploration } from './useExploration';

const { loadExplorationState, saveExplorationState } = useExploration();

async function saveGame() {
    await saveExplorationState();
}

async function loadSave() {
    const promises = [];
    promises.push(loadExplorationState());

    return Promise.all(promises);
}

const gameState = {
    saveGame,
    loadSave,
};

export type GameState = typeof gameState;

export function useGameState() {
    return gameState;
}
