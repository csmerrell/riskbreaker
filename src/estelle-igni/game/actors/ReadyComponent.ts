import { Component } from 'excalibur';

export class ReadyComponent extends Component {
    public resolve!: (key: string) => void;
    private resolved = false;
    private isReady: Promise<void>;
    private deps: Record<string, boolean> = {};

    constructor() {
        super();

        this.isReady = new Promise<void>((resolve) => {
            this.resolve = (key: string) => {
                this.deps[key] = true;
                setTimeout(() => {
                    if (!this.resolved && !Object.values(this.deps).find((k) => k === false)) {
                        resolve();
                        this.resolved = true;
                    }
                }, 0);
            };
        });

        setTimeout(() => {
            if (!this.resolved && Object.keys(this.deps).length === 0) {
                console.warn(
                    `A ReadyComponent was added to [Actor: ${this.owner!.name}], but no dependencies were ever registered.\n
                    \n
                    If zero-dependency async ready is desired, call: \n
                    \towner.get(ReadyComponent).registerDependency('someKey') \n
                    and resolve it with: \n
                    \tsetTimeout(() => { owner.get(ReadyComponent).resolve('someKey')}, 0) ]`,
                );
                this.resolve('root');
            }
        }, 25);
    }

    public registerDependency(key: string) {
        if (this.resolved) {
            console.warn(
                `Dependency [${key}] was registered to [Actor: ${this.owner!.name}] after it already resolved.\n
                \n
                All ready dependencies must be registered in the same synchronous thread where the component was created, otherwise premature resolution can occur.`,
            );
        }
        this.deps[key] = false;
    }

    public ready() {
        return this.isReady;
    }
}
