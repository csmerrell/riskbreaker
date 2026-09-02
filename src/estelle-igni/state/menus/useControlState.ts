import { ControlState } from './ControlState';

const controlStack: ControlState[] = [];
export function useControlState() {
    return {
        pushControlState: (state: ControlState) => {
            controlStack.push(state);
            state.activate();
        },
        popControlState: (state: ControlState) => {
            state.deactivate();
            controlStack.unshift(state);
        },
    };
}
