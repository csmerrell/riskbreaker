<script setup lang="ts">
import HotbarBox from './HotbarBox.vue';
import StyledGamepadIcon from './StyledGamepadIcon.vue';
import { computed, ref } from 'vue';
import { PartyMember, SkillMetadata } from '@/state/useParty';
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
    unit: PartyMember;
    side: 'left' | 'right';
};

const { focused, side, unit } = defineProps<Props>();

const unitSkills = computed(() => {
    const map: Record<HotbarKey, SkillMetadata | undefined> = {
        hotbarDUp: Object.values(unit.abilities).find((v) => v.hotkey === `${side}.hotbarDUp`),
        hotbarDLeft: Object.values(unit.abilities).find((v) => v.hotkey === `${side}.hotbarDLeft`),
        hotbarDRight: Object.values(unit.abilities).find(
            (v) => v.hotkey === `${side}.hotbarDRight`,
        ),
        hotbarDDown: Object.values(unit.abilities).find((v) => v.hotkey === `${side}.hotbarDDown`),
        hotbarFUp: Object.values(unit.abilities).find((v) => v.hotkey === `${side}.hotbarFUp`),
        hotbarFLeft: Object.values(unit.abilities).find((v) => v.hotkey === `${side}.hotbarFLeft`),
        hotbarFRight: Object.values(unit.abilities).find(
            (v) => v.hotkey === `${side}.hotbarFRight`,
        ),
        hotbarFDown: Object.values(unit.abilities).find((v) => v.hotkey === `${side}.hotbarFDown`),
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
            <HotbarBox v-bind="unitSkills.hotbarDLeft" :focused />
            <HotbarName v-if="unitSkills.hotbarDLeft && focused">
                {{ unitSkills.hotbarDLeft.name }}
            </HotbarName>
        </div>
        <div class="flex flex-col items-center gap-2">
            <div class="relative">
                <HotbarBox v-bind="unitSkills.hotbarDUp" :focused />
                <HotbarName v-if="unitSkills.hotbarDUp && focused">
                    {{ unitSkills.hotbarDUp.name }}
                </HotbarName>
            </div>
            <StyledGamepadIcon v-if="focused" icon="dpad" />
            <div class="relative">
                <HotbarBox v-bind="unitSkills.hotbarDDown" :focused />
                <HotbarName v-if="unitSkills.hotbarDDown && focused">
                    {{ unitSkills.hotbarDDown.name }}
                </HotbarName>
            </div>
        </div>
        <div class="relative">
            <HotbarBox v-bind="unitSkills.hotbarDRight" :focused />
            <HotbarName v-if="unitSkills.hotbarDRight && focused">
                {{ unitSkills.hotbarDRight.name }}
            </HotbarName>
        </div>
        <div class="mx-1" />
        <div class="relative">
            <HotbarBox v-bind="unitSkills.hotbarFLeft" :focused />
            <HotbarName v-if="unitSkills.hotbarFLeft && focused">
                {{ unitSkills.hotbarFLeft.name }}
            </HotbarName>
        </div>
        <div class="flex flex-col items-center gap-2">
            <div class="relative">
                <HotbarBox v-bind="unitSkills.hotbarFUp" :focused />
                <HotbarName v-if="unitSkills.hotbarFUp && focused">
                    {{ unitSkills.hotbarFUp.name }}
                </HotbarName>
            </div>
            <StyledGamepadIcon v-if="focused" icon="faceButtons" />
            <div class="relative">
                <HotbarBox v-bind="unitSkills.hotbarFDown" :focused />
                <HotbarName v-if="unitSkills.hotbarFDown && focused">
                    {{ unitSkills.hotbarFDown.name }}
                </HotbarName>
            </div>
        </div>
        <div class="relative">
            <HotbarBox v-bind="unitSkills.hotbarFRight" :focused />
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
