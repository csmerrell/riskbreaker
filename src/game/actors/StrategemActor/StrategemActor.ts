//core
import { Actor, Animation, AnimationStrategy, Engine, SpriteSheet, vec } from 'excalibur';
import { UnitClassKey } from '@/db/units/BattleUnit';

//components
import { ActorComponent, isActorComponent } from './components/Component';
import { Animator } from './components/Animator';
import { Idler } from './components/Idler';
import { DeathComponent } from './components/DeathComponent';
import { TargetedComponent } from './components/TargetedComponent';
import { HealthComponent } from './components/HealthComponent';
import { SpeedComponent } from './components/SpeedComponent';
import { HurtComponent } from './components/HurtComponent';

//strategems / actions
import { Strategem } from '@/game/strategems/Strategem';
import { useActionBus } from '@/state/deprecated/useActionBus';

//state
import { useClock } from '@/state/deprecated/useClock';

//lib
import { frameRange } from '@/lib/helpers/number.helper';

//ui
import {
    SpriteSheetSourcedUnitDefinition,
    useBattleParty,
} from '@/state/deprecated/useBattleParty';
import { UnitState } from '@/state/saveState';
import { HealedComponent } from './components/HealedComponent';
import { ForecastComponent } from './components/ForecastComponent';
import { StrategemAction } from '@/game/actions/StrategemAction';
import { HexTile } from '../Arena/HexTile';
import { makeState } from '@/state/Observable';
import { nanoid } from 'nanoid';
import { HotbarSet, useCrossHotbar } from '@/ui/views/BattleScreen/state/useCrossHotbar';
import { ArcLine } from '../ArcLine.actor';
import { TargetStrategyComponent } from '@/game/actions/components/TargetStrategyComponent';
import { useGameContext } from '@/state/useGameContext';

export class StrategemActor extends Actor {
    static posOffset = { x: 2, y: 6 };
    private targetedBehaviors: TargetedComponent[] = [];
    private hotbar: HotbarSet;
    private arcLine: ArcLine;

    public actorId: string = '';
    public isActing: boolean = false;
    public isChanneling: boolean = false;
    public isHealLocked: boolean = false;
    public isHurtLocked: boolean = false;
    public strategems: Strategem[] = [];
    public sheet: SpriteSheet;
    public hex: HexTile;
    public initialized = makeState<boolean>(false);

    constructor(
        public name: UnitClassKey,
        public unitDef: SpriteSheetSourcedUnitDefinition,
        public state: UnitState,
        public alignment: 'party' | 'enemy',
    ) {
        super();
        this.actorId = nanoid(16);
        this.sheet = SpriteSheet.fromImageSource({
            image: unitDef.spriteSheet.source,
            grid: {
                spriteHeight: unitDef.spriteSheet.cellHeight,
                spriteWidth: unitDef.spriteSheet.cellWidth,
                columns: unitDef.spriteSheet.numCols,
                rows: unitDef.spriteSheet.numRows,
            },
        });
        this.graphics.flipHorizontal = unitDef.spriteSheet.flipHorizontal ?? false;
        this.hotbar = this.alignment === 'party' ? state.hotbar : null;

        this.addStatComponents();
    }

    public getComponent<T extends ActorComponent>(component: new (...args: unknown[]) => T): T {
        return this.components.get(component) as T;
    }

    //initialize
    onInitialize(_engine: Engine): void {
        this.addComponent(new Animator());
        this.addComponent(new Idler());
        this.addEquipComponents();
        this.addSkillComponents();
        this.addHealthComponents();
        this.addStrategems();
        this.initialized.set(true);
    }

    private addStatComponents() {
        const speedComponent = new SpeedComponent(this.unitDef.speed.chargePerTick);
        this.addComponent(speedComponent);
    }

    private addEquipComponents() {}

    private addSkillComponents() {}

    private addHealthComponents() {
        const { numCols } = this.unitDef.spriteSheet;
        const { clockMs } = useClock().clockSpeed;
        this.addComponent(new HealthComponent(this.unitDef.health.base));
        this.addComponent(
            new HurtComponent({
                animationIn: Animation.fromSpriteSheet(
                    this.sheet,
                    frameRange(numCols, this.unitDef.hurt.in),
                    clockMs.value * this.unitDef.hurt.in.frameDuration,
                    AnimationStrategy.Freeze,
                ),
                animationOut: Animation.fromSpriteSheet(
                    this.sheet,
                    frameRange(numCols, this.unitDef.hurt.out),
                    clockMs.value * this.unitDef.hurt.out.frameDuration,
                    AnimationStrategy.Freeze,
                ),
            }),
        );
        this.addComponent(
            new HealedComponent({
                animationIn: Animation.fromSpriteSheet(
                    this.sheet,
                    frameRange(numCols, this.unitDef.healed.in),
                    clockMs.value * this.unitDef.healed.in.frameDuration,
                    AnimationStrategy.Freeze,
                ),
                animationOut: Animation.fromSpriteSheet(
                    this.sheet,
                    frameRange(numCols, this.unitDef.healed.out),
                    clockMs.value * this.unitDef.healed.out.frameDuration,
                    AnimationStrategy.Freeze,
                ),
            }),
        );
        this.addComponent(
            new DeathComponent(
                Animation.fromSpriteSheet(
                    this.sheet,
                    frameRange(numCols, this.unitDef.death),
                    clockMs.value * this.unitDef.death.frameDuration,
                    AnimationStrategy.Freeze,
                ),
            ),
        );
        this.addComponent(new ForecastComponent());
    }

    private addStrategems() {
        this.state.strategems.get().forEach((sDef) => {
            this.strategems.push(new Strategem(this, sDef));
        });
    }

    public getTargetedBehaviors() {
        return this.targetedBehaviors;
    }

    private isTargetLocked() {
        return this.isHealLocked || this.isHurtLocked;
    }

    //action
    public canAct() {
        return !(this.isDead() || this.isActing || this.isTargetLocked());
    }

    public act() {
        const { isActionQueued, queueAction } = useActionBus();
        if (this.isActing || this.isDead() || isActionQueued(this)) return;

        const { tick } = useClock();
        const activationTime = tick.value - this.getComponent(SpeedComponent).chargePerTick();

        queueAction(this, activationTime);
    }

    public actionFinished(action: StrategemAction) {
        this.getComponent(SpeedComponent)?.resetCt(action);
    }

    public getHotbar() {
        return this.hotbar;
    }

    public async promptAction() {
        const { setHotbar } = useCrossHotbar();
        const { activeActor, lockMenuToActiveActor } = useBattleParty();
        activeActor.value = this;
        lockMenuToActiveActor.value = true;
        if (this.hotbar) {
            setHotbar(this.hotbar);
            await this.hotbar.actionSelected
                .then((action) => {
                    console.log(action.name);
                    this.killIntentPulse();
                })
                .catch(() => {
                    console.log('Action aborted');
                })
                .finally(() => {
                    this.hotbar.resetSelection();
                });
        } else {
            const { promise, resolve } = Promise.withResolvers<void>();
            registerInputListener(() => {
                resolve();
            }, 'confirm');
            await promise;
        }
    }

    //intent
    public getIntent(): Strategem {
        if (this.isDead()) return;

        for (const s of this.strategems) {
            if (s.checkActivation()) {
                return s;
            }
        }
    }

    public async pulseIntent() {
        if (this.arcLine || this.isActing) {
            return;
        }

        const target = this.getIntent()
            .action.getComponent(TargetStrategyComponent)
            .getTargets()[0];
        const arcLine = new ArcLine(this.pos, target.pos);
        const { game } = useGameContext();
        game.value.currentScene.add(arcLine);
        return arcLine.arcComplete.then(() => {
            delete this.arcLine;
        });
    }

    public killIntentPulse() {
        if (this.arcLine) {
            this.arcLine.kill();
        }
        delete this.arcLine;
    }

    //death
    public willBeDead() {
        return this.getComponent(HealthComponent)?.forecastedHealth === 0;
    }

    public isDead() {
        return this.getComponent(HealthComponent)?.currentHealth.value === 0;
    }

    public kill() {
        super.kill();
        this.components.forEach((comp) => {
            if (isActorComponent(comp)) {
                comp.cancelClockObservers();
            }
        });
        this.getComponent(SpeedComponent).cancelClockObservers();
    }
}

export function isStrategemActor(a: Actor): a is StrategemActor {
    return a instanceof StrategemActor;
}
