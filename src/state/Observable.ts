import { random } from 'nanoid';
export function makeState<T>(val?: T) {
    return new Observable<T>(val);
}

export class Observable<T> {
    public value: T;
    private subscribers: Record<string, (newVal?: T, oldVal?: T) => void> = {};
    private oneTimeSubscribers: Record<string, (newVal?: T, oldVal?: T) => void> = {};

    constructor(val?: T) {
        this.value = val ?? undefined;
    }

    public set(val: T) {
        const oldVal = this.value;
        this.value = val;

        if (
            Object.keys(this.subscribers).length === 0 &&
            Object.keys(this.oneTimeSubscribers).length === 0
        )
            return;

        if (typeof val === 'object') {
            try {
                if (oldVal ? JSON.stringify(oldVal) : undefined === JSON.stringify(val)) return;
            } catch (_e) {
                // do nothing
            }
        } else {
            if (oldVal === val) return;
        }

        Object.entries(this.subscribers).forEach(([key, subscriberCb]) => {
            try {
                subscriberCb(val, oldVal);
            } catch (e) {
                console.error(e.message);
                delete this.subscribers[key];
            }
        });

        Object.entries(this.oneTimeSubscribers).forEach(([key, subscriberCb]) => {
            try {
                subscriberCb(val, oldVal);
            } catch (e) {
                console.error(e.message);
                delete this.oneTimeSubscribers[key];
            }
        });
    }

    public subscribe(cb: (newVal?: T, oldVal?: T) => void) {
        const id = random(16).join('');
        this.subscribers[id] = cb;
        return id;
    }

    public once(cb: (newVal?: T, oldVal?: T) => void) {
        const id = random(16).join('');
        const pr = new Promise<void>((resolve) => {
            this.oneTimeSubscribers[id] = (newVal?: T, oldVal?: T) => {
                cb(newVal, oldVal);
                delete this.oneTimeSubscribers[id];
                resolve();
            };
        });
        return pr;
    }

    public unsubscribe(id: string) {
        delete this.subscribers[id];
    }

    public numSubscribers() {
        return Object.keys(this.subscribers).length;
    }
}
