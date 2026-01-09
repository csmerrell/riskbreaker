import { makeState } from '../Observable';
import { SaveState, UnitState } from './saveState/index';

export const roster = makeState<Record<number, UnitState>>();

export function initRoster(saveState: SaveState) {
    const stateCopy = { ...saveState.roster };
    const result: Record<number, UnitState> = {};
    Object.entries(stateCopy).forEach(([id, unitState]) => {
        const num = parseInt(id, 10);
        result[num] = new UnitState(unitState);
    });
    roster.set(result);
}

const playerRoster = {
    roster,
};
export type PlayerRosterState = typeof playerRoster;

export function usePlayerRoster() {
    return playerRoster;
}
