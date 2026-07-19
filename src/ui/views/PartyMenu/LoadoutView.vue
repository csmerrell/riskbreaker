<script setup lang="ts">
import AppearanceSettings from './AppearanceSettings.vue';
import CharacterPreview from './CharacterPreview.vue';
</script>

<template>
    <div class="flex flex-col">
        <div class="flex flex-row gap-4">
            <CharacterPreview />
            <div class="text-standard-md relative text-white">
                <div class="absolute z-20">
                    <AppearanceSettings />
                </div>
            </div>
        </div>
    </div>
</template>
