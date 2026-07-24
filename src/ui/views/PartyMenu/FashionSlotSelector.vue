<script setup lang="ts">
import { armorLabels } from '@/resource/image/units/armor';
import { hairLabels } from '@/resource/image/units/hair';
import { hatLabels } from '@/resource/image/units/hat';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { usePartyMenu } from './usePartyMenu';
import { FashionItemKey } from './FashionSettings.vue';
import { registerInputListener, unregisterInputListener } from '@/game/input/useInput';

type Props = {
    type: FashionItemKey;
};
const { type } = defineProps<Props>();

const { selectedMember } = usePartyMenu();
const optionLists: Record<FashionItemKey, { key: string; label: string }[]> = {
    hat: [
        { key: 'hide', label: '[None: Hide]' },
        { key: 'inherit', label: '[None: Show Equipped]' },
        ...Object.entries(hatLabels)
            .map(([key, label]) => ({ key, label }))
            .filter((i) => i.label != null),
    ],
    hair: [
        { key: 'inherit', label: 'None' },
        ...Object.entries(hairLabels)
            .map(([key, label]) => ({ key, label }))
            .filter((i) => i.label),
    ],
    armor: [
        ...Object.entries(armorLabels)
            .map(([key, label]) => ({ key, label }))
            .filter((i) => i.label),
    ],
};

const options = computed(() => optionLists[type]);
const selectedIdx = ref(
    Math.max(
        0,
        options.value.findIndex((h) => {
            return h.key === selectedMember.value.appearance[type];
        }),
    ),
);
const leftOverflow = computed(() => options.value.slice(0, selectedIdx.value));
const selectedItem = computed(() => options.value[selectedIdx.value]);
const rightOverflow = computed(() => options.value.slice(selectedIdx.value + 1));

let listeners: string[] = [];
onMounted(() => {
    listeners = [
        registerInputListener(() => {
            selectedIdx.value += 1;
            if (selectedIdx.value >= options.value.length) {
                selectedIdx.value = 0;
            }
            usePartyMenu().changeMemberAppearance(type, selectedItem.value.key);
        }, ['menu_right', 'movement_right']),
        registerInputListener(() => {
            selectedIdx.value -= 1;
            if (selectedIdx.value < 0) {
                selectedIdx.value = options.value.length - 1;
            }
            usePartyMenu().changeMemberAppearance(type, selectedItem.value.key);
        }, ['menu_left', 'movement_left']),
    ];
});

onBeforeUnmount(() => listeners.forEach((l) => unregisterInputListener(l)));
</script>

<template>
    <div class="relative">
        <div
            class="absolute bottom-0 max-w-12 skew-x-[42deg] overflow-hidden"
            :style="{ right: 'calc(100% + 0.5rem)' }"
        >
            <div class="relative flex skew-x-[-42deg] flex-row flex-nowrap justify-end gap-2">
                <div class="fade-left-overlay" />
                <div v-for="item in leftOverflow" :key="item.key" class="text-nowrap text-gray-500">
                    <div>{{ item.label }}</div>
                </div>
            </div>
        </div>
        <div class="relative left-2 flex flex-row justify-center gap-2 px-2 text-black">
            <span class="picon-chevron-left relative top-0.5 font-bold" />
            <div class="font-bold">{{ selectedItem.label }}</div>
            <span class="picon-chevron-right relative top-0.5 font-bold" />
        </div>
        <div
            class="absolute bottom-0 max-w-52 overflow-hidden"
            :style="{ left: 'calc(100% + 2rem)' }"
        >
            <div class="relative flex flex-row flex-nowrap justify-start gap-2">
                <div class="fade-right-overlay" />
                <div
                    v-for="item in rightOverflow"
                    :key="item.key"
                    class="text-nowrap text-gray-500"
                >
                    <div>{{ item.label }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.fade-right-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
        90deg,
        transparent 0%,
        transparent 50%,
        var(--bg-dark) 60%,
        var(--bg-dark) 100%
    );
}

.fade-left-overlay {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 110%;
    background: linear-gradient(270deg, transparent 0%, transparent 30%, var(--bg-dark) 90%);
}
</style>
