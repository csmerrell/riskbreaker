import { Actor, Color, EasingFunctions, Rectangle, vec } from 'excalibur';
import { SceneManager } from './SceneManager';
import { gameEnum } from '@/lib/enum/game.enum';
import { colors } from '@/lib/enum/colors.enum';
import { ExplorationManager } from './exploration/ExplorationManager';
import { useExploration } from './useExploration';
import { getScale } from '@/lib/helpers/screen.helper';
import { loopUntil } from '@/lib/helpers/async.helper';

export class MaskingManager extends SceneManager {
    private mask!: Actor;
    constructor(protected parent: ExplorationManager) {
        super({ scene: parent.scene });

        this.createMask();
    }

    private createMask(): void {
        const graphic = new Rectangle({
            width: gameEnum.nativeWidth,
            height: gameEnum.nativeHeight,
            color: Color.fromHex(colors.bg),
        });

        this.mask = new Actor({
            name: 'menu-mask',
            width: gameEnum.nativeWidth,
            height: gameEnum.nativeHeight,
            z: 1000,
        });
        this.mask.graphics.add(graphic);
        this.mask.graphics.use(graphic);
    }

    private scaleMask(): void {
        const bounds = this.parent.mapManager.getBounds();
        if (!bounds) {
            console.warn('Cannot scale menu mask: no map bounds available');
            return;
        }

        const scale = vec(bounds.width / this.mask.width, bounds.height / this.mask.height);
        this.mask.graphics.current!.width = bounds.width;
        this.mask.graphics.current!.height = bounds.height;
        this.mask.scale = scale;
    }

    private activeOpacity = 0.6;
    protected async applyMask(opts: { leaderFadeOut?: boolean; opacity?: number } = {}) {
        const { leaderFadeOut = true, opacity = 0.6 } = opts;
        this.activeOpacity = opacity;
        return new Promise<void>(async (resolve) => {
            await this.parent.ready();
            // Scale mask to cover entire screen
            this.scaleMask();
            // Position mask and camp at camera position
            this.mask.pos = this.scene.camera.pos;
            this.mask.graphics.opacity = 0;
            this.scene.add(this.mask);
            const openDuration = 250;
            const step = 25;
            const numSteps = openDuration / step;
            const opacityStep = 1 / numSteps;
            await Promise.all([
                ...(leaderFadeOut ? [this.parent.actorManager.getLeader().fadeOut()] : []),
                loopUntil(
                    () => this.mask.graphics.opacity === this.activeOpacity,
                    () => this.stepMaskOpacity(opacityStep),
                    step,
                ),
            ]);
            resolve();
        });
    }

    protected async removeMask() {
        const duration = 250;
        const step = 25;
        const numSteps = duration / step;
        const opacityStep = -1 / numSteps;
        await Promise.all([
            this.parent.actorManager.getLeader().fadeIn(),
            loopUntil(
                () => this.mask.graphics.opacity === 0,
                () => this.stepMaskOpacity(opacityStep),
                step,
            ),
        ]);
        this.scene.remove(this.mask);
    }

    private stepMaskOpacity(opacityStep: number) {
        this.mask.graphics.opacity =
            opacityStep < 0
                ? Math.max(0, this.mask.graphics.opacity + opacityStep)
                : Math.min(this.mask.graphics.opacity + opacityStep, this.activeOpacity);
    }
}
