import { useBattle } from '@/state/useBattle';
import { useExploration } from '@/state/useExploration';
import { Engine, Scene } from 'excalibur';
export class ExplorationScene extends Scene {
    constructor() {
        super();
        useExploration().initExplorationManager(this);
        useBattle().initBattleManager(this);
    }

    onInitialize(_engine: Engine): void {
        useExploration().getExplorationManager().initialize();
    }
}
