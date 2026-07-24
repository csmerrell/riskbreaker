import { CompositeActorConfig } from '@/game/actors/CompositeActor/CompositeActor';
import { PartyMember, useParty } from '@/state/useParty';
import { ref, watch } from 'vue';

const selectedMemberIdx = ref(0);
const selectedMember = ref<PartyMember>({} as PartyMember);
watch(selectedMemberIdx, () => {
    selectedMember.value = useParty().getParty()[selectedMemberIdx.value];
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

function changeMemberAppearance<T extends keyof CompositeActorConfig>(
    layerKey: T,
    valueKey: 'inherit' | CompositeActorConfig[T],
) {
    selectedMember.value = {
        ...selectedMember.value,
        appearance: {
            ...selectedMember.value.appearance,
            [layerKey]: valueKey?.match(/inherit|hide/) ? undefined : valueKey,
        },
    };
    useParty().updatePartyMember(selectedMember.value as PartyMember);
}

export function usePartyMenu() {
    selectedMember.value = useParty().getParty()[selectedMemberIdx.value];
    return {
        selectedMember,
        changeSelectedMember,
        changeMemberAppearance,
    };
}
