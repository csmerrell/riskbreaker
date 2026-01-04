import { DefaultLoader, Engine, ExcaliburGraphicsContext, Scene } from 'excalibur';
import { Actor } from 'excalibur';
import { BattlePartyState, useBattleParty } from '@/state/useBattleParty';
import { GameContext, useGameContext } from '@/state/useGameContext';
import { EnemyWaveState, useEnemyWave } from '@/state/useEnemyWave';
import { HexTile } from '../actors/Arena/HexTile';
import { AuroraBG } from '../actors/Effects/Aurora.actor';

export class BattleScene extends Scene {
    private battlePartyState: BattlePartyState = {} as BattlePartyState;
    private enemyWaveState: EnemyWaveState = {} as EnemyWaveState;
    private gameContext: GameContext;
    private auroraBg: AuroraBG;

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
        const auroraResources = AuroraBG.getDependencies();
        loader.addResources(
            Array.from(
                new Set([
                    ...battlePartyResources,
                    ...enemyWaveResources,
                    ...tileResources,
                    ...auroraResources,
                ]),
            ),
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

        this.auroraBg = new AuroraBG();
        this.add(this.auroraBg);
    }
}
