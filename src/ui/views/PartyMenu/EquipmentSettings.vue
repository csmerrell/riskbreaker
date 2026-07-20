<script setup lang="ts">
import { ref } from 'vue';
import { vec } from 'excalibur';
import MenuBox from '@/ui/components/MenuBox.vue';
import { resources } from '@/resource';
import { getScale } from '@/lib/helpers/screen.helper';

type Props = {
    focused?: boolean;
};

const { focused = false } = defineProps<Props>();
const size = ref(vec(resources.image.misc.forestShowcase.width * getScale(), 0));
</script>

<template>
    <div class="flex h-full flex-row pb-4">
        <div class="flex flex-col gap-2">
            <div class="relative h-full" :style="{ width: `${size.x}px` }">
                <div
                    class="absolute left-12 z-20 -translate-y-1/3 bg-bg px-2 leading-[1px] text-white"
                    :class="focused ? 'text-standard-xl' : 'text-standard-lg'"
                >
                    Equipment
                </div>
                <MenuBox
                    :poles="{ NW: true, NE: true, SW: true, SE: true }"
                    class="left-4 z-10 bg-bg-dark"
                >
                    Doot
                </MenuBox>
            </div>
        </div>
    </div>
</template>
