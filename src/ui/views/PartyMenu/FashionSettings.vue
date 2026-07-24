<script setup lang="ts">
import { fashionLabels } from '@/resource/image/units';
import { usePartyMenu } from './usePartyMenu';
import { computed, ComputedRef, ref, watch } from 'vue';
import ControlIconSprite from '@/ui/components/ControlIconSprite.vue';
import { useMenuEdit } from './useMenuEdit';
import { registerInputListener, unregisterInputListener } from '@/game/input/useInput';
import FashionItem from './FashionItem.vue';

type Props = {
    focused?: boolean;
};

const { focused = false } = defineProps<Props>();

const { selectedMember } = usePartyMenu();

const isFocused = computed(() => focused);
const { editing, addCleanupCb } = useMenuEdit(isFocused);
export type FashionItemKey = 'hat' | 'hair' | 'armor';
export type FashionMenuItem = { key: FashionItemKey; label: string; value: ComputedRef<string> };
const editTarget = ref(0);
const fashionItems: FashionMenuItem[] = [
    {
        key: 'hat',
        label: 'Hat',
        value: computed(() => {
            if (selectedMember.value.appearance.hat) {
                return fashionLabels.hat[selectedMember.value.appearance.hat];
            } else {
                return '[None - Show Equipped]';
            }
        }),
    },
    {
        key: 'hair',
        label: 'Hair',
        value: computed(() => {
            if (selectedMember.value.appearance.hair) {
                return fashionLabels.hair[selectedMember.value.appearance.hair];
            } else {
                return '[None - Show Equipped]';
            }
        }),
    },
    {
        key: 'armor',
        label: 'Body',
        value: computed(() => {
            if (selectedMember.value.appearance.armor) {
                return fashionLabels.armor[selectedMember.value.appearance.armor];
            } else {
                return '[None - Show Equipped]';
            }
        }),
    },
];
watch(editing, () => {
    if (editing.value) {
        const listeners = [
            registerInputListener(() => {
                editTarget.value += 1;
                if (editTarget.value >= fashionItems.length) {
                    editTarget.value = 0;
                }
            }, ['movement_down', 'menu_down']),
            registerInputListener(() => {
                editTarget.value -= 1;
                if (editTarget.value < 0) {
                    editTarget.value = fashionItems.length - 1;
                }
            }, ['movement_up', 'menu_up']),
        ];

        addCleanupCb(() => {
            listeners.forEach((l) => unregisterInputListener(l));
        });
    }
});
</script>

<template>
    <div class="flex grow flex-col gap-2 px-4 text-black">
        <div class="text-white" :class="focused ? 'text-standard-xl' : 'text-standard-lg py-1.5'">
            <div class="relative inline-block">
                Fashion
                <div
                    v-if="focused && !editing"
                    class="absolute left-full top-0 flex flex-row items-center gap-2 pl-4"
                >
                    <ControlIconSprite command="confirm" size="xs" />
                    <div
                        class="text-standard-md relative bottom-1 h-auto bg-bg pt-1 font-bold leading-5 text-white"
                    >
                        Edit
                    </div>
                </div>
            </div>
        </div>
        <div
            class="relative -left-12 skew-x-[42deg] overflow-hidden border-2 border-yellow-700 bg-bg-dark py-2 text-white"
            :style="{
                width: 'calc(100% + 2rem)',
                ...(focused && { boxShadow: 'inset 0 0 0.5rem 0.25rem var(--yellow-700)' }),
            }"
        >
            <div class="flex skew-x-[-42deg] flex-col items-start py-2 pl-4">
                <FashionItem
                    v-for="(item, idx) in fashionItems"
                    :key="item.key"
                    :item
                    :focused="editing && fashionItems[editTarget].key === item.key"
                    :style="{ marginLeft: `${idx * 2}rem` }"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.fashion-table td {
    font-weight: bold;
}
</style>
