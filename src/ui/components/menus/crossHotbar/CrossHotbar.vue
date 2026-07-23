<script setup lang="ts">
import { computed, CSSProperties } from 'vue';
import HotbarSet from './HotbarSet.vue';
import { PartyMember } from '@/state/useParty';
import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';

type Props = {
    unit: PartyMember;
    actor: CompositeActor;
    styles: CSSProperties;
};

const { unit, styles } = defineProps<Props>();

defineOptions({ inheritAttrs: false });
</script>

<template>
    <div
        class="cross-hotbar flex -translate-x-1/2 -translate-y-full flex-row items-end justify-end gap-4 self-center rounded-lg p-4"
        :style="styles"
    >
        <HotbarSet
            icon-type="skill"
            gate-button="shoulder_right"
            captures-controls
            scale-anchor="center"
            :actions="unit.equippedAbilities"
        />
    </div>
</template>
