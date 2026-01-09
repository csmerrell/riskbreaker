<script setup lang="ts">
import { SFX_MANIFEST } from '@/state/useSFX';
</script>

<template>
    <div>
        <audio
            v-for="[trackKey, track] in Object.entries(SFX_MANIFEST)"
            :id="`audio-${trackKey}`"
            :key="track.path"
            :src="track.path"
            preload="auto"
        />
    </div>
</template>
