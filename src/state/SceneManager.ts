import { Engine, Scene } from 'excalibur';
import { useGameContext } from './useGameContext';

export type SceneManagerOpts = {
    scene: Scene;
};
export class SceneManager {
    protected engine: Engine;
    protected scene: Scene;

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
    }

    onInitialize() {}

    onPreupdate() {}

    onPostupdate() {}
}
