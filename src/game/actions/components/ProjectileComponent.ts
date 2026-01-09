import {
    AnimatedProjectile,
    isAnimatedProjectileAction,
    ProjectileAction,
} from '@/db/actions/Action';
import { StrategemActionComponent } from '../StrategemAction';
import { StrategemActor } from '@/game/actors/StrategemActor/StrategemActor';
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
import { useClock } from '@/state/deprecated/useClock';
import { TargetStrategyComponent } from './TargetStrategyComponent';
import { Animator } from '@/game/actors/StrategemActor/components/Animator';
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

    public setOwner(owner: StrategemActor) {
        super.setOwner(owner);
        if (isAnimatedProjectileAction(this.definition)) {
            const { numCols } = owner.unitDef.spriteSheet;
            if (isInternalAnimation(this.definition.projectileAnimation)) {
                const { clockSpeed } = useClock();
                const { clockMs } = clockSpeed;
                this.graphic = Animation.fromSpriteSheet(
                    owner.sheet,
                    frameRange(numCols, this.definition.projectileAnimation),
                    clockMs.value * this.definition.projectileAnimation.frameDuration,
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
                    `Projectile animation [${this.definition.projectileAnimation}] was not sourcemapped correctly in ProjectileComponent.`,
                );
            }
        }
    }

    public getGraphic() {
        return this.graphic;
    }

    public async executeProjectile() {
        const targets = this.parent.getComponent(TargetStrategyComponent).getTargets();
        const middle = targets.reduce(
            (acc: Vector, target) => {
                acc.x += target.pos.x;
                acc.y += target.pos.y;
                return acc;
            },
            vec(0, 0),
        );
        middle.scale(1 / targets.length);
        if (isAnimatedProjectileAction(this.definition)) {
            const actor = new Actor();
            actor.pos = middle;
            const animator = new Animator();
            actor.addComponent(animator);
            const { game } = useGameContext();
            await game.value.currentScene.add(actor);
            return animator.useAnimation(this.graphic, 'none').then(() => {
                actor.kill();
            });
        } else {
            //TODO - static projectiles
            return Promise.resolve();
        }
    }
}
