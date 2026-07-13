<script setup lang="ts">
import { computed, CSSProperties } from 'vue';
import HotbarSet from './HotbarSet.vue';
import { resources } from '@/resource';
import { PartyMember } from '@/state/useParty';
import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';

type Props = {
    unit: PartyMember;
    actor: CompositeActor;
    styles: CSSProperties;
};

const { unit, styles } = defineProps<Props>();

if (!resources.image.icons.skills.isLoaded()) {
    resources.image.icons.skills.load();
}

const computedStyles = computed(() => {
    const { left, right, ...rest } = styles;
    return {
        ...rest,
    };
});

defineOptions({ inheritAttrs: false });
</script>

<template>
    <div
        class="cross-hotbar left-[4.5rem] flex -translate-y-full flex-row items-end justify-end gap-4 self-center rounded-lg p-4"
        :style="computedStyles"
    >
        <HotbarSet
            icon-type="skill"
            gate-button="shoulder_right"
            captures-controls
            :actions="unit.equippedAbilities"
        />
    </div>
</template>
