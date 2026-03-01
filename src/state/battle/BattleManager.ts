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
import { getScale } from '@/lib/helpers/screen.helper';
import { useBattle } from '../useBattle';
import { KeyedAnimationActor } from '@/game/actors/KeyedAnimationActor';

function getPositionInLane(
    lane: LaneKey,
    opts: {
        numInLane: number;
        idxInLane: number;
    },
) {
    return LANE_POSITIONS[lane][opts.numInLane][opts.idxInLane].scale(getScale());
}

export class BattleManager extends SceneManager {
    private mask!: Actor;
    private terrain!: Actor;

    constructor(private parent: ExplorationManager) {
        super({ scene: parent.scene });
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
        });
        this.mask.graphics.add(graphic);
        this.mask.graphics.use(graphic);
    }

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

        this.terrainMaterial = this.engine.graphicsContext.createMaterial({
            name: 'fadeBg',
            fragmentSource: FADE_BG_SHADER,
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
    public async openBattle(opts: { empty?: boolean } = {}): Promise<void> {
        captureControls('Battle');
        const activeView = useGameContext().activeView;
        this.previousView = activeView.value;
        activeView.value = '';

        await useExploration().getExplorationManager().ready();
        //ensure mask covers whole screen
        this.scaleMask();
        activeView.value = 'battle';
        this.mask.graphics.opacity = 0;
        this.terrain.graphics.material = this.terrainMaterial;
        this.terrain.graphics.opacity = 0;
        this.terrainShaderProgress = 1;
        this.mask.pos = this.scene.camera.pos;
        this.terrain.pos = this.scene.camera.pos;
        this.scene.add(this.mask);
        this.scene.add(this.terrain);

        //Fade in
        const duration = 250;
        const step = 25;
        const numSteps = duration / step;
        const opacityStep = 1 / numSteps;
        await Promise.all([
            this.parent.mapManager.explorationTarget?.fadeOut() ?? Promise.resolve(),
            loopUntil(
                () => this.terrain.graphics.opacity === 1,
                () => this.stepOpacity(opacityStep),
                step,
            ),
        ]);

        this.terrain.graphics.material = null;

        if (!opts.empty) {
            await this.placeParty();
            await this.placeEnemies();
            this.startBattle();
        }

        this.registerInput();
    }

    public async closeBattle() {
        const activeView = useGameContext().activeView;
        activeView.value = '';
        this.parent.actorManager.getLeader().fadeIn();

        this.terrainShaderProgress = 0;
        this.terrain.graphics.material = this.terrainMaterial;
        //Fade out
        const duration = 250;
        const step = 25;
        const numSteps = duration / step;
        const opacityStep = -1 / numSteps;
        await Promise.all([
            Object.values(this.laneUnitMap).flatMap(
                (a) => (a as unknown as CompositeActor).fadeOut?.(duration) ?? Promise.resolve(),
            ),
            loopUntil(
                () => this.terrain.graphics.opacity === 0,
                () => this.stepOpacity(opacityStep),
                step,
            ),
        ]);
        (Object.keys(this.laneUnitMap) as LaneKey[]).forEach((key) => {
            this.laneUnitMap[key].forEach((actor) => {
                actor.kill();
            });
            this.laneUnitMap[key] = [];
        });
        this.terrain.graphics.material = null;
        this.scene.remove(this.terrain);
        this.scene.remove(this.mask);

        activeView.value = this.previousView;
        this.previousView = '';
        unCaptureControls();
    }

    private stepOpacity(opacityStep: number) {
        const nextOpacity =
            opacityStep < 0
                ? Math.max(0, this.terrain.graphics.opacity + opacityStep)
                : Math.min(this.terrain.graphics.opacity + opacityStep, 1);
        this.terrain.graphics.opacity = nextOpacity;
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

    private laneUnitMap: Record<LaneKey, KeyedAnimationActor[]> = {
        'left-2': [],
        'left-1': [],
        mid: [],
        'right-1': [],
        'right-2': [],
    } as const satisfies Record<string, Actor[]>;
    public async placePlayer(player: PartyMember, lane: LaneKey) {
        const actor = new CompositeActor(player.appearance);
        const boundingBox = this.parent.cameraManager.getBoundingBox()!;
        const numInLane = useParty().partyState.value.party.filter(
            (p) => p.config.battlePosition === lane,
        ).length;
        const pos = this.scene.camera.pos.add(
            getPositionInLane(lane, { numInLane, idxInLane: this.laneUnitMap[lane].length }),
        );
        actor.pos = vec(boundingBox.left, boundingBox.top + boundingBox.height / 2);
        actor.z = this.terrain.z + 1;
        actor.scale = vec(-1, 1);
        this.laneUnitMap[lane].push(actor);
        this.parent.scene.add(actor);

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

    public async placeEnemy(e: KeyedAnimationActor, lane: LaneKey) {
        const boundingBox = this.parent.cameraManager.getBoundingBox()!;
        const numInLane = useBattle().battleState.value.enemies.filter(
            (p) => p.config.battlePosition === lane,
        ).length;
        const pos = this.scene.camera.pos.add(
            getPositionInLane(lane, { numInLane, idxInLane: this.laneUnitMap[lane].length }),
        );
        e.pos = vec(boundingBox.left, boundingBox.top + boundingBox.height / 2);
        e.z = this.terrain.z + 1;
        e.scale = vec(-1, 1);
        this.laneUnitMap[lane].push(e);
        this.parent.scene.add(e);

        return e.battleFieldEntry
            ? e.battleFieldEntry(pos).then(() => {
                  e.useAnimation('idle', { strategy: AnimationStrategy.Loop });
              })
            : e.actions
                  .moveTo({ pos, duration: 500, easing: EasingFunctions.EaseOutCubic })
                  .toPromise()
                  .then(() => {
                      e.useAnimation('idle', { strategy: AnimationStrategy.Loop });
                  });
    }

    public async placeEnemies() {
        const enemies = useBattle().battleState.value.enemies;
        for (const e of enemies) {
            await this.placeEnemy(e.actor, e.config.battlePosition ?? 'right-1');
        }
    }

    public startBattle() {}

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
