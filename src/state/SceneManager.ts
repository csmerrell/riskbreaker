import { Engine, Scene } from 'excalibur';
import { useGameContext } from './useGameContext';

export type SceneManagerOpts = {
    scene: Scene;
};
export class SceneManager {
    protected engine: Engine;
    public scene: Scene;
    protected setReady: (value: void) => void;
    private isReady: Promise<Scene>;

    constructor(opts: SceneManagerOpts) {
        this.engine = useGameContext().game.value;
        this.scene = opts.scene;

        if (this.scene.isInitialized) {
            this.onInitialize();
        } else {
            this.scene.on('initialize', () => this.onInitialize());
        }

        this.scene.on('preupdate', () => this.onPreupdate());
        this.scene.on('postupdate', () => this.onPostupdate());
        this.isReady = new Promise<Scene>((resolve) => {
            this.setReady = () => resolve(this.scene);
        });
    }

    public ready() {
        return this.isReady;
    }

    onInitialize() {}

    onPreupdate() {}

    onPostupdate() {}

    public awaitCameraSettle() {
        const cam = this.scene.camera;
        return new Promise<void>((resolve) => {
            let stable = 0;
            let last = cam.pos.clone();

            const handler = () => {
                if (isNaN(cam.x) || isNaN(cam.y) || cam.pos.distance(last) < 0.01) {
                    stable++;
                    if (stable >= 3) {
                        this.scene.off('postupdate', handler);
                        resolve();
                    }
                } else {
                    stable = 0;
                }
                last = cam.pos.clone();
            };

            this.scene.on('postupdate', handler);
        });
    }
}
