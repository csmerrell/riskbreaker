<script setup lang="ts">
import { computed, ref } from 'vue';
import { vec } from 'excalibur';
import MenuBox from '@/ui/components/MenuBox.vue';
import { resources } from '@/resource';
import { getScale } from '@/lib/helpers/screen.helper';
import { useSelectedCharacter } from './useSelectedCharacter';
import { equipment as equipmentDb } from '@/db/static/equipment';
import { EquipmentMeta } from '@/db/static/types/Equipment';

type Props = {
    focused?: boolean;
};

const { focused = false } = defineProps<Props>();
const size = ref(vec(resources.image.misc.forestShowcase.width * getScale(), 0));

const { selectedMember } = useSelectedCharacter();

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
</script>

<template>
    <div class="flex h-full flex-row pb-4">
        <div class="flex flex-col gap-2">
            <div class="relative h-full" :style="{ width: `${size.x}px` }">
                <div
                    class="absolute left-12 z-20 -translate-y-1/3 bg-bg px-2 leading-[1px] text-white"
                    :class="focused ? 'text-standard-xl' : 'text-standard-lg'"
                >
                    Equipment
                </div>
                <MenuBox
                    :poles="{ NW: true, NE: true, SW: true, SE: true }"
                    class="left-4 z-10 bg-bg-dark"
                >
                    <table class="border-separate border-spacing-x-4 border-spacing-y-2 p-4">
                        <tbody>
                            <tr>
                                <td>
                                    <div class="pr-2 font-bold text-rose-700">Main Hand:</div>
                                </td>
                                <td>
                                    <div class="font-bold text-white">
                                        {{ equipment.mainHand.name }}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div class="pr-2 font-bold text-rose-700">Off Hand:</div>
                                </td>
                                <td>
                                    <div class="font-bold text-white">
                                        {{ equipment.offHand.name }}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div class="pr-2 font-bold text-rose-700">Head:</div>
                                </td>
                                <td>
                                    <div class="font-bold text-white">
                                        {{ equipment.head.name }}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div class="pr-2 font-bold text-rose-700">Body:</div>
                                </td>
                                <td>
                                    <div class="font-bold text-white">
                                        {{ equipment.body.name }}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div class="pr-2 font-bold text-rose-700">Accessory:</div>
                                </td>
                                <td>
                                    <div class="font-bold text-white">
                                        {{ equipment.accessory1.name }}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div class="pr-2 font-bold text-rose-700">Accessory:</div>
                                </td>
                                <td>
                                    <div class="font-bold text-white">
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
