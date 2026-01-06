import {
    DefaultLoader,
    Engine,
    Scene,
    Actor,
    SpriteSheet,
    vec,
    Vector,
    ImageSource,
    BoundingBox,
    LimitCameraBoundsStrategy,
} from 'excalibur';
import { netherFencer } from '@/db/units/Netherfencer';
import { getSourceMap } from '@/lib/helpers/resource.helper';
import { canMoveBetween } from '@/lib/helpers/tile.helper';
import { loadMap } from '@/resource/maps';
import { registerInputListener } from '@/game/input/useInput';
import { TiledResource } from '@excaliburjs/plugin-tiled';
import { TileLayer } from '@excaliburjs/plugin-tiled/build/umd/src/resource/tile-layer';

export class ExplorationScene extends Scene {
    private plainActor: Actor;
    private playerTileCoord: Vector;
    private map: TiledResource;
    private mapGround: TileLayer;

    constructor() {
        super();
    }

    onPreLoad(loader: DefaultLoader) {
        // Get dependencies for the Netherfencer sprite sheet
        const netherFencerResources = getSourceMap(netherFencer);
        loader.addResources(Object.values(netherFencerResources));
    }

    onInitialize(engine: Engine) {
        // Load the test map and create actor
        this.setupScene(engine);
    }

    private async setupScene(engine: Engine) {
        // Load the test map first
        this.map = await loadMap('test');
        this.map.addToScene(this);

        const [groundLayer] = this.map.getTileLayers();
        this.mapGround = groundLayer;

        // Create a plain ExcaliburJS Actor
        this.plainActor = new Actor();

        // Create sprite sheet manually
        const sourceMap = getSourceMap(netherFencer);
        const imageSource = sourceMap['image/units/Netherfencer'] as unknown as ImageSource;
        const spriteSheet = SpriteSheet.fromImageSource({
            image: imageSource,
            grid: {
                spriteHeight: netherFencer.spriteSheet.cellHeight,
                spriteWidth: netherFencer.spriteSheet.cellWidth,
                columns: netherFencer.spriteSheet.numCols,
                rows: netherFencer.spriteSheet.numRows,
            },
        });

        // Get the static sprite (idle frame 0,0)
        const staticSprite = spriteSheet.getSprite(0, 0);

        // Set up graphics
        this.plainActor.graphics.add('sprite', staticSprite);
        this.plainActor.graphics.use('sprite');

        // Position sprite at tile (3,9) center
        this.playerTileCoord = vec(3, 9);
        const tilePos = this.mapGround.getTileByCoordinate(
            this.playerTileCoord.x,
            this.playerTileCoord.y,
        ).exTile.pos;
        const spriteTileCenterOffset = vec(12, 12); // Half tile size to center on tile
        this.plainActor.pos = tilePos.add(spriteTileCenterOffset);

        // Add to scene
        this.add(this.plainActor);

        // Set camera to follow the actor
        this.camera.strategy.lockToActor(this.plainActor);
        const { width, tilewidth, height, tileheight } = this.map.map;
        const boundingBox = new BoundingBox(0, 0, width * tilewidth, height * tileheight);
        this.camera.addStrategy(new LimitCameraBoundsStrategy(boundingBox));

        // Register movement input listeners
        this.setupMovementControls();
    }

    private setupMovementControls() {
        // Register movement input listeners using your input system
        // Handle both WASD (movement_*) and Arrow Keys (menu_*) with array syntax

        registerInputListener(() => {
            const currentCoord = this.playerTileCoord;
            const nextCoord = vec(currentCoord.x, currentCoord.y - 1);

            if (canMoveBetween(currentCoord, nextCoord, this.mapGround)) {
                this.plainActor.pos = this.plainActor.pos.add(vec(0, -24)); // Move up 1 tile
                this.playerTileCoord = nextCoord;
            }
        }, ['movement_up', 'menu_up']);

        registerInputListener(() => {
            const currentCoord = this.playerTileCoord;
            const nextCoord = vec(currentCoord.x, currentCoord.y + 1);

            if (canMoveBetween(currentCoord, nextCoord, this.mapGround)) {
                this.plainActor.pos = this.plainActor.pos.add(vec(0, 24)); // Move down 1 tile
                this.playerTileCoord = nextCoord;
            }
        }, ['movement_down', 'menu_down']);

        registerInputListener(() => {
            const currentCoord = this.playerTileCoord;
            const nextCoord = vec(currentCoord.x - 1, currentCoord.y);

            if (canMoveBetween(currentCoord, nextCoord, this.mapGround)) {
                this.plainActor.pos = this.plainActor.pos.add(vec(-24, 0)); // Move left 1 tile
                this.playerTileCoord = nextCoord;
            }
        }, ['movement_left', 'menu_left']);

        registerInputListener(() => {
            const currentCoord = this.playerTileCoord;
            const nextCoord = vec(currentCoord.x + 1, currentCoord.y);

            if (canMoveBetween(currentCoord, nextCoord, this.mapGround)) {
                this.plainActor.pos = this.plainActor.pos.add(vec(24, 0)); // Move right 1 tile
                this.playerTileCoord = nextCoord;
            }
        }, ['movement_right', 'menu_right']);
    }
}
