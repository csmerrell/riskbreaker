<script setup lang="ts">
import CharacterPreview from './CharacterPreview.vue';
import { PartyMember } from '@/state/useParty.js';
type Props = {
    player: PartyMember;
};
const { player } = defineProps<Props>();

const emit = defineEmits(['player-changed']);
</script>

<template>
    <div class="flex flex-col">
        <div class="flex flex-row">
            <CharacterPreview
                :character="player"
                @player-changed="(idx: number) => emit('player-changed', idx)"
            />
        </div>
    </div>
</template>
