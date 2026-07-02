<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue';
import { Entity } from 'excalibur';
import HotbarBox from './HotbarBox.vue';
import HotbarName from './HotbarName.vue';
import StyledGamepadIcon from './StyledGamepadIcon.vue';
import { HotbarEventComponent } from '@/game/actions/HotbarEvent.component';
import { registerInputListener, unregisterInputListener } from '@/game/input/useInput';

type QuadEvents = {
    up?: Entity;
    down?: Entity;
    left?: Entity;
    right?: Entity;
};

type CommandSet = 'hotbarD' | 'hotbarF';

type Props = {
    events: QuadEvents;
    commandSet: CommandSet;
    focused: boolean;
    isLightweight?: boolean;
};

const { events, commandSet, focused } = defineProps<Props>();

const centerIcon = computed<'dpad' | 'faceButtons'>(() =>
    commandSet === 'hotbarD' ? 'dpad' : 'faceButtons',
);

// Extract event data for boxes
const boxes = computed(() => ({
    up: events.up?.get(HotbarEventComponent),
    down: events.down?.get(HotbarEventComponent),
    left: events.left?.get(HotbarEventComponent),
    right: events.right?.get(HotbarEventComponent),
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
                    const component = event.get(HotbarEventComponent);
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
            <HotbarBox :icon="boxes.left?.icon" :label="boxes.left?.label" :focused />
            <HotbarName v-if="boxes.left && focused">
                {{ boxes.left.label }}
            </HotbarName>
        </div>
        <div class="flex flex-col items-center gap-2">
            <div class="relative">
                <HotbarBox :icon="boxes.up?.icon" :label="boxes.up?.label" :focused />
                <HotbarName v-if="boxes.up && focused">
                    {{ boxes.up.label }}
                </HotbarName>
            </div>
            <StyledGamepadIcon v-if="focused" :icon="centerIcon" />
            <div class="relative">
                <HotbarBox :icon="boxes.down?.icon" :label="boxes.down?.label" :focused />
                <HotbarName v-if="boxes.down && focused">
                    {{ boxes.down.label }}
                </HotbarName>
            </div>
        </div>
        <div class="relative">
            <HotbarBox :icon="boxes.right?.icon" :label="boxes.right?.label" :focused />
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
