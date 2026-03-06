<script setup lang="ts">
type Props = {
    icon: 'dpad' | 'faceButtons';
};

const { icon } = defineProps<Props>();
</script>

<template>
    <div class="gamepad-icon relative bottom-[2px]">
        <div v-if="icon === 'dpad'">
            <div class="flex flex-row items-center">
                <i class="dpad dpad-left" />
                <div class="flex flex-col gap-[1.25em]">
                    <i class="dpad dpad-up" />
                    <i class="dpad dpad-down" />
                </div>
                <i class="dpad dpad-right" />
            </div>
        </div>
        <div v-if="icon === 'faceButtons'">
            <div class="flex flex-row items-center">
                <i class="face-silhouette" />
                <div class="flex flex-col gap-[1em]">
                    <i class="face-silhouette" />
                    <i class="face-silhouette" />
                </div>
                <i class="face-silhouette" />
            </div>
        </div>
    </div>
</template>

<style>
.face-silhouette {
    @apply bg-gray-700 size-[1.5em] rounded-[.75em];
}

.dpad {
    @apply relative size-[1.25em] bg-gray-700;
    @apply after:absolute after:border-gray-700;
}

.dpad.dpad-left {
    @apply rounded-tl-sm rounded-bl-sm;
    @apply after:left-full after:border-l-[.66em];
    @apply after:border-t-transparent after:border-t-[.66em];
    @apply after:border-b-transparent after:border-b-[.66em];
}

.dpad.dpad-up {
    @apply rounded-tl-sm rounded-tr-sm;
    @apply after:top-full after:border-t-[.66em];
    @apply after:border-l-transparent after:border-l-[.66em];
    @apply after:border-r-transparent after:border-r-[.66em];
}

.dpad.dpad-right {
    @apply rounded-tr-sm rounded-br-sm;
    @apply after:right-full after:border-r-[.66em];
    @apply after:border-t-transparent after:border-t-[.66em];
    @apply after:border-b-transparent after:border-b-[.66em];
}

.dpad.dpad-down {
    @apply rounded-bl-sm rounded-br-sm;
    @apply after:bottom-full after:border-b-[.66em];
    @apply after:border-l-transparent after:border-l-[.66em];
    @apply after:border-r-transparent after:border-r-[.66em];
}
</style>
