<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import MenuBox from '@/ui/components/MenuBox.vue';
import HexIcon from './HexIcon.vue';

import { MenuElement, useMenuElement } from '@/state/menus/useMenuElement';
import { useClock } from '@/state/deprecated/useClock';

import type { StrategemActor } from '@/game/actors/StrategemActor/StrategemActor';
import type { StrategemAction } from '@/game/actions/StrategemAction';
import HealthReadout from './HealthReadout.vue';
import { useCrossHotbar } from './state/useCrossHotbar';
import { useBattleParty } from '@/state/deprecated/useBattleParty';
import { useActionBus } from '@/state/deprecated/useActionBus';

export type ActorIntent = {
    actionId?: string;
    targetIds?: number[];
    targets?: StrategemActor[];
    action?: StrategemAction;
};

type Props = {
    unit?: StrategemActor;
    idx?: number;
};

const { unit, idx } = defineProps<Props>();

const intent = ref<ActorIntent>({});
const action = computed(() => intent.value?.action);
const actionName = computed(() => action.value?.name.replace(/([a-z])([A-Z])/g, '$1 $2') ?? '');
const show = ref(true);

const el = ref<MenuElement>();

function init() {
    const { tick } = useClock();
    tick.subscribe(() => {
        delete intent.value;
        intent.value = unit.getIntent();
    });

    const { focusedElement, composeMenuElement: useMenuElementComposition } = useMenuElement();
    const { focused, focus, unfocus } = useMenuElementComposition(el);

    const deathListener = tick.subscribe(() => {
        if (unit.isDead()) {
            setTimeout(() => {
                show.value = false;
                if (focused.value) {
                    focusedElement.value = null;
                }
                el.value.beforeUnmount();
            }, 500);
            tick.unsubscribe(deathListener);
        }
    });

    const { activeActor } = useBattleParty();
    watch(activeActor, () => {
        if (activeActor.value.id === unit.id) {
            focus();
            startIntentPulse();
        } else {
            unfocus();
            cancelIntentPulse();
        }
    });

    return focused;
}

const intentPulseInterval = ref<NodeJS.Timeout | null>(null);
function startIntentPulse() {
    intentPulseInterval.value = setInterval(() => {
        const { isWaitMode } = useActionBus();
        if (!isWaitMode()) {
            cancelIntentPulse();
            return;
        }
        unit.pulseIntent();
    }, 2000);
}

function cancelIntentPulse() {
    if (intentPulseInterval.value) {
        unit.killIntentPulse();
        clearInterval(intentPulseInterval.value);
        intentPulseInterval.value = null;
    }
}

const focused = unit ? init() : ref(false);
watch(focused, () => {
    const { currentHotbar } = useCrossHotbar();
    const unitHotbar = unit.getHotbar();
    if (focused.value && unitHotbar) {
        currentHotbar.value = unit.getHotbar();
    } else {
        if (!currentHotbar.value) return;
        if (currentHotbar.value.id === unit.getHotbar()?.id) {
            currentHotbar.value = null;
        }
    }
});

defineExpose({ el });
</script>

<template>
    <div
        v-if="unit === undefined || unit?.alignment === 'party' || show"
        ref="el"
        class="intent text-standard-md relative h-[54px] text-white"
        :class="`${unit ? 'w-[150px]' : 'invisible shrink w-0'} ${focused ? 'w-[200px] h-[62px]' : ''} ${focused && unit.alignment === 'party' ? 'translate-y-[-8px]' : ''}`"
        :menu-item="unit ? 'menu-item' : null"
        :has-focus="focused ? 'focused' : null"
        :menu-entry="
            unit && idx === 0
                ? unit.alignment === 'party'
                    ? 'menu_down,menu_left,menu_right,confirm'
                    : 'menu_up'
                : null
        "
    >
        <template v-if="unit">
            <MenuBox :focused class="absolute inset-0 z-20">
                <HealthReadout :unit :focused />
                <HexIcon
                    v-if="unit.hex"
                    :hex="unit.hex"
                    class="absolute"
                    :focused
                    :class="
                        unit.alignment === 'party'
                            ? 'left-0 top-1'
                            : 'right-0 bottom-1 top-[95%] -scale-x-100 -translate-x-100'
                    "
                />

                <div
                    class="context z-100 absolute inset-0 flex flex-col items-center justify-center"
                >
                    <div>{{ unit?.name }}</div>
                    <div class="text-standard-sm">{{ actionName }}</div>
                    <div class="h-1" />
                </div>
            </MenuBox>
        </template>
    </div>
</template>

<style scoped></style>
