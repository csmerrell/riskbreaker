<script setup lang="ts">
//vue
import { computed, CSSProperties, nextTick, ref } from 'vue';

//components
import MenuBox from '@/ui/components/MenuBox.vue';
import TilePromptContents from './TilePromptContents.vue';

//state
import { useExploration, type TileControlPrompt } from '@/state/useExploration';
import { useGameContext } from '@/state/useGameContext';
import { vec, Vector } from 'excalibur';
import { getScale } from '@/lib/helpers/screen.helper';

const { tileControlPrompts } = useExploration();

const el = ref<HTMLElement>();
const tileControls = ref<TileControlPrompt>(tileControlPrompts.value);
tileControlPrompts.subscribe((next) => {
    tileControls.value = next;
    if (next) {
        positioningStyles.value = {};
        nextTick(offsetOverflow);
    }
});

const { playerPos: posState } = useExploration();
const playerPos = ref<{ pos: Vector; size: number } | null>({ pos: vec(0, 0), size: 24 });
posState.subscribe((next) => {
    playerPos.value = next;
});

const { explorationEngine } = useGameContext();
const playerSize = computed<number>(() => playerPos.value.size * getScale());
const playerCenter = computed<Vector>(() => {
    const { x, y } = playerPos.value.pos;
    return explorationEngine.value.worldToScreenCoordinates(vec(x, y)).scale(getScale());
});

const positioningStyles = ref<CSSProperties>();
const positionDefault = computed(() => ({
    top: `${playerCenter.value.y - playerSize.value}px`,
    left: `${playerCenter.value.x}px`,
    transform: 'translate(-50%, -100%)',
}));

function offsetOverflow() {
    const boundingBox = el.value.getBoundingClientRect();
    const transform: { x?: null | string; y?: null | string } = {};

    if (boundingBox.top < 0) {
        positioningStyles.value.top = '8px';
        positioningStyles.value.left = `${playerCenter.value.x + playerSize.value}px`;
        transform.y = '0';
        transform.x = '0';
    }

    nextTick(() => {
        const boundingBox = el.value.getBoundingClientRect();
        if (boundingBox.right > window.innerWidth) {
            positioningStyles.value.left = `${playerCenter.value.x - playerSize.value}px`;
            transform.x = '-100';
        } else if (boundingBox.left < 0) {
            positioningStyles.value.left = `${playerCenter.value.x + playerSize.value}px`;
            transform.x = '0';
        }
        positioningStyles.value.transform = `translate(${transform.x ?? '-50'}%, ${transform.y ?? '-100'}%)`;
    });
}

const appliedPosition = computed(() => {
    return {
        ...positionDefault.value,
        ...positioningStyles.value,
    };
});
</script>

<template>
    <Transition name="fade">
        <div
            v-if="tileControls"
            ref="el"
            :key="JSON.stringify(appliedPosition)"
            class="absolute"
            :style="appliedPosition"
        >
            <div class="invisible">
                <TilePromptContents :tile-controls="tileControls" />
            </div>
            <MenuBox class="bg-bg">
                <TilePromptContents :tile-controls="tileControls" />
            </MenuBox>
        </div>
    </Transition>
</template>
