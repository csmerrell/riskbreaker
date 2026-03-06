<script setup lang="ts">
import { getEffectiveStat } from '@/state/battle/UnitStats';
import { PartyMember } from '@/state/useParty';
import { computed } from 'vue';

type Props = {
    member: PartyMember;
};

const { member } = defineProps<Props>();

const currentHealth = computed(() => getEffectiveStat('hp', member.stats));
</script>

<template>
    <div class="text-standard-lg flex h-10 flex-row items-center gap-8 px-6 py-2 text-white">
        <div class="relative top-px text-rose-700">{{ member.name }}</div>
        <div class="relative top-px flex flex-row gap-4">
            HP:
            <div
                class="text-standard flex flex-row gap-2"
                :class="currentHealth / member.stats.hp < 0.66 && 'text-amber-400'"
            >
                <div class="relative bottom-[2px]">
                    {{ currentHealth }}
                </div>
                /
                <div class="relative top-[2px]">{{ member.stats.hp }}</div>
            </div>
        </div>
    </div>
</template>
