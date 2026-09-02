import { Observable } from './Observable';

const signals: Record<string, Observable<unknown>> = {};

function subscribeTo(key: string) {
    if (!signals[key]) {
        signals[key] = new Observable();
    }
}

function unsubscribeFrom(key: string, id: string) {
    if (!signals[key]) {
        return;
    }

    signals[key].unsubscribe(id);
    if (signals[key].numSubscribers() === 0) {
        delete signals[key];
    }
}

function emit(key: string, value: unknown = null) {
    if (signals[key]) {
        signals[key].set(value);
    } else {
        signals[key] = new Observable(value);
    }
}

export function useSignals() {
    return {
        emit,
        unsubscribeFrom,
        subscribeTo,
    };
}
