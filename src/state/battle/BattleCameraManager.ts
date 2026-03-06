import { Actor, EasingFunctions, vec, Vector } from 'excalibur';
import { BattleManager } from './BattleManager';
import { useExploration } from '../useExploration';
import { CameraManager } from '../exploration/CameraManager';
import { getScale } from '@/lib/helpers/screen.helper';

export class BattleCameraManager {
    private battleCenter: Vector;
    private zoomFactor: number = 1;
    private rootCameraManager: CameraManager;
    constructor(private parent: BattleManager) {
        this.battleCenter = parent.scene.camera.pos;
        this.rootCameraManager = useExploration().getExplorationManager().cameraManager;
        this.rootCameraManager.unlock();
    }

    public restoreCenter() {
        const duration = 250;
        this.parent.scene.camera.move(this.battleCenter, duration, EasingFunctions.EaseOutCubic);
        this.parent.scene.camera.zoomOverTime(1.0, duration, EasingFunctions.EaseOutCubic);
    }

    public async focusUnit(unit: Actor) {
        const diff = unit.pos.sub(this.battleCenter);
        const newPos = this.battleCenter.add(diff.scale(1 / getScale()));
        const duration = 500;
        await Promise.all([
            this.parent.scene.camera.move(newPos, duration, EasingFunctions.EaseOutCubic),
            this.parent.scene.camera.zoomOverTime(
                1 + 1 / getScale(),
                duration,
                EasingFunctions.EaseOutCubic,
            ),
        ]);
        this.parent.scene.camera.move(newPos, 0);
    }
}
