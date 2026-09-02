import { ref } from 'vue';

const isWeb = ref(false);
export function usePlatform() {
    return {
        isWeb,
    };
}
