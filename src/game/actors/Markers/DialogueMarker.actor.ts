import { resources } from '@/resource';
import {
    Actor,
    Color,
    EasingFunctions,
    Engine,
    Entity,
    Material,
    SpriteSheet,
    vec,
    Vector,
    type ActorArgs,
} from 'excalibur';
import COLOR_SWAP from '@/shader/colorSwap.glsl?raw';

const spriteMap = {
    exclamation: [0, 0],
    questionMark: [0, 1],
} as const satisfies Record<string, [number, number]>;

export type DialogueMarkerKey = keyof typeof spriteMap;

export type MarkerMovement = {
    enterSpeed?: number;
    fadeSpeed?: number;
    fadeDirection?: Vector;
};

export class DialogueMarker extends Actor {
    private key: DialogueMarkerKey;
    private sheet: SpriteSheet;
    private anchorEntity: Actor;
    private swapColor: [number, number, number];
    private movement?: MarkerMovement;
    private lifespanMs = 0;

    constructor(
        opts: ActorArgs & {
            key: DialogueMarkerKey;
            anchorEntity: Actor;
            movement?: MarkerMovement;
            swapColor?: [number, number, number];
        },
    ) {
        const { key, anchorEntity, movement, swapColor = [255, 213, 65], ...excalOpts } = opts;
        super(excalOpts);

        this.key = key;
        this.anchorEntity = anchorEntity;
        this.swapColor = swapColor;
        this.movement = movement;
        this.sheet = SpriteSheet.fromImageSource({
            image: resources.image.misc.dialogueMarkers,
            grid: {
                rows: 1,
                columns: 3,
                spriteHeight: 24,
                spriteWidth: 24,
            },
        });
    }

    onInitialize(engine: Engine): void {
        const [x, y] = spriteMap[this.key];
        this.graphics.add('static', this.sheet.getSprite(x, y));
        this.graphics.use('static');
        this.graphics.material = engine.graphicsContext.createMaterial({
            fragmentSource: COLOR_SWAP,
            name: 'ColorSwap',
        });

        this.graphics.material.update((shader) => {
            shader.trySetUniformInt('u_sheetFrameCt', 3);
            shader.trySetUniform(
                'uniform3fv',
                'u_color',
                this.swapColor.map((c) => (c > 1 ? c / 255.0 : c / 1.0)),
            );
        });

        this.pos = this.anchorEntity.pos.sub(vec(0, 4));
        const { fadeDirection = vec(10, -2), fadeSpeed = 2000 } = this.movement;
        this.actions.moveBy({
            offset: fadeDirection,
            duration: fadeSpeed,
            easing: EasingFunctions.EaseInCubic,
        });
    }

    onPostUpdate(_engine: Engine, elapsed: number): void {
        const { enterSpeed = 500 } = this.movement ?? {};
        this.lifespanMs += elapsed;
        this.scale = vec(1, 1).scale(Math.min(1, this.lifespanMs / enterSpeed));

        if (this.vel.magnitude > 0) {
            this.graphics.opacity = Math.max(1, this.vel.magnitude);
        } else if (this.vel.magnitude === 0) {
            this.kill();
        }
    }
}
