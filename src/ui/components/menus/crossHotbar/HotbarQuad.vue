<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue';
import { Entity } from 'excalibur';
import HotbarBox from './HotbarBox.vue';
import HotbarName from './HotbarName.vue';
import StyledGamepadIcon from './StyledGamepadIcon.vue';
import { HotbarActionComponent } from '@/game/actions/HotbarAction.component.js';
import { registerInputListener, unregisterInputListener } from '@/game/input/useInput';
import { IconType } from './HotbarSet.vue';

export type QuadEvents = {
    up?: Entity;
    down?: Entity;
    left?: Entity;
    right?: Entity;
};

type CommandSet = 'hotbarD' | 'hotbarF';

type Props = {
    iconType: IconType;
    events: QuadEvents;
    commandSet: CommandSet;
    focused: boolean;
};

const { iconType, events, commandSet, focused } = defineProps<Props>();

const centerIcon = computed<'dpad' | 'faceButtons'>(() =>
    commandSet === 'hotbarD' ? 'dpad' : 'faceButtons',
);

// Extract event data for boxes
const boxes = computed(() => ({
    up: events.up?.get(HotbarActionComponent),
    down: events.down?.get(HotbarActionComponent),
    left: events.left?.get(HotbarActionComponent),
    right: events.right?.get(HotbarActionComponent),
}));

// Input management
const listeners: string[] = [];

function registerListeners() {
    type Direction = 'Up' | 'Down' | 'Left' | 'Right';
    const directions: Direction[] = ['Up', 'Down', 'Left', 'Right'];

    directions.forEach((dir) => {
        const key = dir.toLowerCase() as keyof QuadEvents;
        const event = events[key];
        if (event) {
            const command = `${commandSet}${dir}` as
                | 'hotbarDUp'
                | 'hotbarDDown'
                | 'hotbarDLeft'
                | 'hotbarDRight'
                | 'hotbarFUp'
                | 'hotbarFDown'
                | 'hotbarFLeft'
                | 'hotbarFRight';
            listeners.push(
                registerInputListener(() => {
                    const component = event.get(HotbarActionComponent);
                    emit('eventActivated');
                    component.activateEvent();
                }, command),
            );
        }
    });
}

function unregisterListeners() {
    listeners.forEach((l) => unregisterInputListener(l));
    listeners.length = 0;
}

const emit = defineEmits(['eventActivated']);

watch(
    () => focused,
    (isFocused) => {
        if (isFocused) {
            registerListeners();
        } else {
            unregisterListeners();
        }
    },
    { immediate: true },
);

onUnmounted(() => {
    unregisterListeners();
});
</script>

<template>
    <div class="hotbar-quad flex flex-row items-center gap-1">
        <div class="relative">
            <HotbarBox
                :type="iconType"
                :row="boxes.left?.iconPos.y"
                :col="boxes.left?.iconPos.x"
                :src="boxes.left?.iconSrc"
            />
            <HotbarName v-if="boxes.left && focused">
                {{ boxes.left.label }}
            </HotbarName>
        </div>
        <div class="flex flex-col items-center gap-2">
            <div class="relative">
                <HotbarBox
                    :type="iconType"
                    :row="boxes.up?.iconPos.y"
                    :col="boxes.up?.iconPos.x"
                    :src="boxes.up?.iconSrc"
                />
                <HotbarName v-if="boxes.up && focused">
                    {{ boxes.up.label }}
                </HotbarName>
            </div>
            <StyledGamepadIcon v-if="focused" :icon="centerIcon" />
            <div class="relative">
                <HotbarBox
                    :type="iconType"
                    :row="boxes.down?.iconPos.y"
                    :col="boxes.down?.iconPos.x"
                    :src="boxes.down?.iconSrc"
                />
                <HotbarName v-if="boxes.down && focused">
                    {{ boxes.down.label }}
                </HotbarName>
            </div>
        </div>
        <div class="relative">
            <HotbarBox
                :type="iconType"
                :row="boxes.right?.iconPos.y"
                :col="boxes.right?.iconPos.x"
                :src="boxes.right?.iconSrc"
            />
            <HotbarName v-if="boxes.right && focused">
                {{ boxes.right.label }}
            </HotbarName>
        </div>
    </div>
</template>

<style scoped>
.hotbar-quad {
    transition: transform 0.1s ease-in;
    background: radial-gradient(
        ellipse 50% 50% at center,
        rgba(21, 29, 40, 0.3) 0%,
        rgba(21, 29, 40, 0.5) 80%,
        rgba(21, 29, 40, 0) 100%
    );
}
</style>
