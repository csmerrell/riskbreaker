import { Engine, ExcaliburGraphicsContext, GraphicsGroup, Scene, vec } from 'excalibur';
import { Actor } from 'excalibur';
import { battleground, toLayerArray } from '@/resource/image/battleground';

export class BattleScene extends Scene {
    private bgActor: Actor;
    private cameraTarget: Actor;

    constructor() {
        super();
        this.createBattleground('grass');
        this.createDummyActor();
    }

    onPostDraw(_ctx: ExcaliburGraphicsContext, _elapsed: number): void {}

    public onInitialize(_engine: Engine) {
        this.add(this.bgActor);
        this.add(this.cameraTarget);
        this.camera.strategy.lockToActor(this.cameraTarget);
    }

    private createBattleground(type: 'grass' | 'dirt') {
        this.bgActor = new Actor();
        const bgGraphic = new GraphicsGroup({
            useAnchor: true,
            members: toLayerArray(battleground, type).map((img) => ({
                graphic: img.toSprite(),
                offset: vec(0, 0),
            })),
        });
        this.bgActor.graphics.add(bgGraphic);
    }

    private createDummyActor() {
        this.cameraTarget = new Actor();
    }
}
