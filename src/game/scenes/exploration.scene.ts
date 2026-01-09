import {
    DefaultLoader,
    Engine,
    Scene,
    Actor,
    SpriteSheet,
    vec,
    BoundingBox,
    LimitCameraBoundsStrategy,
    Rectangle,
    Color,
} from 'excalibur';
import { lifebinder } from '@/db/units/Lifebinder';
import { canMoveBetween } from '@/lib/helpers/tile.helper';
import { registerInputListener } from '@/game/input/useInput';
import { TileLayer } from '@excaliburjs/plugin-tiled/build/umd/src/resource/tile-layer';
import { resources } from '@/resource';
import { useExploration } from '@/state/useExploration';
import { TiledResource } from '@excaliburjs/plugin-tiled';

import FOG_SHADER from '@/shader/fog.glsl?raw';

export class ExplorationScene extends Scene {
    private player: Actor;
    private fog: Actor;
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

    private async setupScene(engine: Engine) {
        const { fadeOutEnd, fadeInStart, loaded } = useExploration();
        this.loadPlayer();
        this.loadMap(true);
        this.addFog(engine);

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

    private loadMap(isSetup: boolean = false) {
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
        this.placePlayer(isSetup);
        this.camera.addStrategy(new LimitCameraBoundsStrategy(boundingBox));
    }

    private addFog(engine: Engine) {
        this.fog = new Actor({
            pos: this.player.pos,
            width: visualViewport.width,
            height: visualViewport.height,
            z: 9999, // draw on top
        });

        this.fog.graphics.use(
            new Rectangle({
                width: visualViewport.width,
                height: visualViewport.height,
                color: Color.fromHex('#151d28'),
            }),
        );

        const fogMaterial = engine.graphicsContext.createMaterial({
            name: 'fog',
            fragmentSource: FOG_SHADER,
        });

        this.fog.on('preupdate', () => {
            // Move fog with camera to cover the viewport
            this.fog.pos = engine.currentScene.camera.pos;

            // Normalize player position relative to fog dimensions (0.0 to 1.0)
            const playerRelativePos = this.player.pos.sub(this.fog.pos);
            const screenWidth = engine.screen.resolution.width;
            const screenHeight = engine.screen.resolution.height;
            const normalizedX = (playerRelativePos.x + screenWidth / 2) / screenWidth;
            const normalizedY = (playerRelativePos.y + screenHeight / 2) / screenHeight;

            // Flip Y coordinate for shader (ExcaliburJS Y-down vs shader Y-up)
            const holePos = vec(normalizedX, 1.0 - normalizedY);

            fogMaterial.getShader().trySetUniformFloatVector('u_holePos', holePos);
            fogMaterial
                .getShader()
                .trySetUniformFloatVector(
                    'u_resolution',
                    vec(visualViewport.width, visualViewport.height),
                );

            // Optional: use background color for fog
            const bg = Color.fromHex('#151d28');
            fogMaterial.getShader().trySetUniformFloat('u_fogR', bg.r / 255);
            fogMaterial.getShader().trySetUniformFloat('u_fogG', bg.g / 255);
            fogMaterial.getShader().trySetUniformFloat('u_fogB', bg.b / 255);
        });

        this.fog.graphics.material = fogMaterial;
        this.add(this.fog);
    }

    private placePlayer(isSetup: boolean = false) {
        const { currentMap, playerTileCoord } = useExploration();
        const startPos = currentMap.value.startPos;

        if (!isSetup || !playerTileCoord.value) {
            playerTileCoord.set(startPos);
        }
        const { x, y } = playerTileCoord.value;
        const tilePos = this.mapGround.getTileByCoordinate(x, y).exTile.pos;
        const spriteTileCenterOffset = vec(12, 12); // Half tile size to center on tile
        this.player.pos = tilePos.add(spriteTileCenterOffset);
        this.player.z = 10;

        // Set camera to follow the actor
        this.camera.strategy.lockToActor(this.player);
    }

    private setupMovementControls() {
        const { playerTileCoord } = useExploration();
        registerInputListener(() => {
            const currentCoord = playerTileCoord.value;
            const nextCoord = vec(currentCoord.x, currentCoord.y - 1);

            if (canMoveBetween(currentCoord, nextCoord, this.mapGround)) {
                this.player.pos = this.player.pos.add(vec(0, -24)); // Move up 1 tile
                playerTileCoord.set(nextCoord);
                this.movementAfterEffects();
            }
        }, ['movement_up', 'menu_up']);

        registerInputListener(() => {
            const currentCoord = playerTileCoord.value;
            const nextCoord = vec(currentCoord.x, currentCoord.y + 1);

            if (canMoveBetween(currentCoord, nextCoord, this.mapGround)) {
                this.player.pos = this.player.pos.add(vec(0, 24)); // Move down 1 tile
                playerTileCoord.set(nextCoord);
                this.movementAfterEffects();
            }
        }, ['movement_down', 'menu_down']);

        registerInputListener(() => {
            const currentCoord = playerTileCoord.value;
            const nextCoord = vec(currentCoord.x - 1, currentCoord.y);

            if (canMoveBetween(currentCoord, nextCoord, this.mapGround)) {
                this.player.pos = this.player.pos.add(vec(-24, 0)); // Move left 1 tile
                playerTileCoord.set(nextCoord);
                this.player.scale = vec(1, 1);
                this.movementAfterEffects();
            }
        }, ['movement_left', 'menu_left']);

        registerInputListener(() => {
            const currentCoord = playerTileCoord.value;
            const nextCoord = vec(currentCoord.x + 1, currentCoord.y);

            if (canMoveBetween(currentCoord, nextCoord, this.mapGround)) {
                this.player.pos = this.player.pos.add(vec(24, 0)); // Move right 1 tile
                playerTileCoord.set(nextCoord);
                this.player.scale = vec(-1, 1);
                this.movementAfterEffects();
            }
        }, ['movement_right', 'menu_right']);
    }

    private movementAfterEffects() {
        const {
            playerTileCoord,
            currentMap,
            fadeInStart,
            isZoneChangePoint,
            setCurrentMap,
            saveExplorationState,
        } = useExploration();
        // Don't move fog here - it should only follow the camera in preupdate

        const { x, y } = playerTileCoord.value;
        const keyPoint = currentMap.value.keyPoints[`${x}_${y}`];
        if (keyPoint) {
            if (isZoneChangePoint(keyPoint)) {
                setCurrentMap(keyPoint.key, keyPoint.posOverride);
                const waitId = fadeInStart.subscribe(() => {
                    setTimeout(() => {
                        saveExplorationState();
                        fadeInStart.unsubscribe(waitId);
                    }, 0);
                });
            } else {
                saveExplorationState();
                if (keyPoint.type === 'interactable') {
                    console.log('Show interaction prompt');
                }
            }
        } else {
            saveExplorationState();
        }
    }
}
