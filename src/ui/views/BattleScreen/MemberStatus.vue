<script setup lang="ts">
import { PartyMember } from '@/state/useParty';

type Props = {
    member: PartyMember;
};

const { member } = defineProps<Props>();
</script>

<template>
    <div class="text-standard-md flex h-12 flex-row items-start gap-8 px-6 pb-10 pt-2 text-white">
        <div class="relative top-px text-rose-600">{{ member.name }}</div>
        <div class="flex grow basis-3/5 flex-col gap-1">
            <div class="flex w-full flex-row items-end gap-4 px-2">
                <div class="text-standard-md">HP:</div>
                <div
                    class="text-standard-lg flex grow flex-row justify-center gap-4"
                    :class="member.stats.currentHp / member.stats.hp < 0.66 && 'text-amber-400'"
                >
                    <div class="relative bottom-[2px]">
                        {{ member.stats.currentHp }}
                    </div>
                    /
                    <div class="relative top-[2px]">{{ member.stats.hp }}</div>
                </div>
            </div>
            <div class="relative h-1 w-full bg-rose-950">
                <div
                    class="absolute inset-0 bg-rose-600"
                    :style="{ right: `${(1 - member.stats.currentHp / member.stats.hp) * 100}%` }"
                />
            </div>
        </div>
    </div>
</template>
