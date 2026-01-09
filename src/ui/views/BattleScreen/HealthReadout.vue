<script setup lang="ts">
import { HealthComponent } from '@/game/actors/StrategemActor/components/HealthComponent';
import { StrategemActor } from '@/game/actors/StrategemActor/StrategemActor';
import { useClock } from '@/state/deprecated/useClock';
import { onMounted, ref } from 'vue';

type Props = {
    unit: StrategemActor;
    focused: boolean;
};

const { unit, focused } = defineProps<Props>();

const currentHealth = ref(0);
const maxHealth = ref(0);
const healthBar = ref<HTMLDivElement>();

const initHealth = () => {
    const healthComp = unit.getComponent(HealthComponent);
    if (!healthComp) {
        setTimeout(() => {
            initHealth();
        }, 25);
        return;
    }

    maxHealth.value = healthComp.maxHealth();
    currentHealth.value = healthComp.currentHealth.value;
    healthComp.currentHealth.subscribe(() => {
        currentHealth.value = healthComp.currentHealth.value;
        healthBar.value.style.width = `calc(${100 * (currentHealth.value / maxHealth.value)}% - 2px)`;
    });

    if (healthBar.value) {
        healthBar.value.style.width = `calc(${100 * (currentHealth.value / maxHealth.value)}% - 2px)`;
    }

    const { tick } = useClock();
    tick.subscribe(() => {
        const healthComp = unit.getComponent(HealthComponent);
        maxHealth.value = healthComp.maxHealth();
    });
};

onMounted(() => {
    initHealth();
});
</script>

<template>
    <div
        class="health-bar absolute bottom-0 left-[18px] right-px h-full overflow-hidden"
        :class="focused ? 'after:bg-bg-alt' : 'after:bg-bg'"
    >
        <div
            ref="healthBar"
            class="health-fill absolute bottom-px left-px h-[12px] transition-all duration-500"
        />
    </div>
    <div
        class="health-text text-standard-sm absolute bottom-px left-1/2 z-10 -translate-x-1/2 whitespace-nowrap px-[2px] leading-[90%]"
        :class="focused ? 'bg-bg-alt' : 'bg-bg'"
    >
        {{ currentHealth }}/{{ maxHealth }}
    </div>
</template>

<style scoped>
.health-bar::after {
    content: '';
    display: block;
    position: absolute;
    left: 0px;
    right: 1px;
    bottom: 3px;
    height: 12px;
    border-radius: 0 0 100% 100% / 0 0 100% 100%;
    border-bottom-left-radius: 0;
    z-index: 1;
}

.health-fill {
    background-color: #e04a4a;
}
</style>
