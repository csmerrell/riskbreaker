import { PartyMenuTab } from '@/state/useExploration';
import { Vector } from 'excalibur';
import { Ref, ref } from 'vue';

type NightSkyPositioning = {
    anchor?: Vector;
    moon?: [number, number];
    stars?: [number, number, string][];
    peopleAnchor?: Vector;
};
const positions: Ref<Record<PartyMenuTab, NightSkyPositioning>> = ref({
    loadout: {},
    skill: {},
    inventory: {},
});

function setPositioning(tab: PartyMenuTab, value: NightSkyPositioning) {
    positions.value = {
        ...positions.value,
        [tab]: value,
    };
}
export function useNightSky() {
    return {
        positions,
        setPositioning,
    };
}
