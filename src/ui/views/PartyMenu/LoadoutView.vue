<script setup lang="ts">
import { ref } from 'vue';
import CharacterPreview from './CharacterPreview.vue';
import FashionSettings from './FashionSettings.vue';
import EquipmentSettings from './EquipmentSettings.vue';
import SkillEquipSettings from './SkillEquipSettings.vue';

const ready = ref(false);
</script>

<template>
    <div class="flex h-full flex-col gap-12">
        <div class="flex flex-row items-stretch gap-4">
            <CharacterPreview @ready="(val) => (ready = val)" />
            <div v-if="ready" class="relative grow">
                <div class="absolute inset-0 z-20">
                    <FashionSettings />
                </div>
            </div>
        </div>
        <div v-if="ready" class="relative grow">
            <div class="absolute inset-0 z-20 flex flex-row gap-8">
                <EquipmentSettings />
                <SkillEquipSettings />
            </div>
        </div>
    </div>
</template>
