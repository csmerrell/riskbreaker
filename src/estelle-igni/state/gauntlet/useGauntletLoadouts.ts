import { computed, ref } from 'vue';

import { astrologianLoadout } from './loadouts/astrologian';
import { riskbreakerLoadout } from './loadouts/riskbreaker';

const loadouts = [riskbreakerLoadout, astrologianLoadout];

const p0SelectedLoadout = ref<number>(0);
const p1SelectedLoadout = ref<number>(1);

const p0Loadout = computed(() => loadouts[p0SelectedLoadout.value]);
const p1Loadout = computed(() => loadouts[p1SelectedLoadout.value]);

export function useGauntletLoadouts() {
    return {
        p0Loadout,
        p1Loadout,
    };
}
