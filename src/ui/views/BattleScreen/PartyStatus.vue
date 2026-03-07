<script setup lang="ts">
import { PartyMember, useParty } from '@/state/useParty';
import MemberStatus from './MemberStatus.vue';
import { ref } from 'vue';
import MenuBox from '@/ui/components/MenuBox.vue';

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
    <MenuBox
        class="relative flex w-[44vw] -skew-x-12 flex-col rounded-br-md rounded-tl-md bg-bg-semi-transparent p-2"
    >
        <div v-for="member in party" :key="member.name" class="relative skew-x-12">
            <MemberStatus :member />
        </div>
    </MenuBox>
</template>
