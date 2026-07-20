<script setup lang="ts">
import MenuBox from '@/ui/components/MenuBox.vue';

type Props = {
    focused?: boolean;
};

const { focused = false } = defineProps<Props>();
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

                <MenuBox
                    :poles="{ NW: true, NE: true, SW: true, SE: true }"
                    class="bg-bg-dark"
                ></MenuBox>
            </div>
        </div>
    </div>
</template>
