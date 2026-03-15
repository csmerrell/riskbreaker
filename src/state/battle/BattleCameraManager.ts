import { Actor, Vector } from 'excalibur';
import { BattleManager } from './BattleManager';
import { useExploration } from '../useExploration';
import { CameraManager } from '../exploration/CameraManager';
import { getScale } from '@/lib/helpers/screen.helper';
import { makeState } from '../Observable';

export class BattleCameraManager {
    public battleCenter: Vector;
    private rootCameraManager: CameraManager;
    public zoomFactor = makeState(1 / getScale());
    public movementDuration = makeState(500);

    constructor(private parent: BattleManager) {
        this.battleCenter = parent.scene.camera.pos;
        this.rootCameraManager = useExploration().getExplorationManager().cameraManager;
        this.rootCameraManager.unlock();
    }

    public async restoreCenter() {
        this.movementDuration.set(500);
        this.zoomFactor.set(1.0);
        return Promise.all([
            this.parent.scene.camera.move(this.battleCenter, this.movementDuration.value),
            this.parent.scene.camera.zoomOverTime(1.0, this.movementDuration.value),
        ]);
    }

    public async focusUnit(
        unit: Actor,
        opts: {
            forcePosition?: Vector;
            duration?: number;
        } = {},
    ) {
        this.zoomFactor.set(1 / getScale());
        this.movementDuration.set(500);

        const diff = (opts.forcePosition ? opts.forcePosition : unit.pos).sub(this.battleCenter);
        const newPos = this.battleCenter.add(diff.scale(this.zoomFactor.value));
        await Promise.all([
            this.parent.scene.camera.move(newPos, opts.duration ?? this.movementDuration.value),
            this.parent.scene.camera.zoomOverTime(
                1 + this.zoomFactor.value,
                opts.duration ?? this.movementDuration.value,
            ),
        ]);
        this.parent.scene.camera.move(newPos, 0);
    }
}
