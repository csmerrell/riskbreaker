import {
    captureControls,
    registerInputListener,
    unCaptureControls,
    unregisterInputListener,
} from '@/game/input/useInput';
import { ref, Ref, watch } from 'vue';

export const useMenuEdit = (focused: Ref<boolean>) => {
    let confirmListener: string | null = null;
    function registerConfirmListener() {
        if (focused.value && !confirmListener) {
            confirmListener = registerInputListener(() => {
                startEdit();
            }, 'confirm');
        } else if (confirmListener) {
            unregisterInputListener(confirmListener);
            confirmListener = null;
        }
    }
    registerConfirmListener();
    watch(focused, registerConfirmListener);

    let cleanupCbs: (() => void)[] = [];
    function addCleanupCb(cb: () => void) {
        cleanupCbs.push(cb);
    }

    const editing = ref(false);
    function startEdit() {
        captureControls('menuEdit');
        editing.value = true;
        const listeners: string[] = [
            registerInputListener(() => {
                listeners.forEach((l) => unregisterInputListener(l));
                editing.value = false;
                cleanupCbs.forEach((cb) => cb());
                cleanupCbs = [];
                unCaptureControls();
            }, 'cancel'),
        ];
    }

    return {
        editing,
        addCleanupCb,
    };
};
