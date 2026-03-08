<script setup lang="ts">
import { useExploration } from '@/state/useExploration';
import HotbarBox from './HotbarBox.vue';
import StyledGamepadIcon from './StyledGamepadIcon.vue';
import { computed, ref } from 'vue';
import { Vector } from 'excalibur';
import { SkillMetadata } from '@/state/useParty';
import { getScale } from '@/lib/helpers/screen.helper';
import HotbarName from './HotbarName.vue';

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

type SkillOpts = { row: number; col: number; name: string };
const skillMap: Record<string, SkillOpts> = {
    starflash: { row: 4, col: 4, name: 'Starflash' },
    compress: { row: 1, col: 6, name: 'Compress' },
    shieldBash: { row: 1, col: 4, name: 'Shield Bash' },
    push: { row: 4, col: 6, name: 'Push' },
    attack: { row: 3, col: 9, name: 'Attack' },
    pulse: { row: 1, col: 5, name: 'Pulse' },
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
const focusScale = ref(1 + 1 / getScale());
const focusTranslate = ref(1 / getScale() / 2);
</script>

<template>
    <div
        class="hotbar-set flex flex-row items-center gap-1"
        :style="{
            ...(focused && {
                transform: `scale(${focusScale}) translate(${focusTranslate * (side === 'left' ? -100 : 100)}%, -${focusTranslate * 100}%)`,
            }),
        }"
    >
        <div class="relative">
            <HotbarBox v-bind="unitSkills.hotbarDLeft" />
            <HotbarName v-if="unitSkills.hotbarDLeft && focused">
                {{ unitSkills.hotbarDLeft.name }}
            </HotbarName>
        </div>
        <div class="flex flex-col items-center gap-2">
            <div class="relative">
                <HotbarBox v-bind="unitSkills.hotbarDUp" />
                <HotbarName v-if="unitSkills.hotbarDUp && focused">
                    {{ unitSkills.hotbarDUp.name }}
                </HotbarName>
            </div>
            <StyledGamepadIcon v-if="focused" icon="dpad" />
            <div class="relative">
                <HotbarBox v-bind="unitSkills.hotbarDDown" />
                <HotbarName v-if="unitSkills.hotbarDDown && focused">
                    {{ unitSkills.hotbarDDown.name }}
                </HotbarName>
            </div>
        </div>
        <div class="relative">
            <HotbarBox v-bind="unitSkills.hotbarDRight" />
            <HotbarName v-if="unitSkills.hotbarDRight && focused">
                {{ unitSkills.hotbarDRight.name }}
            </HotbarName>
        </div>
        <div class="mx-1" />
        <div class="relative">
            <HotbarBox v-bind="unitSkills.hotbarFLeft" />
            <HotbarName v-if="unitSkills.hotbarFLeft && focused">
                {{ unitSkills.hotbarFLeft.name }}
            </HotbarName>
        </div>
        <div class="flex flex-col items-center gap-2">
            <div class="relative">
                <HotbarBox v-bind="unitSkills.hotbarFUp" />
                <HotbarName v-if="unitSkills.hotbarFUp && focused">
                    {{ unitSkills.hotbarFUp.name }}
                </HotbarName>
            </div>
            <StyledGamepadIcon v-if="focused" icon="faceButtons" />
            <div class="relative">
                <HotbarBox v-bind="unitSkills.hotbarFDown" />
                <HotbarName v-if="unitSkills.hotbarFDown && focused">
                    {{ unitSkills.hotbarFDown.name }}
                </HotbarName>
            </div>
        </div>
        <div class="relative">
            <HotbarBox v-bind="unitSkills.hotbarFRight" />
            <HotbarName v-if="unitSkills.hotbarFRight && focused">
                {{ unitSkills.hotbarFRight.name }}
            </HotbarName>
        </div>
    </div>
</template>

<style>
.hotbar-set {
    transition: transform 0.1s ease-in;
    background: radial-gradient(
        ellipse 50% 50% at center,
        rgba(21, 29, 40, 0.3) 0%,
        rgba(21, 29, 40, 0.5) 80%,
        rgba(21, 29, 40, 0) 100%
    );
}
</style>
