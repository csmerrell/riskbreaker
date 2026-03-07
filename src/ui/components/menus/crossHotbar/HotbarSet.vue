<script setup lang="ts">
import { useExploration } from '@/state/useExploration';
import HotbarBox from './HotbarBox.vue';
import StyledGamepadIcon from './StyledGamepadIcon.vue';
import { computed, ref } from 'vue';
import { vec, Vector } from 'excalibur';
import { SkillMetadata } from '@/state/useParty';
import { H } from 'vite/dist/node/types.d-aGj9QkWt';

export type HotbarKey =
    | 'hotbarDUp'
    | 'hotbarDLeft'
    | 'hotbarDRight'
    | 'hotbarDDown'
    | 'hotbarFUp'
    | 'hotbarFLeft'
    | 'hotbarFRight'
    | 'hotbarFDown';

type Props = {
    focused: boolean;
    side: 'left' | 'right';
};

type SkillOpts = { row: number; col: number; scale?: Vector };
const skillMap: Record<string, SkillOpts> = {
    starflash: { row: 4, col: 4 },
    compress: { row: 1, col: 6 },
    shieldBash: { row: 1, col: 4 },
    push: { row: 4, col: 6, scale: vec(-1, 1) },
    attack: { row: 3, col: 9 },
    pulse: { row: 1, col: 5 },
};

const { focused, side } = defineProps<Props>();
const activeUnit = useExploration().getExplorationManager().battleManager.turnManager.activeUnit;

const skills = ref<Record<string, SkillMetadata>>(
    activeUnit.value && activeUnit.value.alignment === 'party' ? activeUnit.value.abilities : {},
);
activeUnit.subscribe((val) => {
    if (!val || val.alignment !== 'party') {
        skills.value = {};
    } else {
        skills.value = val.abilities;
    }
});

const unitSkills = computed(() => {
    const hotbarMappedSkills: Record<string, keyof typeof skillMap> = {};
    (Object.values(skills.value) as SkillMetadata[])
        .filter((s) => s.hotkey !== undefined && s.hotkey.split('.')[0] === side)
        .forEach((s) => {
            const hotkey = s.hotkey!.split('.')[1] as HotbarKey;
            hotbarMappedSkills[hotkey] = s.key;
        });

    const map: Record<HotbarKey, SkillOpts> = {
        hotbarDUp: skillMap[hotbarMappedSkills.hotbarDUp],
        hotbarDLeft: skillMap[hotbarMappedSkills.hotbarDLeft],
        hotbarDRight: skillMap[hotbarMappedSkills.hotbarDRight],
        hotbarDDown: skillMap[hotbarMappedSkills.hotbarDDown],
        hotbarFUp: skillMap[hotbarMappedSkills.hotbarFUp],
        hotbarFLeft: skillMap[hotbarMappedSkills.hotbarFLeft],
        hotbarFRight: skillMap[hotbarMappedSkills.hotbarFRight],
        hotbarFDown: skillMap[hotbarMappedSkills.hotbarFDown],
    };
    return map;
});
</script>

<template>
    <div class="hotbar-set flex flex-row items-center gap-1" :class="focused ? 'text-[1.5em]' : ''">
        <HotbarBox v-bind="unitSkills.hotbarDLeft" />
        <div class="flex flex-col items-center gap-2">
            <HotbarBox v-bind="unitSkills.hotbarDUp" />
            <StyledGamepadIcon v-if="focused" icon="dpad" class="text-[.5em]" />
            <HotbarBox v-bind="unitSkills.hotbarDDown" />
        </div>
        <HotbarBox v-bind="unitSkills.hotbarDRight" />
        <div class="mx-1" />
        <HotbarBox v-bind="unitSkills.hotbarFLeft" />
        <div class="flex flex-col items-center gap-2">
            <HotbarBox v-bind="unitSkills.hotbarFUp" />
            <StyledGamepadIcon v-if="focused" icon="faceButtons" class="text-[.5em]" />
            <HotbarBox v-bind="unitSkills.hotbarFDown" />
        </div>
        <HotbarBox v-bind="unitSkills.hotbarFRight" />
    </div>
</template>
