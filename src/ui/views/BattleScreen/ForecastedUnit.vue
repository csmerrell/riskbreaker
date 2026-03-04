<script setup lang="ts">
import { getScale } from '@/lib/helpers/screen.helper';
import { EnemyDef } from '@/state/battle/useBattle';
import { PartyMember } from '@/state/useParty';
import MenuBox from '@/ui/components/MenuBox.vue';
type Props = {
    active: boolean;
    forecast: { unit: EnemyDef | PartyMember; path: string };
};

const { forecast, active = false } = defineProps<Props>();
</script>

<template>
    <MenuBox
        class="text-standard-md relative inset-[unset] grow-0 -skew-x-12 bg-bg text-white shadow-bg"
        :poles="!active ? { NW: true } : { NW: true, SE: true }"
        :class="active && 'bg-rose-900'"
        :style="{
            width: active ? `${36 * getScale()}px` : `${24 * getScale()}px`,
            height: active ? `${18 * getScale()}px` : `${12 * getScale()}px`,
            boxShadow: '-2px 0 10px 5px var(--bg)',
        }"
    >
        <div
            v-if="active"
            class="text-standard-sm absolute -bottom-1 skew-x-12 whitespace-nowrap text-amber-300"
            :style="{ right: 'calc(100% + 1rem)' }"
        >
            Unit Initiative
        </div>
        <div class="absolute inset-0 overflow-hidden">
            <img
                :src="forecast.path"
                :style="{
                    height: '100%',
                }"
                class="skew-x-12"
            />
        </div>
    </MenuBox>
</template>

<style scoped>
img {
    image-rendering: pixelated; /* Universal support since 2021   */
}
</style>
