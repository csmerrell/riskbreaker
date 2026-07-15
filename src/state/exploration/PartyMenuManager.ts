import { EasingFunctions } from 'excalibur';
import { ExplorationManager } from './ExplorationManager';
import { captureControls, registerInputListener, unCaptureControls } from '@/game/input/useInput';
import { loopUntil } from '@/lib/helpers/async.helper';
import { useGameContext } from '../useGameContext';
import { MaskingManager } from '../MaskingManager';
import { useExploration } from '../useExploration';
import { getScale } from '@/lib/helpers/screen.helper';

export class PartyMenuManager extends MaskingManager {
    constructor(protected parent: ExplorationManager) {
        super(parent);
        this.setReady();
    }

    public async open(): Promise<void> {
        captureControls('partyMenu');
        const { activeView } = useGameContext();
        activeView.value = 'party-menu';

        this.parent.cameraManager.unlock();

        return new Promise<void>(async (resolve) => {
            await useExploration().getExplorationManager().ready();
            await Promise.all([
                this.applyMask(),
                this.parent.actorManager.getLeader().fadeOut(),
                this.scene.camera.zoomOverTime(1 + 2 / getScale(), 250, EasingFunctions.Linear),
            ]);
            registerInputListener(() => {
                unCaptureControls();
                this.close();
                activeView.value = 'exploration';
            }, 'cancel');
            resolve();
        });
    }

    public async close(): Promise<void> {
        await Promise.all([
            this.removeMask(),
            this.parent.actorManager.getLeader().fadeIn(),
            this.scene.camera.zoomOverTime(1, 250, EasingFunctions.Linear),
        ]);
        this.parent.actorManager.getLeader().graphics.opacity = 1;
        this.parent.cameraManager.lockToActor(this.parent.actorManager.getLeader());
    }
}
