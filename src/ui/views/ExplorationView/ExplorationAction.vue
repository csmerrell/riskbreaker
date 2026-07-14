<script setup lang="ts">
import { HotbarActionComponent } from '@/game/actions/HotbarAction.component';
import { MappedCommand } from '@/game/input/InputMap';
import { registerInputListener, unregisterInputListener } from '@/game/input/useInput';
import { getScale } from '@/lib/helpers/screen.helper';
import ControlIconSprite from '@/ui/components/ControlIconSprite.vue';
import { useIcons } from '@/ui/components/menus/crossHotbar/useIcons';
import { Entity } from 'excalibur';
import { onBeforeUnmount, onMounted, ref } from 'vue';

type Props = {
    action: Entity;
    command: MappedCommand;
};

const { action, command } = defineProps<Props>();
const { x, y } = action.get(HotbarActionComponent).iconPos;
const imgContainer = ref<HTMLDivElement>();
const size = ref((getScale() - 1) * 32);

let listeners: string[] = [];
onMounted(async () => {
    const img = await useIcons().getMenuIcon(x, y);
    img.style.setProperty('width', `${size.value}px`);
    img.style.setProperty('height', `${size.value}px`);
    imgContainer.value?.appendChild(img);

    listeners = [
        registerInputListener(() => {
            action.get(HotbarActionComponent).activateEvent();
        }, command),
    ];
});

onBeforeUnmount(() => {
    listeners.forEach((l) => {
        unregisterInputListener(l);
    });
});
</script>

<template>
    <div class="relative">
        <ControlIconSprite :command class="absolute -right-4 bottom-0" size="sm" />
        <div ref="imgContainer" />
    </div>
</template>
