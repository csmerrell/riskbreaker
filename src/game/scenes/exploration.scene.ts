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
    Graphic,
} from 'excalibur';
import { canMoveBetween } from '@/lib/helpers/tile.helper';
import { registerInputListener } from '@/game/input/useInput';
import { TileLayer } from '@excaliburjs/plugin-tiled/build/umd/src/resource/tile-layer';
import { resources } from '@/resource';
import { useExploration } from '@/state/useExploration';
import { TiledResource } from '@excaliburjs/plugin-tiled';
import { useShader } from '@/state/useShader';
import { LightSource } from '../actors/LightSource/LightSource.component';
import { getScale } from '@/lib/helpers/screen.helper';
import { gameEnum } from '@/lib/enum/game.enum';

export class ExplorationScene extends Scene {
    private player: Actor;
    private fog: Actor;
    private fogGraphic: Graphic;
    private map: TiledResource;
    private mapGround: TileLayer;
    private fogMaterial: Material; // Store the compiled material
    private fogPreupdateHandler: () => void;

    // No animated movement properties needed

    constructor() {
        super();
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
        this.player.offset = vec(0, -4);

        // Set up graphics
        this.player.graphics.add('sprite', staticSprite);
        this.player.graphics.use('sprite');
        this.player.addComponent(new LightSource({ radius: 2 }));

        // Don't add to scene yet - will be done in setupScene
    }

    private createFog() {
        const { fogMaterial } = useShader();
        this.fogMaterial = fogMaterial.value;
        this.fog = new Actor({
            width: gameEnum.nativeWidth,
            height: gameEnum.nativeHeight,
            anchor: vec(0, 0),
            z: 9999, // draw on top
        });

        this.fogGraphic = new Rectangle({
            width: gameEnum.nativeWidth,
            height: gameEnum.nativeHeight,
            color: Color.fromHex('#151d28'),
        });
        this.fog.graphics.add('fog', this.fogGraphic);
        this.fog.graphics.use('fog');

        this.fogPreupdateHandler = () => {
            const screenPos = this.engine.worldToScreenCoordinates(
                this.player.pos.add(vec(this.player.width / 2, this.player.height / 2)),
            );
            const camOffset = this.player.pos.sub(this.camera.pos);
            if (Math.abs(camOffset.x) === 24) screenPos.x -= camOffset.x;
            if (Math.abs(camOffset.y) === 24) screenPos.y -= camOffset.y;
            const normalizedX = screenPos.x / this.engine.drawWidth;
            const normalizedY = screenPos.y / this.engine.drawHeight;

            const holePos = vec(normalizedX, 1.0 - normalizedY);

            this.fogMaterial.update((shader) => {
                shader.trySetUniformFloatVector('u_holePos', holePos);
                shader.trySetUniformFloatVector(
                    'u_resolution',
                    vec(this.fogGraphic.width, this.fogGraphic.height),
                );
                const { tilewidth } = this.map.map;
                const normalizedRadius =
                    (this.player.get(LightSource).radius * tilewidth * getScale()) /
                    visualViewport.width;
                shader.trySetUniformFloat('u_radius', normalizedRadius);

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

        console.log(this.fog.width, this.fog.height);
        const scale = vec(boundingBox.width / this.fog.width, boundingBox.height / this.fog.height);
        this.fogGraphic.width = boundingBox.width;
        this.fogGraphic.height = boundingBox.height;
        this.fog.scale = scale;
        console.log(scale);
        console.log('finished fog dim: ', this.fog.width, this.fog.height);
        console.log('tilemap bounds: ', boundingBox.width, boundingBox.height);
    }

    private addFog(_engine: Engine) {
        this.fog.pos = vec(0, 0);
        this.fog.graphics.material = this.fogMaterial;
        this.fog.on('preupdate', this.fogPreupdateHandler);
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
