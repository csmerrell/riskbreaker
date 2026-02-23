import { Actor, BoundingBox, Color, GraphicsGroup, Rectangle, vec } from 'excalibur';
import { SceneManager, SceneManagerOpts } from '../SceneManager';
import { colors } from '@/lib/enum/colors.enum';
import { battleground, toLayerArray } from '@/resource/image/battleground';
import { captureControls, unCaptureControls } from '@/game/input/useInput';
import { gameEnum } from '@/lib/enum/game.enum';
import { useExploration } from '../useExploration';

export class BattleManager extends SceneManager {
    private mask: Actor;

    constructor(opts: SceneManagerOpts & {}) {
        super(opts);
        this.createMask();
        this.setTerrain('grass');
        this.setReady();
    }
    private createMask() {
        const graphic = new Rectangle({
            width: gameEnum.nativeWidth,
            height: gameEnum.nativeHeight,
            color: Color.fromHex(colors.bg),
        });

        this.mask = new Actor({
            name: 'mask',
            width: gameEnum.nativeWidth,
            height: gameEnum.nativeHeight,
            z: 1000,
            opacity: 0.6,
        });
        this.mask.graphics.add(graphic);
        this.mask.graphics.use(graphic);
    }

    private terrain: Actor;
    public setTerrain(type: 'grass' | 'dirt') {
        const bgGraphic = new GraphicsGroup({
            useAnchor: true,
            members: toLayerArray(battleground, type).map((img) => ({
                graphic: img.toSprite(),
                offset: vec(0, 12),
            })),
        });
        this.terrain = new Actor({
            name: 'terrain',
            opacity: 1,
            z: 1001,
        });
        this.terrain.graphics.add(bgGraphic);
        this.terrain.graphics.use(bgGraphic);
    }

    onPreupdate() {}

    private scaleMask() {
        const explorationManager = useExploration().getExplorationManager();
        const { map } = explorationManager.mapManager.currentMap.value;
        const { width, tilewidth, height, tileheight } = map.map;
        const boundingBox = new BoundingBox(0, 0, width * tilewidth, height * tileheight);
        const scale = vec(
            boundingBox.width / this.mask.width,
            boundingBox.height / this.mask.height,
        );
        this.mask.graphics.current.width = boundingBox.width;
        this.mask.graphics.current.height = boundingBox.height;
        this.mask.scale = scale;
    }

    public openBattle(): Promise<void> {
        captureControls('battle');

        return new Promise((resolve) => {
            useExploration()
                .getExplorationManager()
                .ready()
                .then(() => {
                    this.scaleMask();
                    this.scene.add(this.mask);
                    this.scene.add(this.terrain);
                    this.mask.pos = this.scene.camera.pos;
                    this.terrain.pos = this.scene.camera.pos;
                    resolve();
                });
        });
    }

    public closeBattle() {
        this.mask.graphics.opacity = 0;
        this.terrain.graphics.opacity = 0;
        unCaptureControls();
    }
}
