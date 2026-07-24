<script setup lang="ts">
import { onBeforeUnmount, onMounted, Ref, ref, watch } from 'vue';
import CharacterPreview from './CharacterPreview.vue';
import FashionSettings from './FashionSettings.vue';
import EquipmentSettings from './EquipmentSettings.vue';
import SkillEquipSettings from './SkillEquipSettings.vue';
import { useNightSky } from './useNightSky.js';
import { vec } from 'excalibur';
import { registerInputListener, unregisterInputListener } from '@/game/input/useInput.js';

const ready = ref(false);
const emit = defineEmits(['ready']);
const starOffsets = ref<[number, number, string][]>([
    [-1, -0.25, 'sm'],
    [-0.75, 1, 'md'],
    [-0.66, 0.5, 'sm'],
    [-0.5, 0.75, 'md'],
    [-0.45, -0.5, 'lg'],
    [-0.2, 0.7, 'sm'],
    [0.3, -0.1, 'sm'],
    [0.6, 0.6, 'md'],
]);
const skyAnchor = ref<HTMLDivElement>();
watch([ready, skyAnchor], () => {
    if (ready.value && skyAnchor.value) {
        const { top, right } = skyAnchor.value.getBoundingClientRect();
        useNightSky().setPositioning('loadout', {
            anchor: vec(right, top),
            moon: [2, -0.5],
            stars: [
                [15, 2, 'xl'],
                [12, -1, '4xl'],
                [11, 3, 'xl'],
                [10, 0.5, '4xl'],
                [9, 4, 'xl'],
                [8, -0, 'xl'],
                [7, -1.25, 'lg'],
                [2, 2, 'xl'],
                [0.5, -0.25, '4xl'],
            ],
        });
    }
});

let listeners: string[] = [];
type LoadoutMenuKey = 'fashion' | 'equipment' | 'skills';
const menuMap: Record<
    LoadoutMenuKey,
    {
        up?: LoadoutMenuKey;
        down?: LoadoutMenuKey;
        left?: LoadoutMenuKey;
        right?: LoadoutMenuKey;
    }
> = {
    fashion: {
        left: 'equipment',
        down: 'skills',
    },
    equipment: {
        up: 'fashion',
        right: 'skills',
    },
    skills: {
        left: 'equipment',
        up: 'fashion',
    },
};
const focused = ref<LoadoutMenuKey>('fashion');
onMounted(() => {
    listeners = [
        registerInputListener(() => {
            const target = menuMap[focused.value].up;
            if (target) {
                focused.value = target;
            }
        }, ['menu_up', 'movement_up']),
        registerInputListener(() => {
            const target = menuMap[focused.value].down;
            if (target) {
                focused.value = target;
            }
        }, ['menu_down', 'movement_down']),
        registerInputListener(() => {
            const target = menuMap[focused.value].left;
            if (target) {
                focused.value = target;
            }
        }, ['menu_left', 'movement_left']),
        registerInputListener(() => {
            const target = menuMap[focused.value].right;
            if (target) {
                focused.value = target;
            }
        }, ['menu_right', 'movement_right']),
    ];
});

onBeforeUnmount(() => listeners.forEach((l) => unregisterInputListener(l)));
</script>

<template>
    <div class="flex h-full flex-col gap-12">
        <div class="flex flex-row items-stretch gap-4">
            <CharacterPreview
                @ready="
                    (val) => {
                        ready = val;
                        emit('ready', val);
                    }
                "
            />
            <div v-if="ready" class="relative grow">
                <div class="absolute inset-0 z-20">
                    <div ref="skyAnchor" class="absolute -right-8 top-4" />
                    <div ref="starContainer">
                        <div
                            v-for="star in starOffsets"
                            :key="`${star[0]}${star[1]}`"
                            :style="{ right: `${1 - star[0]}rem`, top: `${1 - star[0]}rem` }"
                            class="text-yellow-500"
                            :class="`text-${star[2]}`"
                        />
                    </div>
                    <FashionSettings :focused="focused === 'fashion'" />
                </div>
            </div>
        </div>
        <div v-if="ready" class="relative grow">
            <div class="absolute inset-0 z-20 flex flex-row gap-8">
                <EquipmentSettings :focused="focused === 'equipment'" />
                <SkillEquipSettings :focused="focused === 'skills'" />
            </div>
        </div>
    </div>
</template>
