import { EasingFunctions } from 'excalibur';
import { ExplorationManager } from './ExplorationManager';
import { captureControls, registerInputListener, unCaptureControls } from '@/game/input/useInput';
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
        this.parent.movementManager.disableMovement();
        await this.parent.movementManager.movementReleased;
        await this.parent.cameraManager.awaitCameraSettle();

        captureControls('partyMenu');
        useGameContext().activeView.value = 'party-menu';

        this.parent.cameraManager.unlock();

        return new Promise<void>(async (resolve) => {
            await useExploration().getExplorationManager().ready();
            await Promise.all([
                this.applyMask({ opacity: 0.9, duration: 50 }),
                this.parent.actorManager.getLeader().fadeOut(),
                this.scene.camera.zoomOverTime(1 + 2 / getScale(), 250, EasingFunctions.Linear),
            ]);
            registerInputListener(() => {
                this.close();
            }, 'cancel');
            resolve();
        });
    }

    public async close(): Promise<void> {
        await Promise.all([
            this.removeMask({ duration: 50 }),
            this.parent.actorManager.getLeader().fadeIn(),
            this.scene.camera.zoomOverTime(1, 250, EasingFunctions.Linear),
        ]);
        this.parent.actorManager.getLeader().graphics.opacity = 1;
        this.parent.cameraManager.lockToActor(this.parent.actorManager.getLeader());
        setTimeout(() => {
            unCaptureControls();
            this.parent.movementManager.enableMovement();
            useGameContext().activeView.value = 'exploration';
        }, 25);
    }
}
