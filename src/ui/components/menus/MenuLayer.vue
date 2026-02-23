<script setup lang="ts">
import { useMenuRegistry } from '@/state/ui/useMenuRegistry';
import MenuItem from './MenuItem.vue';

const menus = useMenuRegistry();
</script>

<template>
    <div class="pointer-events-none fixed inset-0 z-[1000]">
        <MenuItem v-for="menu in menus" :key="menu.id" :menu class="pointer-events-auto" />
    </div>
</template>
