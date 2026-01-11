import { useExploration } from './useExploration';
import { useSettings } from './useSettings';

const { loadExplorationState, saveExplorationState } = useExploration();
const { loadSettings } = useSettings();

async function saveGame() {
    await saveExplorationState();
}

async function loadSave() {
    const promises = [];
    promises.push(loadExplorationState());
    promises.push(loadSettings());

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
