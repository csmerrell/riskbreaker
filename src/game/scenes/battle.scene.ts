import { DefaultLoader, Engine, ExcaliburGraphicsContext, Scene } from 'excalibur';
import { Actor } from 'excalibur';
import { BattlePartyState, useBattleParty } from '@/state/deprecated/useBattleParty';
import { EnemyWaveState, useEnemyWave } from '@/state/deprecated/useEnemyWave';
import { GameContext, useGameContext } from '@/state/useGameContext';
import { HexTile } from '../actors/Arena/HexTile';

export class BattleScene extends Scene {
    private battlePartyState: BattlePartyState = {} as BattlePartyState;
    private enemyWaveState: EnemyWaveState = {} as EnemyWaveState;
    private gameContext: GameContext;

    constructor() {
        super();
        this.battlePartyState = useBattleParty();
        this.enemyWaveState = useEnemyWave();
        this.gameContext = useGameContext();
    }

    onPreLoad(loader: DefaultLoader) {
        const battlePartyResources = this.battlePartyState.getDependencies();
        const enemyWaveResources = this.enemyWaveState.getDependencies();
        const tileResources = HexTile.getDependencies();
        loader.addResources(
            Array.from(new Set([...battlePartyResources, ...enemyWaveResources, ...tileResources])),
        );
    }

    onPostDraw(_ctx: ExcaliburGraphicsContext, _elapsed: number): void {
        if (!this.gameContext.currentSceneReady.value) {
            this.gameContext.currentSceneReady.set(true);
        }
    }

    public onInitialize(_engine: Engine) {
        const a = new Actor();
        this.add(a);
        this.camera.strategy.lockToActor(a);
    }
}
