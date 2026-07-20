<script setup lang="ts">
import { ref } from 'vue';
import CharacterPreview from './CharacterPreview.vue';
import FashionSettings from './FashionSettings.vue';

const ready = ref(false);
</script>

<template>
    <div class="flex flex-col">
        <div class="flex flex-row items-stretch gap-4">
            <CharacterPreview @ready="(val) => (ready = val)" />
            <div v-if="ready" class="relative grow">
                <div class="absolute inset-0 z-20">
                    <FashionSettings />
                </div>
            </div>
        </div>
    </div>
</template>
