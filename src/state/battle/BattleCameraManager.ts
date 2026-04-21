import { Actor, EasingFunctions, vec, Vector } from 'excalibur';
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
        this.zoomFactor.set(0.0);
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
        await this.parent.scene.camera.move(newPos, 0);
    }

    public async directionalShake(
        targetPos: Vector,
        opts: {
            count?: number;
            intensity?: number;
        } = {},
    ) {
        const { count = 3, intensity: maxIntensity = 1 } = opts;
        const { camera } = this.parent.scene;
        const angle = camera.pos.sub(targetPos).toAngle();
        let intensity = maxIntensity;
        const duration = 5;
        while (intensity > 0) {
            const pulse = vec(1, 0).scale(intensity);
            await camera
                .move(
                    camera.pos.sub(pulse.rotate(angle)),
                    duration / Math.sqrt(intensity),
                    EasingFunctions.EaseInCubic,
                )
                .then(async () => {
                    await camera.move(
                        camera.pos.add(pulse.rotate(angle).scale(1.5)),
                        duration / Math.sqrt(intensity / 2),
                        EasingFunctions.EaseInOutCubic,
                    );
                })
                .then(async () => {
                    await camera.move(
                        camera.pos.sub(pulse.rotate(angle).scale(0.5)),
                        duration / Math.sqrt(intensity / 2),
                        EasingFunctions.EaseInOutCubic,
                    );
                });
            intensity -= maxIntensity / count + 0.01;
        }
    }

    public async zoomShake(
        opts: {
            count?: number;
            intensity?: number;
        } = {},
    ) {
        const { count = 1, intensity: maxIntensity = 1 / (24 * getScale()) } = opts;
        const { camera } = this.parent.scene;
        let intensity = maxIntensity;
        const duration = 5;
        while (intensity > 0) {
            await camera
                .zoomOverTime(
                    1 + this.zoomFactor.value + intensity,
                    duration / Math.sqrt(intensity),
                    EasingFunctions.EaseInCubic,
                )
                .then(async () => {
                    await camera.zoomOverTime(
                        1 + this.zoomFactor.value - intensity / 2,
                        duration / Math.sqrt(intensity / 2),
                        EasingFunctions.EaseInCubic,
                    );
                })
                .then(() => {
                    camera.zoomOverTime(
                        1 + this.zoomFactor.value,
                        duration / Math.sqrt(intensity / 2),
                        EasingFunctions.EaseInCubic,
                    );
                });
            intensity -= maxIntensity / count + 0.01;
        }
    }
}
