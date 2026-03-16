<script setup lang="ts">
import { computed, CSSProperties, onUnmounted, ref } from 'vue';
import HotbarSet from './HotbarSet.vue';
import { resources } from '@/resource';
import { registerHoldListener, unregisterInputListener } from '@/game/input/useInput';
import { PartyMember } from '@/state/useParty';
import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';

type Props = {
    unit: PartyMember;
    actor: CompositeActor;
    styles: CSSProperties;
};

const { unit, styles } = defineProps<Props>();

const ready = ref(false);
const focusLeft = ref(false);
const focusRight = ref(false);
const listeners: string[] = [];
if (resources.image.icons.skills.isLoaded()) {
    ready.value = true;
    registerListeners();
} else {
    resources.image.icons.skills.load().then(() => {
        ready.value = true;
        registerListeners();
    });
}

function registerListeners() {
    listeners.push(
        registerHoldListener((inputs) => {
            if (inputs.shoulder_right && !focusLeft.value) {
                focusRight.value = true;
            } else if (inputs.shoulder_left && !focusRight.value) {
                focusLeft.value = true;
            } else {
                focusLeft.value = false;
                focusRight.value = false;
            }
        }),
    );
}

const el = ref<HTMLElement>();
defineOptions({ inheritAttrs: false });
const computedStyles = computed(() => {
    const { left, right, ...rest } = styles;
    return {
        ...rest,
    };
});

onUnmounted(() => {
    listeners.forEach((l) => unregisterInputListener(l));
});
</script>

<template>
    <div
        v-if="ready"
        ref="el"
        class="cross-hotbar left-[4.5rem] flex -translate-y-full flex-row items-end justify-end gap-4 self-center rounded-lg p-4"
        :style="computedStyles"
    >
        <HotbarSet
            side="left"
            :focused="focusLeft"
            :unit
            :class="focusRight ? 'text-[.75em]' : ''"
        />
        <div class="h-16 border-l border-bg-alt" />
        <HotbarSet
            side="right"
            :focused="focusRight"
            :unit
            :class="focusLeft ? 'text-[.75em]' : ''"
        />
    </div>
</template>
