import { Actor, Color, Graphic, Rectangle, vec, Vector } from 'excalibur';
import { BattleManager } from './BattleManager';
import { useGameContext } from '../useGameContext';
import { getScale } from '@/lib/helpers/screen.helper';
import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import { KeyedAnimationActor } from '@/game/actors/KeyedAnimationActor';
import { makeState } from '../Observable';
import { ReadyComponent } from '@/game/actors/ReadyComponent';

export class HeadshotManager {
    public headshots = makeState<{ path: string; id: string }[]>([]);

    constructor(private parent: BattleManager) {}

    public clearHeadshots() {
        this.headshots.set([]);
    }

    public async captureHeadshot(
        actor: CompositeActor | KeyedAnimationActor<string>,
    ): Promise<string> {
        const scene = useGameContext().headshotEngine.value.currentScene;
        scene.actors.forEach((a) => {
            a.kill();
        });

        await (actor.get(ReadyComponent)?.ready() ?? Promise.resolve());

        const { spriteHeight, spriteWidth } = actor.getDimensions();
        actor.offset = vec(0, 0);
        actor.pos = vec(spriteWidth / 2, spriteHeight / 2);
        scene.add(actor);

        // Set to static animation
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, 0);
        });
        actor.useAnimation('static');

        // Wait for one frame to render
        await new Promise<void>((resolve) => {
            actor.events.on('postupdate', () => {
                resolve();
            });
        });

        // Get the headshot canvas
        const headshotCanvas = document.getElementById('headshot-canvas') as HTMLCanvasElement;
        const pixelRatio = useGameContext().headshotEngine.value.pixelRatio;

        // Create portrait canvas at display resolution
        const portraitCanvas = document.createElement('canvas');
        portraitCanvas.width = 24 * getScale();
        portraitCanvas.height = 12 * getScale();
        const portraitCtx = portraitCanvas.getContext('2d')!;
        portraitCtx.imageSmoothingEnabled = false;

        // Calculate capture anchor
        const { offset } = actor.getHeadshotTransforms();
        let captureAnchor = offset ?? vec(0, 0);

        // Scale to buffer coordinates
        captureAnchor = captureAnchor.scale(pixelRatio);

        // Capture from headshot canvas
        portraitCtx.drawImage(
            headshotCanvas,
            captureAnchor.x, // source x
            captureAnchor.y, // source y
            24 * pixelRatio, // source width
            12 * pixelRatio, // source height
            0, // dest x
            0, // dest y
            portraitCanvas.width, // dest width
            portraitCanvas.height, // dest height
        );

        // Convert to data URL
        const dataURL = portraitCanvas.toDataURL('image/png');

        // Store in observable
        this.headshots.set(
            this.headshots.value.concat({
                path: dataURL,
                id: actor.unitId!,
            }),
        );

        return dataURL;
    }

    async captureTemporalSnapshot(
        graphic: Graphic,
        opts: { height: number; width: number; scale?: Vector },
    ) {
        const actor = new Actor({
            scale: opts.scale ?? vec(1, 1),
        });
        actor.graphics.add(graphic);
        const scene = useGameContext().headshotEngine.value.currentScene;
        scene.actors.forEach((a) => {
            a.kill();
        });

        scene.add(actor);
        scene.camera.strategy.lockToActor(actor);
        await new Promise<void>((resolve) => {
            actor.events.on('postupdate', () => {
                resolve();
            });
        });

        // Get the headshot canvas
        const headshotCanvas = document.getElementById('headshot-canvas') as HTMLCanvasElement;
        const pixelRatio = useGameContext().headshotEngine.value.pixelRatio;

        const { height, width } = opts;

        // Create portrait canvas at display resolution
        const portraitCanvas = document.createElement('canvas');
        portraitCanvas.width = width * getScale();
        portraitCanvas.height = height * getScale();
        const portraitCtx = portraitCanvas.getContext('2d')!;
        portraitCtx.imageSmoothingEnabled = false;

        // Calculate capture anchor
        let captureAnchor = vec(0, 0);

        // Scale to buffer coordinates
        captureAnchor = captureAnchor.scale(pixelRatio);

        // Capture from headshot canvas
        portraitCtx.drawImage(
            headshotCanvas,
            captureAnchor.x, // source x
            captureAnchor.y, // source y
            width * pixelRatio, // source width
            height * pixelRatio, // source height
            0, // dest x
            0, // dest y
            portraitCanvas.width, // dest width
            portraitCanvas.height, // dest height
        );

        // Convert to data URL
        return portraitCanvas.toDataURL('image/png');
    }
}
