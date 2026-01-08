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
import { lifebinder } from '@/db/units/Lifebinder';
import { canMoveBetween } from '@/lib/helpers/tile.helper';
import { registerInputListener } from '@/game/input/useInput';
import { TileLayer } from '@excaliburjs/plugin-tiled/build/umd/src/resource/tile-layer';
import { resources } from '@/resource';
import { useExploration } from '@/ui/views/ExplorationView/useExploration';
import { TiledResource } from '@excaliburjs/plugin-tiled';

export class ExplorationScene extends Scene {
    private player: Actor;
    private playerTileCoord: Vector;
    private map: TiledResource;
    private mapGround: TileLayer;

    constructor() {
        super();
    }

    onPreLoad(loader: DefaultLoader) {
        loader.addResource(resources.image.units.Lifebinder);
    }

    onInitialize(engine: Engine) {
        // Load the test map and create actor
        this.setupScene(engine);
    }

    private async setupScene(_engine: Engine) {
        const { fadeOutEnd, fadeInStart, loaded } = useExploration();
        this.loadPlayer();
        this.loadMap();

        // Subscribe to map changes with transition effect
        fadeOutEnd.subscribe((next) => {
            if (next === true) {
                this.loadMap();
                fadeInStart.set(true);
            }
        });

        // Register movement input listeners
        this.setupMovementControls();
        loaded.set(true);
    }

    private loadMap() {
        if (this.map) {
            this.tileMaps.forEach((tileMap) => {
                this.remove(tileMap);
            });
        }
        const { map } = useExploration().currentMap.value;
        this.map = map;
        map.addToScene(this);

        const [groundLayer] = map.getTileLayers();
        this.mapGround = groundLayer;

        const { width, tilewidth, height, tileheight } = map.map;
        const boundingBox = new BoundingBox(0, 0, width * tilewidth, height * tileheight);
        this.placePlayer();
        this.camera.addStrategy(new LimitCameraBoundsStrategy(boundingBox));
    }

    private loadPlayer() {
        // Create a plain ExcaliburJS Actor
        this.player = new Actor();

        // Create sprite sheet manually
        const imageSource = resources.image.units.Lifebinder;
        const spriteSheet = SpriteSheet.fromImageSource({
            image: imageSource,
            grid: {
                spriteHeight: lifebinder.spriteSheet.cellHeight,
                spriteWidth: lifebinder.spriteSheet.cellWidth,
                columns: lifebinder.spriteSheet.numCols,
                rows: lifebinder.spriteSheet.numRows,
            },
        });

        // Get the static sprite (idle frame 0,0)
        const staticSprite = spriteSheet.getSprite(0, 0);

        // Set up graphics
        this.player.graphics.add('sprite', staticSprite);
        this.player.graphics.use('sprite');

        // Add to scene
        this.add(this.player);
    }

    private placePlayer() {
        const { startPos } = useExploration().currentMap.value;
        this.playerTileCoord = startPos;
        const tilePos = this.mapGround.getTileByCoordinate(
            this.playerTileCoord.x,
            this.playerTileCoord.y,
        ).exTile.pos;
        const spriteTileCenterOffset = vec(12, 12); // Half tile size to center on tile
        this.player.pos = tilePos.add(spriteTileCenterOffset);
        this.player.z = 10;

        // Set camera to follow the actor
        this.camera.strategy.lockToActor(this.player);
    }

    private setupMovementControls() {
        registerInputListener(() => {
            const currentCoord = this.playerTileCoord;
            const nextCoord = vec(currentCoord.x, currentCoord.y - 1);

            if (canMoveBetween(currentCoord, nextCoord, this.mapGround)) {
                this.player.pos = this.player.pos.add(vec(0, -24)); // Move up 1 tile
                this.playerTileCoord = nextCoord;
                this.movementAfterEffects();
            }
        }, ['movement_up', 'menu_up']);

        registerInputListener(() => {
            const currentCoord = this.playerTileCoord;
            const nextCoord = vec(currentCoord.x, currentCoord.y + 1);

            if (canMoveBetween(currentCoord, nextCoord, this.mapGround)) {
                this.player.pos = this.player.pos.add(vec(0, 24)); // Move down 1 tile
                this.playerTileCoord = nextCoord;
                this.movementAfterEffects();
            }
        }, ['movement_down', 'menu_down']);

        registerInputListener(() => {
            const currentCoord = this.playerTileCoord;
            const nextCoord = vec(currentCoord.x - 1, currentCoord.y);

            if (canMoveBetween(currentCoord, nextCoord, this.mapGround)) {
                this.player.pos = this.player.pos.add(vec(-24, 0)); // Move left 1 tile
                this.playerTileCoord = nextCoord;
                this.movementAfterEffects();
            }
        }, ['movement_left', 'menu_left']);

        registerInputListener(() => {
            const currentCoord = this.playerTileCoord;
            const nextCoord = vec(currentCoord.x + 1, currentCoord.y);

            if (canMoveBetween(currentCoord, nextCoord, this.mapGround)) {
                this.player.pos = this.player.pos.add(vec(24, 0)); // Move right 1 tile
                this.playerTileCoord = nextCoord;
                this.movementAfterEffects();
            }
        }, ['movement_right', 'menu_right']);
    }

    private movementAfterEffects() {
        const { currentMap, isZoneChangePoint, setCurrentMap } = useExploration();
        const { x, y } = this.playerTileCoord;
        const keyPoint = currentMap.value.keyPoints[`${x}_${y}`];
        if (keyPoint) {
            if (isZoneChangePoint(keyPoint)) {
                setCurrentMap(keyPoint.key, keyPoint.posOverride);
            } else if (keyPoint.type === 'interactable') {
                console.log('Show interaction prompt');
            }
        }
    }
}
