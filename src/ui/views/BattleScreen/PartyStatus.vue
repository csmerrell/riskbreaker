<script setup lang="ts">
import { PartyMember, useParty } from '@/state/useParty';
import MemberStatus from './MemberStatus.vue';
import { ref } from 'vue';

const partyState = useParty().partyState;
const party = ref<PartyMember[]>(partyState.value.party);
partyState.subscribe((val) => {
    if (!val) {
        party.value = [];
        return;
    }
    if (
        JSON.stringify(party.value.map((p) => p.stats)) !==
        JSON.stringify(val.party.map((p) => p.stats))
    ) {
        party.value = val.party;
    }
});
</script>

<template>
    <div class="flex flex-col gap-2">
        <div v-for="member in party" :key="member.name" class="relative">
            <MemberStatus :member />
        </div>
    </div>
</template>
