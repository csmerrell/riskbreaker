<script setup lang="ts">
import { fashionLabels } from '@/resource/image/units';
import { useSelectedCharacter } from './useSelectedCharacter';
import { computed } from 'vue';
import ControlIconSprite from '@/ui/components/ControlIconSprite.vue';

type Props = {
    focused?: boolean;
};

const { focused = false } = defineProps<Props>();

const { selectedMember } = useSelectedCharacter();
const hatLabel = computed(() => {
    if (selectedMember.value.appearance.hat) {
        return fashionLabels.hat[selectedMember.value.appearance.hat];
    } else {
        return '[None - Show Equipped]';
    }
});
const hairLabel = computed(() => {
    if (selectedMember.value.appearance.hair) {
        return fashionLabels.hair[selectedMember.value.appearance.hair];
    } else {
        return '[None - Show Equipped]';
    }
});
const armorLabel = computed(() => {
    if (selectedMember.value.appearance.armor) {
        return fashionLabels.armor[selectedMember.value.appearance.armor];
    } else {
        return '[None - Show Equipped]';
    }
});
</script>

<template>
    <div class="flex grow flex-col gap-2 px-4 text-black">
        <div class="text-white" :class="focused ? 'text-standard-xl' : 'text-standard-lg py-1.5'">
            <div class="relative inline-block">
                Fashion
                <div
                    v-if="focused"
                    class="absolute left-full top-0 flex flex-row items-center gap-2 pl-4"
                >
                    <ControlIconSprite command="confirm" size="xs" />
                    <div
                        class="text-standard-md relative bottom-1 h-auto bg-bg pt-1 font-bold leading-5 text-white"
                    >
                        Edit
                    </div>
                </div>
            </div>
        </div>
        <div
            class="relative -left-12 skew-x-[42deg] border-2 border-yellow-700 bg-bg-dark py-2 text-white"
            :style="{
                width: 'calc(100% + 2rem)',
                ...(focused && { boxShadow: 'inset 0 0 0.5rem 0.25rem var(--yellow-700)' }),
            }"
        >
            <div class="skew-x-[-42deg] pl-10">
                <div class="flex flex-row gap-6 py-1.5">
                    <div class="font-bold text-rose-700">Hat:</div>
                    <div class="font-bold">
                        {{ hatLabel }}
                    </div>
                </div>
                <div class="flex flex-row gap-6 py-1.5 pl-8">
                    <div class="font-bold text-rose-700">Hair:</div>
                    <div class="font-bold">
                        {{ hairLabel }}
                    </div>
                </div>
                <div class="flex flex-row gap-6 py-1.5 pl-16">
                    <div class="font-bold text-rose-700">Armor:</div>
                    <div class="font-bold">
                        {{ armorLabel }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.fashion-table td {
    font-weight: bold;
}
</style>
