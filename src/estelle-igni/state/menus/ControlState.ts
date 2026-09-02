import { InputMap, MappedCommand } from '@/game/input/InputMap';
import {
    InputListenerOptions,
    registerHoldListener,
    registerInputListener,
    registerWildcardListener,
    unregisterInputListener,
} from '@/game/input/useInput';

export type ControlStatePressListener = {
    command: MappedCommand;
    listener: () => boolean | undefined;
    opts?: InputListenerOptions;
};
export type ControlStateHoldListener = {
    listener: (commands: InputMap) => boolean | undefined;
    opts?: InputListenerOptions;
};
export type ControlStateWildcardListener = ControlStateHoldListener;

export class ControlState {
    private listenerIds: string[] = [];
    protected pressListeners: Partial<Record<MappedCommand, ControlStatePressListener>> = {};
    protected holdListeners: ControlStateHoldListener[] = [];
    protected wildcardListeners: ControlStateWildcardListener[] = [];
    protected suspendedCommands: MappedCommand[] = [];
    protected suspendAll: boolean = false;

    constructor() {}

    public pushSuspendListener(command: MappedCommand, immediate: boolean = true) {
        if (immediate) {
            const id = registerInputListener(() => true, command);
            this.listenerIds.push(id);
            return id;
        } else {
            this.suspendedCommands.push(command);
            return -1;
        }
    }

    public pushPressListener(
        ...[listener, command, opts]: Parameters<typeof registerInputListener>
    ) {
        const id = registerInputListener(listener, command, opts);
        this.listenerIds.push(id);
        return id;
    }

    public pushHoldListener(...[listener, opts]: Parameters<typeof registerHoldListener>) {
        const id = registerHoldListener(listener, opts);
        this.listenerIds.push(id);
        return id;
    }

    public pushWildcardListener(...[listener, opts]: Parameters<typeof registerWildcardListener>) {
        const id = registerWildcardListener(listener, opts);
        this.listenerIds.push(id);
        return id;
    }

    public activate() {
        if (this.suspendAll) {
            InputMap.allCommands().forEach((command) => {
                this.listenerIds.push(registerInputListener(() => true, command));
            });
        } else {
            this.suspendedCommands.forEach((command) => {
                this.listenerIds.push(registerInputListener(() => true, command));
            });
        }

        Object.entries(this.pressListeners).forEach(
            ([command, listenerDef]: [MappedCommand, ControlStatePressListener]) => {
                const { listener, opts } = listenerDef;
                this.listenerIds.push(registerInputListener(listener, command, opts));
            },
        );

        this.holdListeners.forEach((listenerDef) => {
            const { listener, opts } = listenerDef;
            this.listenerIds.push(registerHoldListener(listener, opts));
        });

        this.wildcardListeners.forEach((listenerDef) => {
            const { listener, opts } = listenerDef;
            this.listenerIds.push(registerWildcardListener(listener, opts));
        });
    }

    public deactivate() {
        this.listenerIds.forEach((id) => {
            unregisterInputListener(id);
        });
    }
}

export class ControlStateMachine {
    private states: ControlState[] = [];
    constructor() {}

    public pushState(state: ControlState) {
        this.states[this.states.length - 1].deactivate();
        this.states.push(state);
        state.activate();
    }

    public popState() {
        const state = this.states.pop();
        state.deactivate();
        this.states[this.states.length - 1].activate();
    }
}
