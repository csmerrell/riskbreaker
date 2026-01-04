import { ActionContext, vec, Vector } from 'excalibur';
import { ActionLifecycle, StrategemAction, StrategemActionComponent } from '../StrategemAction';
import { TargetStrategyComponent } from './TargetStrategyComponent';

export type MovementArgs = {
    destination: Vector;
    speed: number;
    isReturn?: boolean;
};

type MovementConfig_ToTarget = {
    xOffset?: number;
    yOffset?: number;
};

type MovementConfig_UnitRelative = {
    temp?: string;
};

type MovementComponentType = 'toTarget' | 'toTargetsArea' | 'unitRelative';
export class MovementComponent<
    T extends MovementComponentType = 'toTarget',
> extends StrategemActionComponent {
    public sortPriority = 10;
    private movementsBefore: MovementArgs[] = [];
    private movementsDuring: MovementArgs[] = [];
    private movementsAfter: MovementArgs[] = [];
    private defaultSpeed = 500;
    private returnPos: Vector;
    private returnZIdx: number;

    constructor(
        private movementType: MovementComponentType = 'toTarget',
        private movementConfig: T extends 'toTarget' | 'toTargetsArea'
            ? MovementConfig_ToTarget
            : MovementConfig_UnitRelative = {},
    ) {
        super('Movement');
    }

    public clone() {
        const copy = new MovementComponent(this.movementType, this.movementConfig);
        this.hydrateClone(copy);
        return copy;
    }

    protected hydrateClone(copy: MovementComponent<T>) {
        super.hydrateClone(copy);
        copy.setMovementsAfter(this.movementsAfter);
        copy.setMovementsBefore(this.movementsBefore);
        copy.setMovementsDuring(this.movementsDuring);
    }

    public setParent(parent: StrategemAction) {
        super.setParent(parent);
        if (this.movementType === 'toTarget' && !parent.hasComponent(TargetStrategyComponent)) {
            throw new Error(
                '[toTarget] style movement components cannot be added to an action before adding a TargetStrategyComponent',
            );
        }
    }

    public isUnitRelativeMovement(config: unknown): config is MovementConfig_UnitRelative {
        return this.movementType === 'unitRelative';
    }

    public isTargetMovement(config: unknown): config is MovementConfig_ToTarget {
        return this.movementType !== 'unitRelative';
    }

    public setMovementsBefore(movements: MovementArgs[]) {
        this.movementsBefore = movements;
    }

    public setMovementsDuring(movements: MovementArgs[]) {
        this.movementsDuring = movements;
    }

    public setMovementsAfter(movements: MovementArgs[]) {
        this.movementsAfter = movements;
    }

    public move(lifecycle: ActionLifecycle) {
        if (lifecycle === 'before') {
            this.returnPos = vec(this.owner.pos.x, this.owner.pos.y);
            this.returnZIdx = this.owner.z;
        }
        if (this.isTargetMovement(this.movementConfig)) {
            return this.moveToTarget(lifecycle, this.movementConfig);
        } else if (this.isUnitRelativeMovement(this.movementConfig)) {
            return this.moveUnitRelative(lifecycle, this.movementConfig);
        }
    }

    private moveToTarget(lifecycle: ActionLifecycle, config: MovementConfig_ToTarget) {
        switch (lifecycle) {
            case 'before':
                return this.moveToTargetBefore(config);
            case 'during':
                return Promise.resolve();
            case 'after':
                return this.returnToStartPos(this.returnPos);
        }
    }

    private moveToTargetBefore(config: MovementConfig_ToTarget) {
        const targets = this.parent.getComponent(TargetStrategyComponent).getTargets();
        const center: Vector = targets.reduce(
            (acc, t) => {
                acc.x += t.pos.x;
                acc.y += t.pos.y;
                return acc;
            },
            vec(0, 0),
        );
        let zIdx = this.owner.z;
        targets.forEach((t) => {
            if (t.pos.y < this.owner.pos.y) {
                zIdx = (t.z ?? 0) + 1;
            }
        });
        center.x = center.x / targets.length + (config.xOffset ?? -20);
        center.y = center.y / targets.length + (config.yOffset ?? 0);

        this.owner.z = zIdx;
        return this.owner.actions
            .moveTo(center, this.movementsBefore[0]?.speed ?? this.defaultSpeed)
            .toPromise();
    }

    private returnToStartPos(pos: Vector) {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                this.owner.actions
                    .moveTo(pos, this.movementsAfter[0]?.speed ?? this.defaultSpeed)
                    .toPromise()
                    .then(() => {
                        this.owner.z = this.returnZIdx;
                        resolve();
                    });
            }, 200);
        });
    }

    private moveUnitRelative(lifecycle: ActionLifecycle, _config: MovementConfig_UnitRelative) {
        const promises: Promise<unknown>[] = [];

        if (lifecycle === 'before') {
            this.returnPos = vec(this.owner.pos.x, this.owner.pos.y);
        }

        const movements =
            lifecycle === 'before'
                ? this.movementsBefore
                : lifecycle === 'during'
                  ? this.movementsDuring
                  : this.movementsAfter.length > 0
                    ? this.movementsAfter
                    : [{ destination: this.returnPos, speed: this.defaultSpeed, isReturn: true }];

        let actionCtx: ActionContext;
        while (movements.length > 0) {
            const next = movements.shift();
            const fn = next.isReturn ? this.owner.actions.moveTo : this.owner.actions.moveBy;
            actionCtx = fn(next.destination, next.speed);
        }
        promises.push(actionCtx.toPromise());

        return Promise.all(promises);
    }

    public beforeExecute(): Promise<unknown> {
        return this.move('before');
    }

    public onExecute(): Promise<unknown> {
        return this.move('during');
    }

    public afterExecuted(): Promise<unknown> {
        return this.move('after');
    }
}
