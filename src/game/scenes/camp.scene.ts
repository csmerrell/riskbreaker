import { resources } from '@/resource';
import { Engine, Scene } from 'excalibur';
import { Actor } from 'excalibur';

export class CampScene extends Scene {
    private bgActor: Actor;
    private cameraTarget: Actor;

    constructor() {
        super();
        this.createFireside();
        this.createDummyActor();
    }

    public onInitialize(_engine: Engine) {
        this.add(this.bgActor);
        this.add(this.cameraTarget);
        this.camera.strategy.lockToActor(this.cameraTarget);
        this.camera.zoom = 2;
    }

    private createFireside() {
        this.bgActor = new Actor();
        this.bgActor.graphics.add(resources.image.misc.fireside.toSprite());
    }

    private createDummyActor() {
        this.cameraTarget = new Actor();
    }
}
