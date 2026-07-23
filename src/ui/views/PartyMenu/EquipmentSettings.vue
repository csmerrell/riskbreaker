<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { vec } from 'excalibur';
import MenuBox from '@/ui/components/MenuBox.vue';
import { resources } from '@/resource';
import { getScale } from '@/lib/helpers/screen.helper';
import { usePartyMenu } from './usePartyMenu';
import { equipment as equipmentDb } from '@/db/static/equipment';
import { EquipmentMeta } from '@/db/static/types/Equipment';
import ControlIconSprite from '@/ui/components/ControlIconSprite.vue';
import {
    captureControls,
    registerInputListener,
    unCaptureControls,
    unregisterInputListener,
} from '@/game/input/useInput';
import { useMenuEdit } from './useMenuEdit';

type Props = {
    focused?: boolean;
};

const { focused = false } = defineProps<Props>();
const size = ref(vec(resources.image.misc.forestShowcase.width * getScale(), 0));

const { selectedMember } = usePartyMenu();

const emptyEquip: EquipmentMeta = {
    name: '[None]',
    stat: {},
    slots: [],
};
const equipment = computed(() => {
    const { equipment: eqKeys } = selectedMember.value;
    return {
        mainHand: eqKeys.mainHand ? equipmentDb[eqKeys.mainHand] : { ...emptyEquip },
        offHand: eqKeys.offHand ? equipmentDb[eqKeys.offHand] : { ...emptyEquip },
        head: eqKeys.head ? equipmentDb[eqKeys.head] : { ...emptyEquip },
        body: eqKeys.body ? equipmentDb[eqKeys.body] : { ...emptyEquip },
        accessory1: eqKeys.accessory1 ? equipmentDb[eqKeys.accessory1] : { ...emptyEquip },
        accessory2: eqKeys.accessory2 ? equipmentDb[eqKeys.accessory2] : { ...emptyEquip },
    };
});

const isFocused = computed(() => focused);
const { editing } = useMenuEdit(isFocused);
</script>

<template>
    <div class="flex h-full flex-row pb-4">
        <div class="flex flex-col gap-2">
            <div class="relative h-full" :style="{ width: `${size.x}px` }">
                <div
                    class="absolute left-14 z-20 leading-[1px] text-white"
                    :class="
                        focused
                            ? 'text-standard-xl translate-y-1'
                            : 'text-standard-lg translate-y-0.5'
                    "
                >
                    <div class="relative size-full">
                        <div
                            class="absolute inset-x-0 top-1/2 z-10 -ml-3 -mr-2 h-5 -translate-y-1/2 bg-bg-dark opacity-70"
                        />
                        <div class="invisible">Equipment</div>
                        <div class="absolute left-0 top-0 z-20">Equipment</div>
                    </div>
                </div>
                <MenuBox
                    :poles="{ NW: true, NE: true, SW: true, SE: true }"
                    class="ml-4 border-2 bg-bg-dark text-white"
                    :style="focused && { boxShadow: 'inset 0 0 0.5rem 0.25rem var(--yellow-700)' }"
                >
                    <div
                        v-if="focused && !editing"
                        class="absolute -top-1 right-6 flex flex-row items-start gap-2"
                    >
                        <ControlIconSprite command="confirm" size="xs" />
                        <div
                            class="text-standard-md relative bottom-1 h-auto bg-bg-dark font-bold leading-5 text-white"
                        >
                            <div
                                class="absolute inset-0 z-10 -mb-2 -mr-2 ml-[-0.67rem] bg-bg opacity-70"
                            />
                            <div class="invisible">Edit</div>
                            <div class="absolute left-0 top-0 z-20">Edit</div>
                        </div>
                    </div>
                    <table class="border-separate border-spacing-x-4 border-spacing-y-2 p-4">
                        <tbody>
                            <tr>
                                <td>
                                    <div class="pr-2 font-bold text-rose-700">Main Hand:</div>
                                </td>
                                <td>
                                    <div class="font-bold">
                                        {{ equipment.mainHand.name }}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div class="pr-2 font-bold text-rose-700">Off Hand:</div>
                                </td>
                                <td>
                                    <div class="font-bold">
                                        {{ equipment.offHand.name }}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div class="pr-2 font-bold text-rose-700">Head:</div>
                                </td>
                                <td>
                                    <div class="font-bold">
                                        {{ equipment.head.name }}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div class="pr-2 font-bold text-rose-700">Body:</div>
                                </td>
                                <td>
                                    <div class="font-bold">
                                        {{ equipment.body.name }}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div class="pr-2 font-bold text-rose-700">Accessory:</div>
                                </td>
                                <td>
                                    <div class="font-bold">
                                        {{ equipment.accessory1.name }}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div class="pr-2 font-bold text-rose-700">Accessory:</div>
                                </td>
                                <td>
                                    <div class="font-bold">
                                        {{ equipment.accessory2.name }}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </MenuBox>
            </div>
        </div>
    </div>
</template>
