import {
    AnimatedProjectile,
    isAnimatedProjectileAction,
    ProjectileAction,
} from '@/db/actions/Action';
import { StrategemActionComponent } from '../StrategemAction';
import type { IBattleActor } from '@/game/actors/IBattleActor';
import {
    Actor,
    Animation,
    AnimationStrategy,
    Graphic,
    ImageSource,
    SpriteSheet,
    vec,
    Vector,
} from 'excalibur';
import { frameRange } from '@/lib/helpers/number.helper';
import { useClock } from '@/state/useClock';
import { TargetStrategyComponent } from './TargetStrategyComponent';
import { useGameContext } from '@/state/useGameContext';
import {
    isInternalAnimation,
    isExternalAnimation,
    isSourceMappedSpriteSheet,
    InternalSheetAnimation,
} from '@/db/types';

export class ProjectileComponent extends StrategemActionComponent {
    private graphic: Graphic;

    constructor(private definition: ProjectileAction) {
        super('Projectile');
        this.initExternalAnimation();
    }

    public clone() {
        const copy = new ProjectileComponent(this.definition);
        this.hydrateClone(copy);
        return copy;
    }

    protected hydrateClone(copy: ProjectileComponent) {
        super.hydrateClone(copy);
    }

    public setOwner(owner: IBattleActor) {
        super.setOwner(owner);
        if (isAnimatedProjectileAction(this.definition)) {
            if (isInternalAnimation(this.definition.projectileAnimation)) {
                // buildAnimationFromDef goes through IBattleActor — sheet is private
                const { clockSpeed } = useClock();
                this.graphic = owner.buildAnimationFromDef(
                    this.definition.projectileAnimation as InternalSheetAnimation,
                    AnimationStrategy.End,
                );
            }
        }
    }

    public initExternalAnimation() {
        if (
            isAnimatedProjectileAction(this.definition) &&
            isExternalAnimation(this.definition.projectileAnimation)
        ) {
            const { sheet, anim } = this.definition.projectileAnimation;
            if (isSourceMappedSpriteSheet(sheet)) {
                const spriteSheet = SpriteSheet.fromImageSource({
                    image: sheet.source as ImageSource,
                    grid: {
                        spriteHeight: sheet.cellHeight,
                        spriteWidth: sheet.cellWidth,
                        columns: sheet.numCols,
                        rows: sheet.numRows,
                    },
                });

                const { clockSpeed } = useClock();
                const { clockMs } = clockSpeed;
                this.graphic = Animation.fromSpriteSheet(
                    spriteSheet,
                    frameRange(sheet.numCols, anim),
                    clockMs.value * anim.frameDuration,
                    AnimationStrategy.End,
                );
            } else {
                throw new Error(
                    `Projectile animation was not sourcemapped correctly in ProjectileComponent.`,
                );
            }
        }
    }

    public getGraphic() {
        return this.graphic;
    }

    public async executeProjectile() {
        const targets = this.parent.getComponent(TargetStrategyComponent)?.getTargets() ?? [];
        if (!this.graphic || targets.length === 0) return;

        const centroid = targets.reduce(
            (acc: Vector, t) => {
                // Targets expose actorId etc. but not pos — projectile target position
                // must be resolved by the host game. This default uses Vector.Zero as fallback.
                // Host games should override executeProjectile or provide target position via
                // a game-specific mechanism.
                return acc;
            },
            vec(0, 0),
        );

        const { game } = useGameContext();
        const projectileActor = new Actor({ pos: centroid });
        const animCopy =
            this.graphic instanceof Animation ? this.graphic.clone() : this.graphic;

        return new Promise<void>((resolve) => {
            projectileActor.graphics.use(animCopy);
            if (animCopy instanceof Animation) {
                animCopy.events.on('end', () => {
                    projectileActor.kill();
                    resolve();
                });
            } else {
                resolve();
            }
            game.value.currentScene.add(projectileActor);
        });
    }
}
