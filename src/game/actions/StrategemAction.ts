import { ComponentConstructor } from '@/lib/types/ClassHelper';
import type { IBattleActor } from '@/game/actors/IBattleActor';
import { nanoid } from 'nanoid';

export type ActionLifecycle = 'before' | 'during' | 'after';

// Base class for all action components.
// owner is typed to IBattleActor — action components interact with actors only through
// the interface, never through StrategemActor internals directly.
export class StrategemActionComponent {
    protected owner: IBattleActor;
    protected parent: StrategemAction;
    public id: string;
    public sortPriority = 100;

    constructor(public name: string) {
        this.id = nanoid(16);
    }

    public getCopy() {
        const copy = new StrategemActionComponent(this.name);
        this.hydrateClone(copy);
        return copy;
    }

    protected hydrateClone(copy: StrategemActionComponent) {
        copy.id = this.id;
        copy.setParent(this.parent);
        copy.setOwner(this.owner);
        copy.sortPriority = this.sortPriority;
    }

    public setParent(parent: StrategemAction) {
        this.parent = parent;
    }

    public setOwner(owner: IBattleActor) {
        this.owner = owner;
    }

    public async beforeExecute(): Promise<unknown> {
        return Promise.resolve();
    }

    public async onExecute(): Promise<unknown> {
        return Promise.resolve();
    }

    public async afterExecuted(): Promise<unknown> {
        return Promise.resolve();
    }

    public prepare() {}
    public cleanup() {}
}

export type StrategemActionConfig = Pick<
    StrategemAction,
    'owner' | 'components' | 'ctCost' | 'name'
>;

export class StrategemAction {
    public owner: IBattleActor;
    public components: Record<string, StrategemActionComponent>;
    public isExecuting: boolean = false;
    public ctCost: number;
    public id: string;
    public name: string;

    private sortedComponents: StrategemActionComponent[] = [];

    constructor(actionConfig: Pick<StrategemAction, 'owner'> & Partial<StrategemActionConfig>) {
        this.owner = actionConfig.owner;
        this.components = actionConfig.components ?? {};
        this.ctCost = actionConfig.ctCost ?? 100;
        this.name = actionConfig.name ?? 'Unnamed Action';
        this.id = nanoid(16);
    }

    public getComponent<T>(component: ComponentConstructor<T> | undefined) {
        return (this.components[component.name] as T) ?? undefined;
    }

    public getComponentByName<T>(name: string): T | undefined {
        return (this.components[name] as T) ?? undefined;
    }

    public hasComponent(keyOpt: string | ComponentConstructor) {
        if (typeof keyOpt === 'string') {
            return this.components[keyOpt] !== undefined;
        } else {
            return this.getComponent(keyOpt) !== undefined;
        }
    }

    public addComponent(component: StrategemActionComponent) {
        component.setOwner(this.owner);
        component.setParent(this);
        this.components[component.constructor.name] = component;
        this.sortComponents();
    }

    public addComponentList(components: StrategemActionComponent[]) {
        components.forEach((component) => {
            this.addComponent(component);
        });
    }

    private sortComponents() {
        this.sortedComponents = [
            ...Object.values(this.components).sort((a, b) => {
                return a.sortPriority - b.sortPriority;
            }),
        ];
    }

    public async execute(arcLineComplete: Promise<void>) {
        this.owner.beginAction();
        this.sortedComponents.forEach((component) => {
            component.prepare();
        });
        await arcLineComplete;
        await this.executeLifecycle('before');
        await this.executeLifecycle('during');
        return this.executeLifecycle('after').finally(() => {
            // endAction on the actor: resets isActing, switches to idle, resets CT
            this.owner.endAction(this);
            Object.values(this.components).forEach((component) => {
                component.cleanup();
            });
        });
    }

    public async executeLifecycle(lifecycle: 'before' | 'during' | 'after') {
        const promises: Promise<unknown>[] = [];
        Object.values(this.sortedComponents).forEach((component) => {
            promises.push(
                lifecycle === 'before'
                    ? component.beforeExecute()
                    : lifecycle === 'during'
                      ? component.onExecute()
                      : component.afterExecuted(),
            );
        });

        return Promise.all(promises);
    }
}

export function isAction(obj: unknown): obj is StrategemAction {
    return obj instanceof StrategemAction;
}
