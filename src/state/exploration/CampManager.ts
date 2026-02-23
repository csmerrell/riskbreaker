import {
    Actor,
    Animation,
    AnimationStrategy,
    Color,
    PostProcessor,
    Rectangle,
    ScreenShader,
    SpriteSheet,
    vec,
    Vector,
} from 'excalibur';
import { SceneManager } from '../SceneManager';
import type { ExplorationManager } from './ExplorationManager';
import { resources } from '@/resource';
import FIRELIGHT_SHADER from '@/shader/firelight.glsl?raw';
import { colors } from '@/lib/enum/colors.enum';
import { gameEnum } from '@/lib/enum/game.enum';
import { captureControls, unCaptureControls } from '@/game/input/useInput';
import { useExploration } from '../useExploration';

class FirelightPostProcessor implements PostProcessor {
    private _shader: ScreenShader;
    private fireOrigin: Vector;

    initialize(gl: WebGL2RenderingContext): void {
        this._shader = new ScreenShader(gl, FIRELIGHT_SHADER);
    }

    getLayout() {
        return this._shader.getLayout();
    }

    getShader() {
        return this._shader.getShader();
    }

    onUpdate(_elapsed: number): void {
        if (!this._shader) return;

        try {
            const shader = this._shader.getShader();
            const fogColor = Color.fromHex('#151d28');

            if (shader && typeof shader.trySetUniformFloat === 'function') {
                shader.trySetUniformFloat('u_fogR', fogColor.r / 255);
                shader.trySetUniformFloat('u_fogG', fogColor.g / 255);
                shader.trySetUniformFloat('u_fogB', fogColor.b / 255);

                shader.trySetUniform('uniform2fv', 'u_fireOrigin', [
                    this.fireOrigin.x,
                    this.fireOrigin.y,
                ]);
            }
        } catch (error) {
            console.warn('Error setting uniforms:', error);
        }
    }

    setFireOrigin(fireOrigin: Vector) {
        this.fireOrigin = fireOrigin;
    }
}

export class CampManager extends SceneManager {
    private mask: Actor;
    private bgActor: Actor;
    private fire: Actor;
    private shadow1Actor?: Actor;
    private shadow2Actor?: Actor;
    private firePostProcessor: FirelightPostProcessor;

    constructor(private parent: ExplorationManager) {
        super({ scene: parent.scene });
        this.firePostProcessor = new FirelightPostProcessor();
        this.createMask();
        this.createCamp();
        this.setReady();
    }

    private createMask(): void {
        const graphic = new Rectangle({
            width: gameEnum.nativeWidth,
            height: gameEnum.nativeHeight,
            color: Color.fromHex(colors.bg),
        });

        this.mask = new Actor({
            name: 'camp-mask',
            width: gameEnum.nativeWidth,
            height: gameEnum.nativeHeight,
            z: 1000,
            opacity: 0.6,
        });
        this.mask.graphics.add(graphic);
        this.mask.graphics.use(graphic);
    }

    private createCamp(): void {
        // Background with fireside scene
        this.bgActor = new Actor({
            name: 'camp-bg',
            pos: vec(0, -6),
            height: gameEnum.nativeHeight,
            width: gameEnum.nativeWidth,
            z: 1001,
        });
        this.bgActor.graphics.add(resources.image.misc.fireside.toSprite());

        // Animated fire
        this.fire = new Actor({
            name: 'camp-fire',
            pos: vec(0, 23), // Relative to bgActor offset
            z: 1002,
        });
        const fireSheet = SpriteSheet.fromImageSource({
            image: resources.image.misc.bonfire,
            grid: {
                spriteHeight: 24,
                spriteWidth: 24,
                rows: 1,
                columns: 7,
            },
        });
        this.fire.graphics.add(
            'idle',
            Animation.fromSpriteSheet(fireSheet, [1, 2, 3, 4, 5, 6], 225, AnimationStrategy.Loop),
        );
        this.fire.graphics.use('idle');
    }

    private createShadows(): void {
        const players = this.parent.actorManager.getPlayers();

        if (players.length >= 1) {
            this.shadow1Actor = new Actor({
                name: 'camp-shadow1',
                offset: vec(11, 3),
                z: -1,
            });
            this.shadow1Actor.graphics.add(resources.image.misc.firesideShadow1.toSprite());
            players[0].addChild(this.shadow1Actor);
        }

        if (players.length >= 2) {
            this.shadow2Actor = new Actor({
                name: 'camp-shadow2',
                pos: vec(0, 0),
                z: 1001,
            });
            this.shadow2Actor.graphics.add(resources.image.misc.firesideShadow2.toSprite());
            this.scene.add(this.shadow2Actor);
            this.shadow2Actor.pos = this.scene.camera.pos.add(vec(0, -6));
        }
    }

    private createPlayerActors(): void {
        const players = this.parent.actorManager.getPlayers();

        // First player sits on the right
        if (players.length >= 1) {
            players[0].scale = vec(1, 1);
            players[0].z = 1002;
            players[0].pos = this.scene.camera.pos.add(vec(22, 27));
            players[0].useAnimation('sitRest', { strategy: AnimationStrategy.Loop });
            this.scene.add(players[0]);
        }

        if (players.length >= 2) {
            players[1].scale = vec(-1, 1);
            players[1].z = 1002;
            players[1].pos = this.scene.camera.pos.add(vec(-30, 21));
            players[1].useAnimation('leanRest', { strategy: AnimationStrategy.Loop });
            this.scene.add(players[1]);
        }
    }

    private setupFirelight(): void {
        const fireOffset = vec(0, 23);
        const screenCenter = vec(this.engine.drawWidth / 2, this.engine.drawHeight / 2);
        const fireScreenPos = screenCenter.add(fireOffset);

        const normalizedX = fireScreenPos.x / this.engine.drawWidth;
        const normalizedY = fireScreenPos.y / this.engine.drawHeight;

        this.firePostProcessor.setFireOrigin(vec(normalizedX, normalizedY));
    }

    private scaleMask(): void {
        const bounds = this.parent.mapManager.getBounds();
        if (!bounds) {
            console.warn('Cannot scale camp mask: no map bounds available');
            return;
        }

        const scale = vec(bounds.width / this.mask.width, bounds.height / this.mask.height);
        this.mask.graphics.current.width = bounds.width;
        this.mask.graphics.current.height = bounds.height;
        this.mask.scale = scale;
    }

    public openCamp(): Promise<void> {
        captureControls('camp');

        return new Promise((resolve) => {
            useExploration()
                .getExplorationManager()
                .ready()
                .then(() => {
                    // Scale mask to cover entire map (like BattleManager)
                    this.scaleMask();

                    // Apply camera zoom
                    this.scene.camera.zoom = 1.5;

                    // Position mask and camp at camera position
                    this.mask.pos = this.scene.camera.pos;
                    this.bgActor.pos = this.scene.camera.pos.add(vec(0, -4));
                    this.fire.pos = this.scene.camera.pos.add(vec(0, 32));

                    // Add actors to scene
                    this.scene.add(this.mask);
                    this.scene.add(this.bgActor);
                    this.scene.add(this.fire);

                    // Add player actors
                    this.createPlayerActors();
                    this.createShadows();

                    // Setup and add firelight shader
                    this.setupFirelight();
                    this.engine.graphicsContext.addPostProcessor(this.firePostProcessor);

                    resolve();
                });
        });
    }

    public closeCamp(): void {
        unCaptureControls();

        // Remove post processor
        this.engine.graphicsContext.removePostProcessor(this.firePostProcessor);

        // Set opacity to 0 for mask and camp actors
        this.mask.graphics.opacity = 0;
        this.bgActor.graphics.opacity = 0;
        this.fire.graphics.opacity = 0;

        if (this.shadow1Actor) {
            this.shadow1Actor.graphics.opacity = 0;
        }
        if (this.shadow2Actor) {
            this.shadow2Actor.graphics.opacity = 0;
        }

        this.parent.actorManager.getPlayers().forEach((actor) => {
            actor.graphics.opacity = 0;
        });

        // Restore camera zoom
        this.scene.camera.zoom = 1;
    }
}
