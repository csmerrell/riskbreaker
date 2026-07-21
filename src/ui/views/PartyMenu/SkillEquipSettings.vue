<script setup lang="ts">
import { getScale } from '@/lib/helpers/screen.helper';
import MenuBox from '@/ui/components/MenuBox.vue';
import HotbarBox from '@/ui/components/menus/crossHotbar/HotbarBox.vue';
import HotbarName from '@/ui/components/menus/crossHotbar/HotbarName.vue';
import StyledGamepadIcon from '@/ui/components/menus/crossHotbar/StyledGamepadIcon.vue';
import { computed } from 'vue';
import { useSelectedCharacter } from './useSelectedCharacter';
import { HotbarActionComponent } from '@/game/actions/HotbarAction.component';
import { QuadEvents } from '@/ui/components/menus/crossHotbar/HotbarQuad.vue';
import { Entity, ImageSource } from 'excalibur';

type Props = {
    focused?: boolean;
};

const { focused = false } = defineProps<Props>();

const { selectedMember } = useSelectedCharacter();
const skillBindings = computed(() => {
    const dPad: Record<
        keyof QuadEvents,
        { label: string; row: number; col: number; src: ImageSource }
    > = {};
    const faceButtons: Record<
        keyof QuadEvents,
        { label: string; row: number; col: number; src: ImageSource }
    > = {};

    (
        Object.entries(selectedMember.value.equippedAbilities.dPad) as [keyof QuadEvents, Entity][]
    ).forEach(([key, val]) => {
        const iconMeta = val.get(HotbarActionComponent);
        dPad[key] = {
            row: iconMeta.iconPos.y,
            col: iconMeta.iconPos.x,
            src: iconMeta.iconSrc,
            label: iconMeta.label,
        };
    });
    (
        Object.entries(selectedMember.value.equippedAbilities.faceButton) as [
            keyof QuadEvents,
            Entity,
        ][]
    ).forEach(([key, val]) => {
        const iconMeta = val.get(HotbarActionComponent);
        faceButtons[key] = {
            col: iconMeta.iconPos.x,
            row: iconMeta.iconPos.y,
            src: iconMeta.iconSrc,
            label: iconMeta.label,
        };
    });

    return {
        dPad,
        faceButtons,
    };
});
</script>

<template>
    <div class="relative -top-4 -mr-8 size-full">
        <div class="absolute inset-0 -top-8">
            <div class="relative size-full">
                <div
                    class="absolute left-12 z-20 -translate-y-1/3 bg-bg px-2 leading-[1px] text-white"
                    :class="focused ? 'text-standard-xl' : 'text-standard-lg'"
                >
                    Skills
                </div>

                <MenuBox :poles="{ NW: true, NE: true, SW: true, SE: true }" class="bg-bg-dark">
                    <div class="relative size-full">
                        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div
                                class="flex flex-row items-center gap-2"
                                :style="{
                                    transform: `scale(${(100 / getScale()) * (getScale() + 2)}%)`,
                                    transformOrigin: 'center',
                                }"
                            >
                                <div class="relative">
                                    <HotbarBox type="skill" v-bind="skillBindings.dPad.left" />
                                    <HotbarName>{{ skillBindings.dPad.left.label }}</HotbarName>
                                </div>
                                <div class="flex flex-col gap-1">
                                    <div class="relative" :class="true && 'mb-3'">
                                        <HotbarBox type="skill" v-bind="skillBindings.dPad.up" />
                                        <HotbarName>{{ skillBindings.dPad.up.label }}</HotbarName>
                                    </div>
                                    <StyledGamepadIcon icon="dpad" />
                                    <div class="relative">
                                        <HotbarBox type="skill" v-bind="skillBindings.dPad.down" />
                                        <HotbarName>{{ skillBindings.dPad.down.label }}</HotbarName>
                                    </div>
                                </div>
                                <div class="relative">
                                    <HotbarBox type="skill" v-bind="skillBindings.dPad.right" />
                                    <HotbarName>{{ skillBindings.dPad.right.label }}</HotbarName>
                                </div>
                                <div class="border-r-1 border-color-bg self-stretch" />
                                <div class="relative">
                                    <HotbarBox
                                        type="skill"
                                        v-bind="skillBindings.faceButtons.left"
                                    />
                                    <HotbarName>{{
                                        skillBindings.faceButtons.left.label
                                    }}</HotbarName>
                                </div>
                                <div class="flex flex-col gap-1">
                                    <div class="relative" :class="true && 'mb-3'">
                                        <HotbarBox
                                            type="skill"
                                            v-bind="skillBindings.faceButtons.up"
                                        />
                                        <HotbarName>{{
                                            skillBindings.faceButtons.up.label
                                        }}</HotbarName>
                                    </div>
                                    <StyledGamepadIcon icon="faceButtons" />
                                    <div class="relative">
                                        <HotbarBox
                                            type="skill"
                                            v-bind="skillBindings.faceButtons.down"
                                        />
                                        <HotbarName>{{
                                            skillBindings.faceButtons.down.label
                                        }}</HotbarName>
                                    </div>
                                </div>
                                <div class="relative">
                                    <HotbarBox
                                        type="skill"
                                        v-bind="skillBindings.faceButtons.right"
                                    />
                                    <HotbarName>{{
                                        skillBindings.faceButtons.right.label
                                    }}</HotbarName>
                                </div>
                            </div>
                        </div>
                    </div>
                </MenuBox>
            </div>
        </div>
    </div>
</template>
