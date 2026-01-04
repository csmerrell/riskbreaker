import {
    Actor,
    Color,
    CoordPlane,
    Engine,
    ImageFiltering,
    ImageSource,
    ImageWrapping,
    Material,
    vec,
} from 'excalibur';
import auroraShader from '@/shader/aurora.glsl?raw';
import { useGameContext } from '@/state/useGameContext';

const colorTexture = new ImageSource('texture/auroraColorTexture.jpg', false, ImageFiltering.Pixel);
colorTexture.wrapping = {
    x: ImageWrapping.Repeat,
    y: ImageWrapping.Repeat,
};
const monoTexture = new ImageSource('texture/auroraMonoTexture.png', false, ImageFiltering.Blended);
monoTexture.wrapping = {
    x: ImageWrapping.Repeat,
    y: ImageWrapping.Repeat,
};

export class AuroraBG extends Actor {
    private material: Material | undefined;

    constructor() {
        const { game } = useGameContext();
        super({
            x: 0,
            y: 10,
            anchor: vec(0, 0),
            opacity: 0.4,
            width: game.value.screen.resolution.width,
            height: 50,
            coordPlane: CoordPlane.Screen,
            color: Color.Red,
        });
    }

    static getDependencies() {
        return [colorTexture, monoTexture];
    }

    onInitialize(engine: Engine) {
        this.material = engine.graphicsContext.createMaterial({
            name: 'aurora',
            fragmentSource: auroraShader,
            images: {
                u_texture_color: colorTexture,
                u_texture_mono: monoTexture,
            },
            color: Color.fromRGB(55, 0, 200, 0.6),
        });
        this.material.getShader().use();
        this.material.getShader().setUniformFloat('u_opacity', 255.0);

        this.graphics.material = this.material;
    }

    onPreUpdate(_engine: Engine, _elapsed: number): void {
        // this.material.getShader().use();
        // this.material.getShader().trySetUniformFloat('u_opacity', 1.0);
    }
}
