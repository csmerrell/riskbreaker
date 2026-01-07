import {
    DefaultLoader,
    Engine,
    Scene,
    Actor,
    SpriteSheet,
    vec,
    Vector,
    BoundingBox,
    LimitCameraBoundsStrategy,
} from 'excalibur';
import { netherFencer } from '@/db/units/Netherfencer';
import { canMoveBetween } from '@/lib/helpers/tile.helper';
import { registerInputListener } from '@/game/input/useInput';
import { TileLayer } from '@excaliburjs/plugin-tiled/build/umd/src/resource/tile-layer';
import { resources } from '@/resource';
import { useExploration } from '@/ui/views/ExplorationView/useExploration';

export class ExplorationScene extends Scene {
    private plainActor: Actor;
    private playerTileCoord: Vector;
    private mapGround: TileLayer;
    private startTime: number;

    constructor() {
        super();
        this.startTime = Date.now();
    }

    onPreLoad(_loader: DefaultLoader) {}

    onInitialize(engine: Engine) {
        // Load the test map and create actor
        this.setupScene(engine);
    }

    private async setupScene(_engine: Engine) {
        console.log(`Preload: ${Date.now() - this.startTime}ms`);
        this.startTime = Date.now();

        const { map, startPos } = useExploration().currentMap.value;

        map.addToScene(this);
        console.log(`Map load: ${Date.now() - this.startTime}ms`);
        this.startTime = Date.now();

        const [groundLayer] = map.getTileLayers();
        this.mapGround = groundLayer;

        // Create a plain ExcaliburJS Actor
        this.plainActor = new Actor();

        // Create sprite sheet manually
        const imageSource = resources.image.units.Lifebinder;
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
        console.log(`Sprite setup: ${Date.now() - this.startTime}ms`);
        this.startTime = Date.now();

        // Position sprite at tile (3,9) center
        this.playerTileCoord = startPos;
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
        const { width, tilewidth, height, tileheight } = map.map;
        const boundingBox = new BoundingBox(0, 0, width * tilewidth, height * tileheight);
        this.camera.addStrategy(new LimitCameraBoundsStrategy(boundingBox));

        // Register movement input listeners
        this.setupMovementControls();
        console.log(`Everything else: ${Date.now() - this.startTime}ms`);
        this.startTime = Date.now();
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
