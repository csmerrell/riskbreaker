<script setup lang="ts">
import { MENU_TRANSITION_DURATION, MenuInstance } from '@/state/ui/useMenuRegistry';
import { computed } from 'vue';

type Props = {
    menu: MenuInstance;
};

const { menu } = defineProps<Props>();

const xPosition = computed(() => {
    if ((menu.xAnchor ?? 'left') === 'left') {
        return menu.position.value.x;
    } else {
        return window.innerWidth - menu.position.value.x;
    }
});

const yPosition = computed(() => {
    if ((menu.yAnchor ?? 'top') === 'top') {
        return menu.position.value.y;
    } else {
        return window.innerHeight - menu.position.value.y;
    }
});

const styles = computed(() => {
    return {
        position: 'absolute',
        [menu.xAnchor ?? 'left']: `${xPosition.value}px`,
        [menu.yAnchor ?? 'top']: `${yPosition.value}px`,
        zIndex: menu.zIndex,
        transitionDuration: `${MENU_TRANSITION_DURATION}ms`,
    };
});
</script>

<template>
    <component :is="menu.component" v-bind="menu.props" :style="styles" class="transition-all" />
</template>
