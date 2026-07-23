import { useParty } from '@/state/useParty';
import { computed, ref } from 'vue';

const selectedMemberIdx = ref(0);
const selectedMember = computed(() => {
    return useParty().getParty()[selectedMemberIdx.value];
});
function changeSelectedMember(direction: 'left' | 'right') {
    let idx = selectedMemberIdx.value;
    switch (direction) {
        case 'left':
            idx -= 1;
            if (idx < 0) idx = useParty().getParty().length - 1;
            selectedMemberIdx.value = idx;
            break;
        case 'right':
        default:
            idx += 1;
            if (idx >= useParty().getParty().length) idx = 0;
            selectedMemberIdx.value = idx;
            break;
    }
}
export function usePartyMenu() {
    return {
        selectedMember,
        changeSelectedMember,
    };
}
