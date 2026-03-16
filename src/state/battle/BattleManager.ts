import {
    Actor,
    AnimationStrategy,
    BoundingBox,
    Color,
    EasingFunctions,
    GraphicsGroup,
    Material,
    Rectangle,
    vec,
} from 'excalibur';
import { SceneManager } from '../SceneManager';
import { colors } from '@/lib/enum/colors.enum';
import { useShader } from '../useShader';
import { battleground, toLayerArray } from '@/resource/image/battleground';
import {
    captureControls,
    registerInputListener,
    unCaptureControls,
    unregisterInputListener,
} from '@/game/input/useInput';
import { gameEnum } from '@/lib/enum/game.enum';
import { useExploration } from '../useExploration';
import { loopUntil } from '@/lib/helpers/async.helper';
import { ExplorationManager } from '../exploration/ExplorationManager';
import FADE_BG_SHADER from '@/shader/fadeBg.glsl?raw';
import { useGameContext } from '../useGameContext';
import { LaneKey, PartyMember, useParty } from '../useParty';
import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import { LANE_POSITIONS } from './lanePositions.enum';
import { BattleActor, BattleUnit, EnemyDef, useBattle } from './useBattle';
import { KeyedAnimationActor } from '@/game/actors/KeyedAnimationActor';
import { HeadshotManager } from './HeadshotManager';
import { TurnManager } from './TurnManager';
import { BattleCameraManager } from './BattleCameraManager';

function getPositionInLane(
    lane: LaneKey,
    opts: {
        numInLane: number;
        idxInLane: number;
    },
) {
    return LANE_POSITIONS[lane][opts.numInLane][opts.idxInLane];
}

export class BattleManager extends SceneManager {
    private mask!: Actor;
    private terrain: Actor[] = [];
    public static laneKeys: LaneKey[] = ['left-2', 'left-1', 'mid', 'right-1', 'right-2'];
    public headshotManager: HeadshotManager;
    public turnManager: TurnManager;

    private setCameraReady!: () => void;
    public battleCameraReady!: Promise<void>;
    public cameraManager?: BattleCameraManager;

    constructor(private parent: ExplorationManager) {
        super({ scene: parent.scene });
        this.headshotManager = new HeadshotManager(this);
        this.turnManager = new TurnManager(this);
        this.createMask();
        this.setTerrain('grass');
        this.resetCameraReadiness();
        this.setReady();
    }

    private resetCameraReadiness() {
        this.battleCameraReady = new Promise<void>((resolve) => {
            this.setCameraReady = resolve;
        });
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
        });
        this.mask.graphics.add(graphic);
        this.mask.graphics.use(graphic);
    }

    public laneActors = {} as Record<LaneKey, Actor>;
    private groundActor!: Actor;
    public setTerrain(type: 'grass' | 'dirt') {
        if (this.terrain) this.terrain.forEach((t) => t.isAdded && t.kill());

        toLayerArray(battleground, type).forEach((terrainGroup) => {
            const bgGraphic = new GraphicsGroup({
                useAnchor: true,
                members: terrainGroup.sources.map((img) => ({
                    graphic: img.toSprite(),
                    offset: vec(0, 12),
                })),
            });
            const layerActor = new Actor({
                name: 'terrain',
                opacity: 1,
                z: terrainGroup.zIndex,
            });

            if (terrainGroup.lane !== undefined) {
                this.laneActors[terrainGroup.lane] = layerActor;
            } else if (terrainGroup.isGround) {
                this.groundActor = layerActor;
            }
            layerActor.graphics.add(bgGraphic);
            layerActor.graphics.use(bgGraphic);
            this.terrain.push(layerActor);

            this.terrainMaterial = this.engine.graphicsContext.createMaterial({
                name: 'fadeBg',
                fragmentSource: FADE_BG_SHADER,
            });
        });
    }

    onPreupdate() {
        if (!this.terrainMaterial) return;
        const fogColor = Color.fromHex('#151d28');
        this.terrainMaterial.update((shader) => {
            shader.trySetUniformFloat('u_fogR', fogColor.r / 255);
            shader.trySetUniformFloat('u_fogG', fogColor.g / 255);
            shader.trySetUniformFloat('u_fogB', fogColor.b / 255);
            shader.trySetUniformFloat('u_progress', this.terrainShaderProgress);
        });

        // Update lane target shader time uniform
        if (this.currentTargetedLane && this.laneActors[this.currentTargetedLane]) {
            const elapsedTime = Date.now() - this.laneTargetStartTime;
            this.laneActors[this.currentTargetedLane].graphics.material?.update((shader) => {
                shader.trySetUniformFloat('u_time', elapsedTime);
            });
        }
    }

    private scaleMask() {
        const explorationManager = useExploration().getExplorationManager();
        const { map } = explorationManager.mapManager.currentMap.value;
        const { width, tilewidth, height, tileheight } = map.map;
        const boundingBox = new BoundingBox(0, 0, width * tilewidth, height * tileheight);
        const scale = vec(
            boundingBox.width / this.mask.width,
            boundingBox.height / this.mask.height,
        );
        this.mask.graphics.current!.width = boundingBox.width;
        this.mask.graphics.current!.height = boundingBox.height;
        this.mask.scale = scale;
    }

    private terrainMaterial!: Material;
    private terrainShaderProgress = 1;
    private previousView: string = '';
    public battleStartReady: Promise<void> = Promise.resolve();
    public async openBattle(opts: { empty?: boolean } = {}): Promise<void> {
        captureControls('Battle');
        this.headshotManager.clearHeadshots();
        this.battleStartReady = new Promise<void>(async (setBattleReady) => {
            const activeView = useGameContext().activeView;
            this.previousView = activeView.value;
            activeView.value = '';

            await useExploration().getExplorationManager().ready();

            //add mask over whole screen
            this.scaleMask();
            activeView.value = 'battle';
            this.mask.graphics.opacity = 0;
            this.mask.pos = this.scene.camera.pos;
            this.scene.add(this.mask);

            //add terrain actor. It has a fade-in-out material.
            //terrainShaderProgress controls how much bg color is blended to the terrain during fade.
            this.terrainShaderProgress = 1;
            this.terrain.forEach((layer) => {
                layer.graphics.material = this.terrainMaterial;
                layer.graphics.opacity = 0;
                layer.pos = this.scene.camera.pos;
                this.scene.add(layer);
            });

            //Fade in
            const duration = 250;
            const step = 25;
            const numSteps = duration / step;
            const opacityStep = 1 / numSteps;
            await Promise.all([
                this.parent.mapManager.explorationTarget?.fadeOut() ?? Promise.resolve(),
                loopUntil(
                    () => this.terrain[0].graphics.opacity === 1,
                    () => this.stepOpacity(opacityStep),
                    step,
                ),
            ]);

            this.terrain.forEach((layer) => (layer.graphics.material = null));

            if (!opts.empty) {
                await this.placeParty();
                await this.placeEnemies();
                this.cameraManager = new BattleCameraManager(this);
                this.setCameraReady();
                this.startBattle();
            }

            this.registerInput();
            setBattleReady();
        });
    }

    public async closeBattle() {
        this.battleStartReady = Promise.resolve();
        const activeView = useGameContext().activeView;
        activeView.value = '';
        this.turnManager.reset();
        const leader = this.parent.actorManager.getLeader();

        this.terrainShaderProgress = 0;
        this.terrain.forEach((layer) => {
            layer.graphics.material = this.terrainMaterial;
        });

        //Fade out
        const duration = 250;
        const step = 25;
        const numSteps = duration / step;
        const opacityStep = -1 / numSteps;
        await Promise.all([
            leader.fadeIn(),
            this.getAllActors().map(
                (a) => (a as unknown as CompositeActor).fadeOut?.(duration) ?? Promise.resolve(),
            ),
            loopUntil(
                () => this.terrain[0].graphics.opacity === 0,
                () => this.stepOpacity(opacityStep),
                step,
            ),
            this.parent.scene.camera.move(leader.pos, 250, EasingFunctions.Linear),
            this.parent.scene.camera.zoomOverTime(1.0, 250, EasingFunctions.Linear),
        ]);
        this.resetCameraReadiness();
        this.parent.cameraManager.lockToActor(leader);

        (Object.keys(this.laneUnitMap) as LaneKey[]).forEach((key) => {
            this.laneUnitMap[key].forEach((actor) => {
                actor.kill();
            });
            this.laneUnitMap[key] = [];
        });
        this.terrain.forEach((layer) => {
            layer.graphics.material = null;
            this.scene.remove(layer);
        });
        this.scene.remove(this.mask);

        activeView.value = this.previousView;
        this.previousView = '';
        unCaptureControls();
        this.endBattle();
    }

    private stepOpacity(opacityStep: number) {
        const nextOpacity =
            opacityStep < 0
                ? Math.max(0, this.terrain[0].graphics.opacity + opacityStep)
                : Math.min(this.terrain[0].graphics.opacity + opacityStep, 1);
        this.terrain.forEach((layer) => (layer.graphics.opacity = nextOpacity));
        Object.values(this.laneUnitMap).forEach((lane) =>
            lane.forEach((actor) => {
                if (!(actor as CompositeActor).fadeOut) {
                    actor.graphics.opacity = nextOpacity;
                }
            }),
        );
        this.terrainShaderProgress -= opacityStep;

        this.mask.graphics.opacity =
            opacityStep < 0
                ? Math.max(0, this.mask.graphics.opacity + opacityStep)
                : Math.min(this.mask.graphics.opacity + opacityStep, 0.8);
    }

    public laneUnitMap: Record<LaneKey, (KeyedAnimationActor<string> | CompositeActor)[]> = {
        'left-2': [],
        'left-1': [],
        mid: [],
        'right-1': [],
        'right-2': [],
    } as const satisfies Record<string, Actor[]>;
    public async placePlayer(player: PartyMember, lane: LaneKey) {
        const actor = new CompositeActor(player.appearance);
        actor.unitId = player.id;
        const boundingBox = this.parent.cameraManager.getBoundingBox()!;
        const numInLane = useParty().partyState.value.party.filter(
            (p) => p.config.battlePosition === lane,
        ).length;
        const pos = this.scene.camera.pos.add(
            getPositionInLane(lane, { numInLane, idxInLane: this.laneUnitMap[lane].length }),
        );
        actor.pos = vec(boundingBox.left, boundingBox.top + boundingBox.height / 2);
        actor.z = this.groundActor.z + 1;
        actor.scale = vec(-1, 1);
        this.laneUnitMap[lane].push(actor);
        this.parent.scene.add(actor);

        const portraitActor = new CompositeActor(player.appearance);
        portraitActor.unitId = player.id;
        this.headshotManager.captureHeadshot(portraitActor);
        return actor.actions
            .moveTo({ pos, duration: 500, easing: EasingFunctions.EaseOutCubic })
            .toPromise()
            .then(() => {
                actor.useAnimation('idle', { strategy: AnimationStrategy.Loop });
            });
    }

    public async placeParty() {
        const party = useParty().partyState.value.party;
        for (const p of party) {
            await this.placePlayer(p, p.config.battlePosition ?? 'left-1');
            await new Promise<void>((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 250);
            });
        }
    }

    public async placeEnemy(e: EnemyDef, lane: LaneKey) {
        const boundingBox = this.parent.cameraManager.getBoundingBox()!;
        const numInLane = useBattle().battleState.value.enemies.filter(
            (p) => p.config.battlePosition === lane,
        ).length;
        const pos = this.scene.camera.pos.add(
            getPositionInLane(lane, { numInLane, idxInLane: this.laneUnitMap[lane].length }),
        );
        const enemy = new e.constructor();
        enemy.unitId = e.id;
        enemy.pos = vec(
            boundingBox.right + enemy.getDimensions().spriteWidth,
            boundingBox.top + boundingBox.height / 2,
        );
        enemy.z = this.groundActor.z + 1;
        this.laneUnitMap[lane].push(enemy);
        this.parent.scene.add(enemy);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        enemy.useAnimation(enemy.battleEntryKey ?? 'static');
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

        const portraitActor = new e.constructor();
        portraitActor.unitId = e.id;
        this.headshotManager.captureHeadshot(portraitActor);
        return enemy.battleFieldEntry
            ? enemy.battleFieldEntry(pos).then(() => {
                  enemy.useAnimation('idle', { strategy: AnimationStrategy.Loop });
              })
            : enemy.actions
                  .moveTo({ pos, duration: 500, easing: EasingFunctions.EaseOutCubic })
                  .toPromise()
                  .then(() => {
                      enemy.useAnimation('idle', { strategy: AnimationStrategy.Loop });
                  });
    }

    public async placeEnemies() {
        const enemies = useBattle().battleState.value.enemies;
        for (const e of enemies) {
            await this.placeEnemy(e, e.config.battlePosition ?? 'right-1');
        }
    }

    public moveUnit(
        dest: LaneKey,
        unit: BattleUnit,
        actor: BattleActor,
    ): { promise: Promise<void>; duration: number } {
        const current = unit.config.battlePosition;
        const unitsInCurrent = this.laneUnitMap[current];
        const unitsInDest = this.laneUnitMap[dest];
        const { getUnits } = useBattle();
        if (unitsInDest.length === 3) return { promise: Promise.resolve(), duration: 0 }; //cannot move into full lane
        if (
            unitsInDest.some((u) => {
                const u_unit = getUnits().find((battleUnit) => battleUnit.id === u.unitId);
                return u_unit?.alignment !== unit.alignment;
            })
        ) {
            //Cannot move into lane occupied by enemy
            return { promise: Promise.resolve(), duration: 0 };
        }

        const actorIdxInLane = unitsInCurrent.findIndex((u) => u.id === actor.id);
        const newPosition = this.cameraManager!.battleCenter.add(
            getPositionInLane(dest, {
                numInLane: unitsInDest.length + 1,
                idxInLane: unitsInDest.length,
            }),
        );
        const duration = 250;
        const cameraFocusPromise = this.cameraManager!.focusUnit(actor, {
            forcePosition: newPosition,
            duration,
        });
        const promise = Promise.all([
            ...unitsInDest.map((u, idx) =>
                u.actions
                    .moveTo({
                        pos: this.cameraManager!.battleCenter.add(
                            getPositionInLane(dest, {
                                numInLane: unitsInDest.length + 1,
                                idxInLane: idx,
                            }),
                        ),
                        duration,
                        easing: EasingFunctions.EaseOutCubic,
                    })
                    .toPromise(),
            ),
            actor.actions
                .moveTo({
                    pos: newPosition,
                    duration,
                    easing: EasingFunctions.EaseOutCubic,
                })
                .toPromise(),
            ...unitsInCurrent
                .map((u, idx) => {
                    if (u.id === actor.id) return undefined;
                    return u.actions
                        .moveTo({
                            pos: this.cameraManager!.battleCenter.add(
                                getPositionInLane(current, {
                                    numInLane: unitsInCurrent.length - 1,
                                    idxInLane: idx < actorIdxInLane ? idx : idx - 1,
                                }),
                            ),
                            duration,
                            easing: EasingFunctions.EaseOutCubic,
                        })
                        .toPromise();
                })
                .filter((p) => p !== undefined),
            this.turnManager.moveMenus({
                actor,
                dependentPromise: cameraFocusPromise,
            }),
        ]).then(() => {
            this.laneUnitMap[current].splice(actorIdxInLane, 1);
            this.laneUnitMap[dest].push(actor);
            unit.config.battlePosition = dest;
        });

        return { promise, duration };
    }

    public getAllActors() {
        return Object.values(this.laneUnitMap).flat();
    }

    public startBattle() {
        this.turnManager.start();
    }

    public endBattle() {
        this.turnManager.reset();
    }

    private currentTargetedLane?: LaneKey;
    private laneTargetStartTime = 0;

    public setTargetedLane(lane: LaneKey | undefined) {
        // Remove shader from previously targeted lane
        if (this.currentTargetedLane && this.laneActors[this.currentTargetedLane]) {
            this.laneActors[this.currentTargetedLane].graphics.material = null;
        }

        this.currentTargetedLane = lane;
        this.laneTargetStartTime = Date.now();

        // Apply shader to newly targeted lane
        if (lane && this.laneActors[lane]) {
            const { laneTargetMaterial } = useShader();
            this.laneActors[lane].graphics.material = laneTargetMaterial.value;
        }
    }

    private listeners: string[] = [];
    private registerInput() {
        this.listeners = [
            registerInputListener(() => {
                this.listeners.forEach((l) => unregisterInputListener(l));
                this.closeBattle();
            }, 'cancel'),
        ];
    }
}
