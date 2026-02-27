<script setup lang="ts">
export type PlayerStatus = {
    name: string;
    health: number;
    maxHealth: number;
};
type Props = {
    players: PlayerStatus[];
};

const { players } = defineProps<Props>();
</script>

<template>
    <div class="flex flex-col gap-2">
        <div v-for="player in players" :key="player.name" class="relative">
            <div
                class="text-standard-lg flex h-10 flex-row items-center gap-8 px-6 py-2 text-white"
            >
                <div class="relative top-px text-rose-700">{{ player.name }}</div>
                <div class="relative top-px flex flex-row gap-4">
                    HP:
                    <div
                        class="text-standard flex flex-row gap-2"
                        :class="player.health / player.maxHealth < 0.66 && 'text-amber-400'"
                    >
                        <div class="relative bottom-[2px]">
                            {{ player.health }}
                        </div>
                        /
                        <div class="relative top-[2px]">{{ player.maxHealth }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
