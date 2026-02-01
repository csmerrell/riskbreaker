import {
    DefaultLoader,
    Engine,
    Scene,
    Actor,
    vec,
    BoundingBox,
    LimitCameraBoundsStrategy,
    Rectangle,
    Color,
    Material,
    Graphic,
    Vector,
    AnimationStrategy,
} from 'excalibur';
import { canMoveBetween } from '@/lib/helpers/tile.helper';
import { registerInputListener } from '@/game/input/useInput';
import { TileLayer } from '@excaliburjs/plugin-tiled/build/umd/src/resource/tile-layer';
import { useExploration } from '@/state/useExploration';
import { TiledResource } from '@excaliburjs/plugin-tiled';
import { useShader } from '@/state/useShader';
import { LightSource } from '../../game/actors/LightSource/LightSource.component';
import { getScale } from '@/lib/helpers/screen.helper';
import { gameEnum } from '@/lib/enum/game.enum';
import { LanternStateMachine } from '@/state/exploration/LanternStateMachine';
import { getTileCenter, isBonfire, isZoneChangePoint } from '@/resource/maps';
import { BonfireManager } from '@/state/exploration/BonfireManager';
import { CompositeActor } from '../../game/actors/CompositeActor/CompositeActor';

export class ExplorationManager {
    private player: CompositeActor;
    private fog: Actor;
    private fogGraphic: Graphic;
    private map: TiledResource;
    private mapGround: TileLayer;
    private fogMaterial: Material; // Store the compiled material
    private fogPreupdateHandler: () => void;
    private lastMovement: number;
    private lanternStateMachine: LanternStateMachine;
    private suppressLightSources: boolean;
    private playerOffset?: Vector;
    private engine: Engine;
    private scene: Scene;

    // No animated movement properties needed

    constructor(opts: { engine: Engine; scene: Scene }) {
        const { scene, engine } = opts;
        this.engine = engine;
        this.scene = scene;
        this.createPlayer();
        this.createFog();
        this.setupMovementControls();
        this.lanternStateMachine = new LanternStateMachine(this.player, scene);
        const { bonfireManager } = useExploration();
        bonfireManager.set(new BonfireManager({ scene }));
    }

    public initialize() {
        // Load the test map and create actor
        this.setupScene();
    }

    private async setupScene() {
        const { transitionMap, fadeOutEnd, fadeInStart, loaded, setCurrentMap, setTransitionMap } =
            useExploration();
        this.loadPlayer();
        this.loadMap(true);

        // Subscribe to map changes with transition effect
        fadeOutEnd.subscribe((next) => {
            if (next === true) {
                setCurrentMap(transitionMap.value.key, transitionMap.value.startPos);
                setTransitionMap(undefined);
                this.loadMap();
                fadeInStart.set(true);
            }
        });

        loaded.set(true);
    }

    private createPlayer() {
        // Create a plain ExcaliburJS Actor
        this.player = new CompositeActor({
            hair: 'shortMessy',
            armor: 'riskbreakerLeathers',
            offset: vec(0, -4),
        });

        this.player.addComponent(new LightSource({ radius: 1 }));
    }

    private createFog() {
        const { fogMaterial } = useShader();
        this.fogMaterial = fogMaterial.value;
        const fog = new Actor({
            name: 'fog',
            width: gameEnum.nativeWidth,
            height: gameEnum.nativeHeight,
            anchor: vec(0, 0),
            z: 9999, // draw on top
        });
        if (this.fog && this.fog.isAdded) {
            this.fog.kill();
            this.scene.remove(this.fog);
        }
        this.fog = fog;

        this.fogGraphic = new Rectangle({
            width: gameEnum.nativeWidth,
            height: gameEnum.nativeHeight,
            color: Color.fromHex('#151d28'),
        });
        this.fog.graphics.add('fog', this.fogGraphic);
        this.fog.graphics.use('fog');

        this.fogPreupdateHandler = () => {
            // Collect all light sources in the scene
            const lightSources: number[] = [];

            // Add player light source
            const playerScreenPos = this.engine.worldToScreenCoordinates(
                this.player.pos.add(vec(this.player.width / 2, this.player.height / 2)),
            );
            const camOffset = this.player.pos.sub(this.scene.camera.pos);
            if (Math.abs(camOffset.x) === 24) playerScreenPos.x -= camOffset.x;
            if (Math.abs(camOffset.y) === 24) playerScreenPos.y -= camOffset.y;

            const normalizedX = playerScreenPos.x / this.engine.drawWidth;
            const normalizedY = playerScreenPos.y / this.engine.drawHeight;
            const { tilewidth } = this.map.map;
            const normalizedRadius =
                (this.player.get(LightSource).radius * tilewidth * getScale()) /
                visualViewport.width;

            // Add player light source [centerX, centerY, radius]
            lightSources.push(normalizedX, 1.0 - normalizedY, normalizedRadius);

            const mapMeta = useExploration().currentMap.value;
            if (!this.suppressLightSources) {
                Object.entries(mapMeta.keyPoints).forEach(([coordKey, kp]) => {
                    if (kp.type !== 'lightSource') return;

                    let coord = getTileCenter(coordKey);
                    if (kp.offset) {
                        coord = coord.add(kp.offset);
                    }
                    const normalizedX = coord.x / this.engine.drawWidth;
                    const normalizedY = coord.y / this.engine.drawHeight;
                    const normalizedRadius =
                        (kp.radius * tilewidth * getScale()) / visualViewport.width;

                    lightSources.push(normalizedX, 1.0 - normalizedY, normalizedRadius);
                });

                this.scene.actors.forEach((actor) => {
                    if (!actor.get(LightSource)) return;

                    const { x, y } = actor.pos;
                    const coord = this.engine.worldToScreenCoordinates(vec(x, y));

                    const normalizedX = coord.x / this.engine.drawWidth;
                    const normalizedY = coord.y / this.engine.drawHeight;
                    const normalizedRadius =
                        (actor.get(LightSource).radius * tilewidth * getScale()) /
                        visualViewport.width;

                    lightSources.push(normalizedX, 1.0 - normalizedY, normalizedRadius);
                });

                const { bonfireManager } = useExploration();
                Object.keys(bonfireManager.value.getBonfires()).forEach((key) => {
                    const intensity = bonfireManager.value.getBonfireIntensity(key);

                    const coord = getTileCenter(key);
                    const normalizedX = coord.x / this.engine.drawWidth;
                    const normalizedY = coord.y / this.engine.drawHeight;
                    const normalizedRadius =
                        (intensity * tilewidth * getScale()) / visualViewport.width;

                    lightSources.push(normalizedX, 1.0 - normalizedY, normalizedRadius);
                });
            }

            this.fogMaterial.update((shader) => {
                // Pass the light sources array as vec3 array using the correct uniform method
                shader.trySetUniform('uniform3fv', 'u_lightSources', lightSources);
                shader.trySetUniformInt('u_numLightSources', lightSources.length / 3);
                shader.trySetUniformFloatVector(
                    'u_resolution',
                    vec(this.fogGraphic.width, this.fogGraphic.height),
                );

                const bg = Color.fromHex('#151d28');
                shader.trySetUniformFloat('u_fogR', bg.r / 255);
                shader.trySetUniformFloat('u_fogG', bg.g / 255);
                shader.trySetUniformFloat('u_fogB', bg.b / 255);
            });
        };
    }

    private loadPlayer() {
        // Player is already created, just add to scene
        this.scene.add(this.player);
    }

    private cleanupMap() {
        if (this.map) {
            this.scene.tileMaps.forEach((tileMap) => {
                this.scene.remove(tileMap);
            });
        }
        if (this.fog && this.fog.isAdded) {
            this.createFog();
        }
    }

    private loadMap(isSetup: boolean = false) {
        this.cleanupMap();
        const { map } = useExploration().currentMap.value;
        const { width, tilewidth, height, tileheight } = map.map;
        const boundingBox = new BoundingBox(0, 0, width * tilewidth, height * tileheight);

        this.map = map;
        map.addToScene(this.scene);

        const [groundLayer] = map.getTileLayers();
        this.mapGround = groundLayer;

        this.placePlayer(isSetup);
        this.scene.camera.addStrategy(new LimitCameraBoundsStrategy(boundingBox));

        this.placeFog(boundingBox);
        this.suppressLightSources = true;
        setTimeout(() => {
            this.suppressLightSources = false;
        });
    }

    private placeFog(boundingBox: BoundingBox) {
        const scale = vec(boundingBox.width / this.fog.width, boundingBox.height / this.fog.height);
        this.fogGraphic.width = boundingBox.width;
        this.fogGraphic.height = boundingBox.height;
        this.fog.scale = scale;
        this.fog.pos = vec(0, 0);
        this.fog.graphics.material = this.fogMaterial;
        this.fog.on('preupdate', this.fogPreupdateHandler);
        this.scene.add(this.fog);
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
        this.player.z = 1;

        // Set camera to follow the actor
        this.scene.camera.strategy.lockToActor(this.player);
        setTimeout(() => {
            this.player.pos = this.player.pos.add(this.getTileOffset());
            playerTileCoord.set(vec(x, y));
            this.movementAfterEffects();
        }, 0);
    }

    private canMove() {
        if (!this.lastMovement) {
            this.lastMovement = Date.now();
            return true;
        } else if (Date.now() - this.lastMovement < 75) {
            return false;
        } else {
            this.lastMovement = Date.now();
            return true;
        }
    }

    private setupMovementControls() {
        const { playerTileCoord } = useExploration();
        const duration = 100;
        registerInputListener(() => {
            if (!this.canMove()) return;

            const currentCoord = playerTileCoord.value;
            const nextCoord = vec(currentCoord.x, currentCoord.y - 1);

            if (canMoveBetween(currentCoord, nextCoord, this.mapGround)) {
                playerTileCoord.set(nextCoord);
                this.player.actions
                    .moveBy({
                        offset: vec(0, -24).add(this.getTileOffset()),
                        duration,
                    })
                    .toPromise()
                    .then(() => {
                        this.movementAfterEffects();
                    });
            }
        }, ['movement_up', 'menu_up']);

        registerInputListener(() => {
            if (!this.canMove()) return;
            const currentCoord = playerTileCoord.value;
            const nextCoord = vec(currentCoord.x, currentCoord.y + 1);

            if (canMoveBetween(currentCoord, nextCoord, this.mapGround)) {
                playerTileCoord.set(nextCoord);
                this.player.actions
                    .moveBy({
                        offset: vec(0, 24).add(this.getTileOffset()),
                        duration,
                    })
                    .toPromise()
                    .then(() => {
                        this.movementAfterEffects();
                    });
            }
        }, ['movement_down', 'menu_down']);

        registerInputListener(() => {
            if (!this.canMove()) return;
            const currentCoord = playerTileCoord.value;
            const nextCoord = vec(currentCoord.x - 1, currentCoord.y);

            this.player.scale = vec(1, 1);
            if (canMoveBetween(currentCoord, nextCoord, this.mapGround)) {
                playerTileCoord.set(nextCoord);
                this.player.actions
                    .moveBy({
                        offset: vec(-24, 0).add(this.getTileOffset()),
                        duration,
                    })
                    .toPromise()
                    .then(() => {
                        this.movementAfterEffects();
                    });
            }
        }, ['movement_left', 'menu_left']);

        registerInputListener(() => {
            if (!this.canMove()) return;
            const currentCoord = playerTileCoord.value;
            const nextCoord = vec(currentCoord.x + 1, currentCoord.y);

            this.player.scale = vec(-1, 1);
            if (canMoveBetween(currentCoord, nextCoord, this.mapGround)) {
                playerTileCoord.set(nextCoord);
                this.player.actions
                    .moveBy({
                        offset: vec(24, 0).add(this.getTileOffset()),
                        duration,
                    })
                    .toPromise()
                    .then(() => {
                        this.movementAfterEffects();
                    });
            }
        }, ['movement_right', 'menu_right']);
    }

    private getTileOffset() {
        const { currentMap, playerTileCoord } = useExploration();
        const { x, y } = playerTileCoord.value;
        const keyPoint = currentMap.value.keyPoints[`${x}_${y}`];

        if (keyPoint && isBonfire(keyPoint)) {
            const { bonfireManager } = useExploration();
            const { offset, playerScale } = bonfireManager.value.getTileOffsets();
            this.playerOffset = offset;
            this.player.scale = playerScale;
            return this.playerOffset;
        } else if (this.playerOffset) {
            const revert = this.playerOffset.scale(-1);
            delete this.playerOffset;
            return revert;
        }
        return vec(0, 0);
    }

    private async movementAfterEffects() {
        const {
            tileControlPrompts,
            playerTileCoord,
            currentMap,
            fadeInStart,
            setTransitionMap,
            saveExplorationState,
        } = useExploration();
        tileControlPrompts.set(null);
        const { playerPos } = useExploration();
        playerPos.set({
            pos: vec(this.player.pos.x, this.player.pos.y),
            size: this.player.height,
        });

        const { x, y } = playerTileCoord.value;
        const keyPoint = currentMap.value.keyPoints[`${x}_${y}`];

        setTimeout(() => {
            if (keyPoint) {
                if (isZoneChangePoint(keyPoint)) {
                    setTransitionMap(keyPoint.key, keyPoint.posOverride);
                    const waitId = fadeInStart.subscribe(() => {
                        setTimeout(() => {
                            saveExplorationState();
                            fadeInStart.unsubscribe(waitId);
                        }, 0);
                    });
                } else if (isBonfire(keyPoint)) {
                    saveExplorationState();
                    const { bonfireManager } = useExploration();
                    bonfireManager.value.onTileEnter(`${x}_${y}`);
                } else {
                    saveExplorationState();
                    if (keyPoint.type === 'interactable') {
                        console.log('TODO: Show interaction prompt');
                    }
                }
            } else {
                saveExplorationState();
            }
            this.scene.events.emit('moved', {
                newPos: playerTileCoord.value,
            });
        }, 75);
    }
}
