import 'excalibur';
import { Actor, Scene } from 'excalibur';

const readyState = Symbol('readyState');
declare module 'excalibur' {
    interface Actor {
        ready: () => Promise<void>;
        //Treat as "protected". Only implementing classes use it.
        _setReady: () => void;
        [readyState]: ReadyState;
    }
}

type ReadyState = {
    promise: Promise<void>;
    resolve: () => void;
    settled: boolean;
};

function ensure(actor: Actor): ReadyState {
    let state = actor[readyState] as ReadyState | undefined;

    if (!state) {
        let resolve!: () => void;

        const promise = new Promise<void>((res) => {
            resolve = res;
        });

        state = { promise, resolve, settled: false };
        actor[readyState] = state;
    }

    return state;
}

Actor.prototype.ready = function (): Promise<void> {
    return ensure(this).promise;
};

Actor.prototype._setReady = function (): void {
    const state = ensure(this);

    if (!state.settled) {
        state.settled = true;
        state.resolve();
    }
};
