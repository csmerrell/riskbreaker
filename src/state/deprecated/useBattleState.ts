import { useBattleParty } from './useBattleParty';
import { useEnemyWave } from './useEnemyWave';

const getAllUnits = () => {
    const { party } = useBattleParty();
    const { currentWave } = useEnemyWave();
    return party.value.concat(currentWave.value).map((u) => u.actor);
};

const battleState = {
    getAllUnits,
};

export function useBattleState() {
    return battleState;
}
