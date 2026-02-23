import { Actor, LockCameraToActorStrategy } from 'excalibur';
import { SceneManager } from '../SceneManager';
import type { ExplorationManager } from './ExplorationManager';

export class CameraManager extends SceneManager {
    private primaryTarget?: Actor;
    private currentTarget?: Actor;
    private lockStrategy: LockCameraToActorStrategy;

    constructor(private parent: ExplorationManager) {
        super({ scene: parent.scene });
    }

    public setPrimaryTarget(actor: Actor): void {
        this.primaryTarget = actor;
        this.lockToActor(actor);
    }

    public lockToActor(actor: Actor): void {
        this.currentTarget = actor;

        // If camera position is NaN, manually initialize it to the actor's position
        // This happens during scene initialization before ExcaliburJS has run its first update
        if (actor && (isNaN(this.scene.camera.x) || isNaN(this.scene.camera.y))) {
            this.scene.camera.pos = actor.pos.clone();
        }

        this.lockStrategy = new LockCameraToActorStrategy(actor);
        this.scene.camera.addStrategy(this.lockStrategy);
        this.parent.mapManager.applyCameraBounds();
    }

    public returnToPrimary(): void {
        if (!this.primaryTarget) {
            console.warn('Cannot return to primary target: no primary target set');
            return;
        }
        this.lockToActor(this.primaryTarget);
    }

    public unlock(): void {
        if (this.lockStrategy) {
            this.scene.camera.removeStrategy(this.lockStrategy);
            delete this.lockStrategy;
        }
        this.parent.mapManager.applyCameraBounds();
    }

    public getPrimaryTarget(): Actor | undefined {
        return this.primaryTarget;
    }

    public getCurrentTarget(): Actor | undefined {
        return this.currentTarget;
    }
}
