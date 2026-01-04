<script setup lang="ts">
type Props = {
    focused?: boolean;
    noBorder?: boolean;
    poles?: {
        NW?: boolean;
        NE?: boolean;
        SW?: boolean;
        SE?: boolean;
    };
};

const { focused = false, noBorder = false, poles = { SW: true, NE: true } } = defineProps<Props>();
const { NW = false, NE = false, SW = false, SE = false } = poles;
</script>

<template>
    <div class="absolute inset-0 z-10" :class="noBorder ? '' : 'border border-yellow-700'">
        <div
            v-if="focused"
            class="absolute inset-0 border-2 border-yellow-700 bg-bg-alt shadow-inner"
        />
        <img
            v-if="poles.NW"
            src="/image/tile/MenuCorner.png"
            class="absolute -left-px -top-px -scale-y-100"
        />
        <img
            v-if="poles.SW"
            src="/image/tile/MenuCorner.png"
            class="absolute -bottom-px -left-px"
        />
        <img
            v-if="poles.NE"
            src="/image/tile/MenuCorner.png"
            class="absolute -right-px -top-px -scale-100"
        />
        <img
            v-if="poles.SE"
            src="/image/tile/MenuCorner.png"
            class="absolute -bottom-px -right-px -scale-x-100"
        />
        <slot />
    </div>
</template>
