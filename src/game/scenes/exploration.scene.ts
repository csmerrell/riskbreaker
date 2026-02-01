import { ExplorationManager } from '@/state/exploration/ExplorationManager';
import { useGameContext } from '@/state/useGameContext';
import { Engine, Scene } from 'excalibur';
export class ExplorationScene extends Scene {
    private manager: ExplorationManager;
    constructor() {
        super();
        this.manager = new ExplorationManager({
            engine: useGameContext().game.value,
            scene: this,
        });
    }

    onInitialize(_engine: Engine): void {
        this.manager.initialize();
    }
}
