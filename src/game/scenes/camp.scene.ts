import { resources } from '@/resource';
import {
    Animation,
    AnimationStrategy,
    Color,
    Engine,
    PostProcessor,
    Scene,
    ScreenShader,
    SpriteSheet,
    vec,
    Vector,
} from 'excalibur';
import { Actor } from 'excalibur';
import FIRELIGHT_SHADER from '@/shader/firelight.glsl?raw';
import { registerInputListener } from '../input/useInput';

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
        // Use the same pattern as Material.update() from exploration scene
        if (!this._shader) return;

        try {
            // Get the shader object that should have uniform methods
            const shader = this._shader.getShader();

            // Try the same uniform methods used in exploration scene
            const fogColor = Color.fromHex('#151d28');

            // Use the same methods as in exploration.scene.ts
            if (shader && typeof shader.trySetUniformFloat === 'function') {
                shader.trySetUniformFloat('u_fogR', fogColor.r / 255);
                shader.trySetUniformFloat('u_fogG', fogColor.g / 255);
                shader.trySetUniformFloat('u_fogB', fogColor.b / 255);

                shader.trySetUniform('uniform2fv', 'u_fireOrigin', [
                    this.fireOrigin.x,
                    this.fireOrigin.y,
                ]);
            } else {
                throw new Error(
                    `Shader does not have expected uniform methods, shader type: ${typeof shader}`,
                );
            }
        } catch (error) {
            console.warn('Error setting uniforms:', error);
        }
    }

    setFireOrigin(fireOrigin: Vector) {
        this.fireOrigin = fireOrigin;
    }
}

export class CampScene extends Scene {
    private bgActor: Actor;
    private cameraTarget: Actor;
    private fire: Actor;
    private units: Actor[] = [];
    private firePostProcessor: FirelightPostProcessor;

    constructor() {
        super();
        this.createFireside();
        this.createDummyActor();
        this.createUnits();
        this.firePostProcessor = new FirelightPostProcessor();
    }

    public onInitialize(engine: Engine) {
        this.add(this.bgActor);
        this.add(this.cameraTarget);
        this.camera.strategy.lockToActor(this.cameraTarget);
        this.camera.zoom = 1.5;

        // Add firelight postprocessor
        this.firePostProcessor.setFireOrigin(
            vec(
                (this.engine.drawWidth - this.fire.pos.x) / 2 / this.engine.drawWidth,
                (this.engine.drawHeight - this.fire.pos.y - 32.0) / 2 / this.engine.drawHeight,
            ),
        );
        // this.engine.graphicsContext.addPostProcessor(this.firePostProcessor);

        let toggle = false;
        registerInputListener(() => {
            toggle = !toggle;
            if (toggle) {
                engine.graphicsContext.addPostProcessor(this.firePostProcessor);
            } else {
                engine.graphicsContext.removePostProcessor(this.firePostProcessor);
            }
        }, 'confirm');
    }

    private createFireside() {
        this.bgActor = new Actor({
            pos: vec(0, -6),
        });
        this.bgActor.graphics.add(resources.image.misc.fireside.toSprite());

        const fire = new Actor({
            pos: vec(0, 29),
            z: 1,
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
        fire.graphics.add(
            'idle',
            Animation.fromSpriteSheet(fireSheet, [1, 2, 3, 4, 5, 6], 225, AnimationStrategy.Loop),
        );
        fire.graphics.use('idle');
        this.fire = fire;
        this.add(this.fire);
    }

    private createUnits() {
        const naturalist = new Actor({
            name: 'Naturalist',
            pos: vec(22, 25),
            z: 1,
        });
        naturalist.graphics.add(resources.image.units.NaturalistSit.toSprite());
        this.units.push(naturalist);

        const lifebinder = new Actor({
            name: 'Lifebinder',
            pos: vec(-32, 19),
            scale: vec(-1, 1),
            z: 1,
        });
        lifebinder.graphics.add(resources.image.units.LifebinderLean.toSprite());
        this.units.push(lifebinder);

        this.units.forEach((u) => this.add(u));
    }

    private createDummyActor() {
        this.cameraTarget = new Actor({
            pos: vec(0, 0),
        });
    }
}
