<script setup lang="ts">
import { computed, ref } from 'vue';
import { vec } from 'excalibur';
import MenuBox from '@/ui/components/MenuBox.vue';
import { resources } from '@/resource';
import { getScale } from '@/lib/helpers/screen.helper';
import { usePartyMenu } from './usePartyMenu';
import { equipment as equipmentDb } from '@/db/static/equipment';
import { EquipmentMeta } from '@/db/static/types/Equipment';
import { useMenuEdit } from './useMenuEdit';
import MenuOverlayTitle from '@/ui/components/MenuOverlayTitle.vue';
import MenuOverlayButtonPrompt from '@/ui/components/MenuOverlayButtonPrompt.vue';

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
                <MenuOverlayTitle label="Equipment" :focused class="left-14" />
                <MenuBox
                    :poles="{ NW: true, NE: true, SW: true, SE: true }"
                    class="ml-4 border-2 bg-bg-dark text-white"
                    :style="focused && { boxShadow: 'inset 0 0 0.5rem 0.25rem var(--yellow-700)' }"
                >
                    <MenuOverlayButtonPrompt
                        label="Edit"
                        command="confirm"
                        :focused
                        class="right-6"
                    />

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
