import { vec, Vector } from 'excalibur';
import { ExplorationMovementManager } from './ExplorationMovementManager';
import { makeState } from '@/state/Observable';
import { LanternManager } from '@/state/exploration/LanternManager';
import { BonfireManager } from '@/state/exploration/BonfireManager';
import type { SavedExplorationState } from '@/state/useExploration';
import { docManager } from '@/db';
import { SceneManager, SceneManagerOpts } from '../SceneManager';
import { MapManager } from './MapManager';
import { CameraManager } from './CameraManager';
import { ActorManager } from './ActorManager';
import { CampManager } from './CampManager';
import { BattleManager } from '../battle/BattleManager';
import { captureControls } from '@/game/input/useInput';

export class ExplorationManager extends SceneManager {
    public playerTileCoord = makeState<Vector>();
    public movementManager: ExplorationMovementManager;
    public mapManager: MapManager;
    public cameraManager: CameraManager;
    public actorManager: ActorManager;
    public battleManager: BattleManager;
    public campManager: CampManager;
    public lanternManager: LanternManager;
    public bonfireManager: BonfireManager;

    constructor(opts: SceneManagerOpts) {
        super(opts);

        this.actorManager = new ActorManager(this);
        this.movementManager = new ExplorationMovementManager(this);
        this.mapManager = new MapManager(this);
        this.cameraManager = new CameraManager(this);
        this.campManager = new CampManager(this);
        this.lanternManager = new LanternManager(this);
        this.bonfireManager = new BonfireManager(this);
        this.battleManager = new BattleManager(this);
    }

    public initialize() {
        // Load the test map and create actor
        captureControls('Exploration');
        this.setReady();
    }

    public async loadFromSave() {
        const state = await docManager.tryGet<SavedExplorationState>('_local/explorationState');
        if (state) {
            const { mapKey, playerCoord } = state;
            await this.mapManager.loadMap(mapKey);
            this.mapManager.placePlayerAtTile(vec(playerCoord.x, playerCoord.y));
        }
    }
}
