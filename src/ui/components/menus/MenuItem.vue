<script setup lang="ts">
import { MENU_TRANSITION_DURATION, MenuInstance } from '@/state/ui/useMenuRegistry';
import { computed, onMounted, ref, ComponentPublicInstance } from 'vue';

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

const durationOverride = ref<number | undefined>(undefined);
const styles = computed(() => {
    return {
        position: 'absolute',
        [menu.xAnchor ?? 'left']: `${xPosition.value}px`,
        [menu.yAnchor ?? 'top']: `${yPosition.value}px`,
        zIndex: menu.zIndex,
        transitionDuration: `${durationOverride.value ?? MENU_TRANSITION_DURATION}ms`,
    };
});

const hooks = {
    overrideTransitionSpeedOnce: (ms: number) => {
        durationOverride.value = ms;
    },
};
export type MenuItemHooks = typeof hooks;

menu.addHooks(hooks);

const componentRef = ref<ComponentPublicInstance>();
onMounted(() => {
    const el = componentRef.value?.$el as HTMLElement;
    if (el) {
        el.addEventListener('transitionend', () => {
            durationOverride.value = undefined;
        });
    }
});
</script>

<template>
    <component
        :is="menu.component"
        ref="componentRef"
        v-bind="menu.props"
        :style="styles"
        class="transition-all"
    />
</template>
