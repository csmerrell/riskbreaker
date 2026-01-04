import { TileField, TileKey } from '@/game/actors/Arena/TileField';
import { StrategemActor } from '@/game/actors/StrategemActor/StrategemActor';
import { ref } from 'vue';
import { vec } from 'excalibur';
import { AssembledBattleUnit, useBattleParty } from './useBattleParty';
import { useEnemyWave } from './useEnemyWave';
import { useGameContext } from './useGameContext';
import { useBattleState } from './useBattleState';
import { MAX_CT, SpeedComponent } from '@/game/actors/StrategemActor/components/SpeedComponent';

const partyBox = ref<HTMLElement>();
const enemyBox = ref<HTMLElement>();
const partyTiles = ref<TileField>();
const enemyTiles = ref<TileField>();

const battlefield = {
    partyBox,
    partyTiles,
    enemyBox,
    enemyTiles,
    addActorsToField: (units: AssembledBattleUnit[], tileField: TileField) => {
        units.forEach((u) => {
            const hex = tileField.getHex(`${u.line}_${u.cell}` as TileKey);
            u.actor.hex = hex;
        });
    },
    adjustTileFields: () => {
        partyTiles.value.setAnchor(partyBox.value);
        enemyTiles.value.setAnchor(enemyBox.value);
        const { party } = useBattleParty();
        battlefield.repositionActors(party.value);

        const { currentWave } = useEnemyWave();
        battlefield.repositionActors(currentWave.value);
    },
    initFields: () => {
        const { party } = useBattleParty();
        const { currentWave } = useEnemyWave();
        const { game } = useGameContext();

        partyTiles.value = new TileField('party');
        game.value.currentScene.add(partyTiles.value);
        enemyTiles.value = new TileField('enemy');
        game.value.currentScene.add(enemyTiles.value);

        battlefield.addActorsToField(party.value, partyTiles.value);
        party.value.forEach((u) => {
            game.value.currentScene.add(u.actor);
        });
        battlefield.addActorsToField(currentWave.value, enemyTiles.value);
        currentWave.value.forEach((u) => {
            game.value.currentScene.add(u.actor);
        });
    },
    initATB: (alignment?: 'party' | 'enemy') => {
        const { getAllUnits } = useBattleState();
        const units = alignment
            ? getAllUnits().filter((u) => u.alignment === alignment)
            : getAllUnits();
        const unitSpeeds = units.map((u) => u.getComponent(SpeedComponent).chargePerTick());
        const minSpeed = Math.min(...unitSpeeds);
        const maxSpeed = Math.max(...unitSpeeds);

        // Build bands: one for each integer speed from (minSpeed - 1) to maxSpeed
        const bands: number[] = [];
        for (let s = minSpeed - 1; s <= maxSpeed; s++) {
            bands.push(s);
        }
        const bandCount = bands.length;

        // Assign each speed to a band index
        const speedToBand = new Map<number, number>();
        bands.forEach((speed, idx) => speedToBand.set(speed, idx));

        // Calculate charge range for each band
        const bandWidth = (MAX_CT * 0.8) / (bandCount - 1);
        getAllUnits().forEach((u) => {
            if (u.isDead()) return;
            u.getComponent(SpeedComponent).addChargeEntropy(speedToBand, bandWidth);
        });
    },
    repositionActors(units: AssembledBattleUnit[]) {
        units.forEach((u) => {
            u.actor.pos = vec(
                u.actor.hex.pos.x - StrategemActor.posOffset.x,
                u.actor.hex.pos.y - StrategemActor.posOffset.y,
            );
            u.actor.hex.setActorRef(u.actor);
        });
    },
};

export function useBattlefield() {
    return battlefield;
}
