import {
    Actor,
    vec,
    BoundingBox,
    LimitCameraBoundsStrategy,
    Rectangle,
    Color,
    Material,
    Graphic,
    Vector,
    PostProcessor,
    ScreenShader,
} from 'excalibur';
import { TileLayer } from '@excaliburjs/plugin-tiled/build/umd/src/resource/tile-layer';
import { TiledResource } from '@excaliburjs/plugin-tiled';
import { maps } from '@/resource/maps';
import type { MapMetaKeyed } from '@/resource/maps/maps';
import { useShader } from '@/state/useShader';
import { getScale } from '@/lib/helpers/screen.helper';
import { gameEnum } from '@/lib/enum/game.enum';
import { getTileCenter, isBonfire } from '@/resource/maps';
import { LightSource } from '@/game/actors/LightSource/LightSource.component';
import type { ExplorationManager } from './ExplorationManager';
import { SceneManager } from '../SceneManager';
import { makeState } from '@/state/Observable';
import PIXELATE_TRANSITION_SHADER from '@/shader/pixelateTransition.glsl?raw';
import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';

interface BufferedMap {
    tiledResource: TiledResource;
    fog: Actor;
    fogGraphic: Graphic;
    groundLayer: TileLayer;
    boundingBox: BoundingBox;
    mapMeta: MapMetaKeyed;
}

export class PixelateTransitionPostProcessor implements PostProcessor {
    private _shader!: ScreenShader;
    private progress: number = 0;

    initialize(gl: WebGL2RenderingContext): void {
        this._shader = new ScreenShader(gl, PIXELATE_TRANSITION_SHADER);
    }

    getLayout() {
        return this._shader.getLayout();
    }

    getShader() {
        return this._shader.getShader();
    }

    onUpdate(_elapsed: number): void {
        if (!this._shader) return;

        const shader = this._shader.getShader();
        if (shader && typeof shader.trySetUniformFloat === 'function') {
            shader.trySetUniformFloat('u_progress', this.progress);
            shader.trySetUniform('uniform2iv', 'u_squaresMin', [20, 20]);
            shader.trySetUniformInt('u_steps', 50);
        }
    }

    setProgress(value: number) {
        this.progress = value;
    }
}

export class MapManager extends SceneManager {
    private bufferedMaps: Record<string, BufferedMap> = {};
    private currentMapKey?: string;
    public currentMap = makeState<MapMetaKeyed>();
    private fogMaterial: Material;
    private fogPreupdateHandler!: () => void;
    private suppressLightSources: boolean = false;
    private pixelateTransitionProcessor: PixelateTransitionPostProcessor;

    constructor(private parent: ExplorationManager) {
        super({ scene: parent.scene });
        const { fogMaterial } = useShader();
        this.fogMaterial = fogMaterial.value;
        this.createFogPreupdateHandler();
        this.pixelateTransitionProcessor = new PixelateTransitionPostProcessor();
    }

    public async preloadMap(key: keyof typeof maps): Promise<void> {
        if (this.bufferedMaps[key]) {
            return; // Already buffered
        }

        const mapMeta = maps[key];
        const tiledResource = mapMeta.map;

        // Load the tiled resource if not already loaded
        if (!tiledResource.isLoaded()) {
            await tiledResource.load();
        }

        const { width, tilewidth, height, tileheight } = tiledResource.map;
        const boundingBox = new BoundingBox(0, 0, width * tilewidth, height * tileheight);
        const [groundLayer] = tiledResource.getTileLayers();

        // Create fog actor for this map
        const fog = new Actor({
            name: `fog-${key}`,
            width: gameEnum.nativeWidth,
            height: gameEnum.nativeHeight,
            anchor: vec(0, 0),
            z: 100,
        });

        const fogGraphic = new Rectangle({
            width: boundingBox.width,
            height: boundingBox.height,
            color: Color.fromHex('#151d28'),
        });

        fog.graphics.add('fog', fogGraphic);
        fog.graphics.use('fog');

        const scale = vec(boundingBox.width / fog.width, boundingBox.height / fog.height);
        fog.scale = scale;
        fog.pos = vec(0, 0);
        fog.graphics.material = this.fogMaterial;

        this.bufferedMaps[key] = {
            tiledResource,
            fog,
            fogGraphic,
            groundLayer,
            boundingBox,
            mapMeta,
        };
    }

    public async loadMap(key: keyof typeof maps, startPosOverride?: Vector): Promise<void> {
        const scene = this.parent.scene;

        // Cleanup current map if exists
        this.cleanupMap();

        // Preload if not buffered
        await this.preloadMap(key);

        const buffered = this.bufferedMaps[key];
        this.currentMapKey = key;

        // Set currentMap observable with metadata
        this.currentMap.set(
            startPosOverride
                ? {
                      ...buffered.mapMeta,
                      startPos: startPosOverride,
                  }
                : buffered.mapMeta,
        );

        // Add tilemap to scene
        buffered.tiledResource.addToScene(scene);

        // Set camera bounds
        this.applyCameraBounds();

        // Add fog to scene
        buffered.fog.on('preupdate', this.fogPreupdateHandler);
        scene.add(buffered.fog);

        // Suppress light sources during camera settle
        this.suppressLightSources = true;
        await this.parent.awaitCameraSettle();
        this.suppressLightSources = false;
    }

    public async transitionToMap(key: keyof typeof maps, startPos?: Vector): Promise<void> {
        const engine = this.engine;
        const preload = this.preloadMap(key);

        engine.graphicsContext.addPostProcessor(this.pixelateTransitionProcessor);

        await this.animateTransitionProgress(0, 1, 500);
        await preload;
        await this.loadMap(key, startPos ?? maps[key].startPos);
        await this.animateTransitionProgress(1, 0, 500);

        engine.graphicsContext.removePostProcessor(this.pixelateTransitionProcessor);
    }

    public async transitionOut() {
        const engine = this.engine;
        engine.graphicsContext.addPostProcessor(this.pixelateTransitionProcessor);
        return this.animateTransitionProgress(0, 1, 500);
    }

    public async transitionIn() {
        const engine = this.engine;
        engine.graphicsContext.addPostProcessor(this.pixelateTransitionProcessor);
        return this.animateTransitionProgress(1, 0, 500).then(() => {
            engine.graphicsContext.removePostProcessor(this.pixelateTransitionProcessor);
        });
    }

    private animateTransitionProgress(from: number, to: number, duration: number): Promise<void> {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const delta = to - from;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Linear interpolation
                const currentProgress = from + delta * progress;
                this.pixelateTransitionProcessor.setProgress(currentProgress);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            animate();
        });
    }

    private cleanupMap(): void {
        if (!this.currentMapKey) return;

        const buffered = this.bufferedMaps[this.currentMapKey];
        if (!buffered) return;

        const scene = this.parent.scene;

        // Remove tilemap from scene
        scene.tileMaps.forEach((tileMap) => {
            scene.remove(tileMap);
        });

        // Remove fog from scene
        if (buffered.fog.isAdded) {
            buffered.fog.off('preupdate', this.fogPreupdateHandler);
            scene.remove(buffered.fog);
        }
    }

    public getMapGround(): TileLayer | undefined {
        if (!this.currentMapKey) {
            return undefined;
        }

        const buffered = this.bufferedMaps[this.currentMapKey];
        if (!buffered) {
            return undefined;
        }

        return buffered.groundLayer;
    }

    public getBounds(): BoundingBox | undefined {
        if (!this.currentMapKey) {
            return undefined;
        }

        const buffered = this.bufferedMaps[this.currentMapKey];
        if (!buffered) {
            return undefined;
        }

        return buffered.boundingBox;
    }

    public applyCameraBounds(): void {
        if (!this.currentMapKey) {
            console.warn('Cannot apply camera bounds: no map loaded');
            return;
        }

        const buffered = this.bufferedMaps[this.currentMapKey];
        if (!buffered) {
            console.warn(`Cannot apply camera bounds: map ${this.currentMapKey} not buffered`);
            return;
        }

        // Don't clear all strategies - just add the bounds strategy
        // The lockToActor strategy should remain
        this.scene.camera.addStrategy(new LimitCameraBoundsStrategy(buffered.boundingBox));
    }

    public explorationTarget?: CompositeActor;
    public async placePlayerAtTile(coord: Vector) {
        if (this.explorationTarget?.isAdded) {
            this.scene.remove(this.explorationTarget);
        }

        this.explorationTarget = this.parent.actorManager.getLeader();
        if (!this.explorationTarget) {
            throw new Error('Map invoked character placement without a valid actor.');
        }

        if (!this.currentMapKey) {
            console.warn('Cannot place player: no map loaded');
            return;
        }
        this.scene.add(this.explorationTarget);

        const buffered = this.bufferedMaps[this.currentMapKey];
        const tilePos = buffered.groundLayer.getTileByCoordinate(coord.x, coord.y)!.exTile.pos;
        const spriteTileCenterOffset = vec(12, 12); // Half tile size to center on tile

        // Check if tile has special offset (e.g., bonfire)
        const { x, y } = coord;
        const keyPoint = this.currentMap.value.keyPoints[`${x}_${y}`];
        let tileOffset = vec(0, -4);

        if (keyPoint && isBonfire(keyPoint)) {
            const { offset, playerScale } = this.parent.bonfireManager.getTileOffsets();
            tileOffset = tileOffset.add(offset);
            this.explorationTarget.scale = playerScale;
        }

        this.explorationTarget.pos = tilePos.add(spriteTileCenterOffset).add(tileOffset);
        this.explorationTarget.z = 1;

        // Update player tile coord
        this.parent.playerTileCoord.set(coord);

        return this.parent.movementManager.movementAfterEffects();
    }

    public placePlayerAtPosition(pos: Vector): void {
        const player = this.parent.actorManager.getPlayers()[0];
        if (!player) {
            console.warn('Cannot place player: player does not exist');
            return;
        }

        player.pos = pos;
        player.z = 1;
    }

    private createFogPreupdateHandler() {
        this.fogPreupdateHandler = () => {
            if (!this.currentMapKey) return;

            const buffered = this.bufferedMaps[this.currentMapKey];
            const player = this.parent.actorManager.getPlayers()[0];
            const scene = this.parent.scene;
            const engine = this.engine;

            const lightSources: number[] = [];

            // Add player light source
            if (player) {
                const playerScreenPos = engine.worldToScreenCoordinates(
                    player.pos.add(vec(player.width / 2, player.height / 2)),
                );
                const camOffset = player.pos.sub(scene.camera.pos);
                if (Math.abs(camOffset.x) === 24) playerScreenPos.x -= camOffset.x;
                if (Math.abs(camOffset.y) === 24) playerScreenPos.y -= camOffset.y;

                const normalizedX = playerScreenPos.x / engine.drawWidth;
                const normalizedY = playerScreenPos.y / engine.drawHeight;
                const { tilewidth } = buffered.tiledResource.map;
                const normalizedRadius =
                    (player.get(LightSource).radius * tilewidth * getScale()) /
                    visualViewport!.width;

                lightSources.push(normalizedX, 1.0 - normalizedY, normalizedRadius);
            }

            const mapMeta = this.currentMap.value;
            if (!this.suppressLightSources) {
                Object.entries(mapMeta.keyPoints).forEach(([coordKey, kp]) => {
                    if (kp.type !== 'lightSource') return;

                    let coord = getTileCenter(coordKey);
                    if (kp.offset) {
                        coord = coord.add(kp.offset);
                    }
                    const normalizedX = coord.x / engine.drawWidth;
                    const normalizedY = coord.y / engine.drawHeight;
                    const { tilewidth } = buffered.tiledResource.map;
                    const normalizedRadius =
                        (kp.radius * tilewidth * getScale()) / visualViewport!.width;

                    lightSources.push(normalizedX, 1.0 - normalizedY, normalizedRadius);
                });

                scene.actors.forEach((actor) => {
                    if (!actor.get(LightSource)) return;

                    const { x, y } = actor.pos;
                    const coord = engine.worldToScreenCoordinates(vec(x, y));

                    const normalizedX = coord.x / engine.drawWidth;
                    const normalizedY = coord.y / engine.drawHeight;
                    const { tilewidth } = buffered.tiledResource.map;
                    const normalizedRadius =
                        (actor.get(LightSource).radius * tilewidth * getScale()) /
                        visualViewport!.width;

                    lightSources.push(normalizedX, 1.0 - normalizedY, normalizedRadius);
                });

                Object.keys(this.parent.bonfireManager.getBonfires()).forEach((key) => {
                    const intensity = this.parent.bonfireManager.getBonfireIntensity(key);

                    const coord = getTileCenter(key);
                    const normalizedX = coord.x / engine.drawWidth;
                    const normalizedY = coord.y / engine.drawHeight;
                    const { tilewidth } = buffered.tiledResource.map;
                    const normalizedRadius =
                        (intensity * tilewidth * getScale()) / visualViewport!.width;

                    lightSources.push(normalizedX, 1.0 - normalizedY, normalizedRadius);
                });
            }

            this.fogMaterial.update((shader) => {
                shader.trySetUniform('uniform3fv', 'u_lightSources', lightSources);
                shader.trySetUniformInt('u_numLightSources', lightSources.length / 3);
                shader.trySetUniformFloatVector(
                    'u_resolution',
                    vec(buffered.fogGraphic.width, buffered.fogGraphic.height),
                );

                const bg = Color.fromHex('#151d28');
                shader.trySetUniformFloat('u_fogR', bg.r / 255);
                shader.trySetUniformFloat('u_fogG', bg.g / 255);
                shader.trySetUniformFloat('u_fogB', bg.b / 255);
            });
        };
    }
}
