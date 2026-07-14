import { Actor, Color, EasingFunctions, Rectangle, vec } from 'excalibur';
import { SceneManager } from '../SceneManager';
import { ExplorationManager } from './ExplorationManager';
import { gameEnum } from '@/lib/enum/game.enum';
import { colors } from '@/lib/enum/colors.enum';
import { captureControls, registerInputListener, unCaptureControls } from '@/game/input/useInput';
import { useExploration } from '../useExploration';
import { loopUntil } from '@/lib/helpers/async.helper';
import { getScale } from '@/lib/helpers/screen.helper';
import { useGameContext } from '../useGameContext';

export class PartyMenuManager extends SceneManager {
    private mask!: Actor;

    constructor(private parent: ExplorationManager) {
        super({ scene: parent.scene });
        this.createMask();
        this.setReady();
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

    public async open(): Promise<void> {
        captureControls('partyMenu');
        const { activeView } = useGameContext();
        activeView.value = 'party-menu';

        this.parent.cameraManager.unlock();

        return new Promise<void>(async (resolve) => {
            await useExploration().getExplorationManager().ready();
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
                this.scene.camera.zoomOverTime(1 + 2 / getScale(), 250, EasingFunctions.Linear),
                loopUntil(
                    () => this.mask.graphics.opacity === 0.6,
                    () => this.stepOpacity(opacityStep),
                    step,
                ),
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
        const duration = 250;
        const step = 25;
        const numSteps = duration / step;
        const opacityStep = -1 / numSteps;
        await Promise.all([
            this.scene.camera.zoomOverTime(1, duration, EasingFunctions.Linear),
            loopUntil(
                () => this.mask.graphics.opacity === 0,
                () => this.stepOpacity(opacityStep),
                step,
            ),
        ]);
        this.parent.actorManager.getLeader().graphics.opacity = 1;
        this.parent.cameraManager.lockToActor(this.parent.actorManager.getLeader());
    }

    private stepOpacity(opacityStep: number) {
        //mask stops at .6 opacity
        this.mask.graphics.opacity =
            opacityStep < 0
                ? Math.max(0, this.mask.graphics.opacity + opacityStep)
                : Math.min(this.mask.graphics.opacity + opacityStep, 0.6);
    }
}
