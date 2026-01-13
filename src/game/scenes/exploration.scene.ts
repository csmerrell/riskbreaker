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
    Material,
} from 'excalibur';
import { canMoveBetween } from '@/lib/helpers/tile.helper';
import { registerInputListener } from '@/game/input/useInput';
import { TileLayer } from '@excaliburjs/plugin-tiled/build/umd/src/resource/tile-layer';
import { resources } from '@/resource';
import { useExploration } from '@/state/useExploration';
import { TiledResource } from '@excaliburjs/plugin-tiled';
import { useShader } from '@/state/useShader';

export class ExplorationScene extends Scene {
    private player: Actor;
    private fog: Actor;
    private map: TiledResource;
    private mapGround: TileLayer;
    private fogMaterial: Material; // Store the compiled material
    private fogPreupdateHandler: () => void;

    // No animated movement properties needed

    constructor() {
        super();
        const { fogMaterial } = useShader();
        this.fogMaterial = fogMaterial.value;
        this.createPlayer();
        this.createFog();
        this.setupMovementControls();
    }

    onPreLoad(_loader: DefaultLoader) {}

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

        loaded.set(true);
    }

    private createPlayer() {
        // Create a plain ExcaliburJS Actor
        this.player = new Actor();

        // Create sprite sheet manually
        const imageSource = resources.image.units.Naturalist;
        const spriteSheet = SpriteSheet.fromImageSource({
            image: imageSource,
            grid: {
                spriteHeight: 24,
                spriteWidth: 24,
                columns: 3,
                rows: 1,
            },
        });

        // Get the static sprite (idle frame 0,0)
        const staticSprite = spriteSheet.getSprite(0, 0);
        this.player.offset = vec(0, -5);

        // Set up graphics
        this.player.graphics.add('sprite', staticSprite);
        this.player.graphics.use('sprite');

        // Don't add to scene yet - will be done in setupScene
    }

    private createFog() {
        this.fog = new Actor({
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

        // We'll need to create the material when we have engine context
        // Store the preupdate handler for later
        this.fogPreupdateHandler = () => {
            // Move fog with camera to cover the viewport
            this.fog.pos = this.camera.pos;

            // Calculate player position relative to camera (screen space)
            const playerScreenPos = this.player.pos.sub(this.camera.pos);
            if (Math.abs(playerScreenPos.x) === 24) playerScreenPos.x = 0;
            if (Math.abs(playerScreenPos.y) === 24) playerScreenPos.y = 0;
            const screenWidth = this.engine.screen.resolution.width;
            const screenHeight = this.engine.screen.resolution.height;
            const normalizedX = (playerScreenPos.x + screenWidth / 2) / screenWidth;
            const normalizedY = (playerScreenPos.y + screenHeight / 2) / screenHeight;

            // Flip Y coordinate for shader (ExcaliburJS Y-down vs shader Y-up)
            const holePos = vec(normalizedX, 1.0 - normalizedY);

            this.fogMaterial.update((shader) => {
                shader.trySetUniformFloatVector('u_holePos', holePos);
                shader.trySetUniformFloatVector(
                    'u_resolution',
                    vec(visualViewport.width, visualViewport.height),
                );

                // Optional: use background color for fog
                const bg = Color.fromHex('#151d28');
                shader.trySetUniformFloat('u_fogR', bg.r / 255);
                shader.trySetUniformFloat('u_fogG', bg.g / 255);
                shader.trySetUniformFloat('u_fogB', bg.b / 255);
            });
        };
    }

    private loadPlayer() {
        // Player is already created, just add to scene
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

    private addFog(_engine: Engine) {
        // Material is already compiled in constructor

        // Set initial position (will be updated by preupdate handler)
        this.fog.pos = this.player.pos;

        // Attach the preupdate handler
        this.fog.on('preupdate', this.fogPreupdateHandler);

        // Apply the material and add to scene
        this.fog.graphics.material = this.fogMaterial;
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
        // INSTANT MOVEMENT - RESTORED
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
