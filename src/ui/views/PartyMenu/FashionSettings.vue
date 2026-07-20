<script setup lang="ts">
import { fashionLabels } from '@/resource/image/units';
import { useSelectedCharacter } from './useSelectedCharacter';
import { computed } from 'vue';
import ControlIconSprite from '@/ui/components/ControlIconSprite.vue';

type Props = {
    selected: boolean;
};

const { selected = false } = defineProps<Props>();

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
        <div class="text-standard-xl text-white">Fashion</div>
        <div
            class="relative -left-16 skew-x-[42deg] border-yellow-700 py-2"
            :class="selected ? 'border-4 bg-yellow-500' : 'border-2 bg-bg-dark text-white'"
            :style="{ width: 'calc(100% + 6rem)' }"
        >
            <div class="skew-x-[-42deg] pl-12">
                <div
                    v-if="selected"
                    class="absolute -top-7 right-32 flex flex-row items-start gap-2"
                >
                    <ControlIconSprite command="confirm" size="sm" />
                    <div
                        class="text-standard-lg relative bottom-2 h-auto bg-bg pt-1 font-bold leading-5 text-white"
                    >
                        Edit
                    </div>
                </div>
                <div class="flex flex-row gap-6 py-1.5">
                    <div class="font-bold" :class="!selected && 'text-rose-700'">Hat:</div>
                    <div class="font-bold">
                        {{ hatLabel }}
                    </div>
                </div>
                <div class="flex flex-row gap-6 py-1.5 pl-8">
                    <div class="font-bold" :class="!selected && 'text-rose-700'">Hair:</div>
                    <div class="font-bold">
                        {{ hairLabel }}
                    </div>
                </div>
                <div class="flex flex-row gap-6 py-1.5 pl-16">
                    <div class="font-bold" :class="!selected && 'text-rose-700'">Armor:</div>
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
