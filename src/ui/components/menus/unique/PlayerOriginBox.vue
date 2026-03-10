<script setup lang="ts">
import { computed } from 'vue';
import MenuBox from '../../MenuBox.vue';
import KeySprite from '../../KeySprite.vue';
import ControlIconSprite from '../../ControlIconSprite.vue';
type PlayerOriginBoxProps = {
    origin: 'astrologian' | 'riskbreaker';
};

const { origin } = defineProps<PlayerOriginBoxProps>();
const body = computed(() => {
    switch (origin) {
        case 'astrologian':
            return {
                origin: 'Astrologian',
                dialogueFlavor: 'Academic',
                message:
                    'The stars flicker and fade. Your conviction to unearth the cause does not.',
                startingWeapon: 'Tome',
                startingSkills: ['Starflash', 'Compress'],
                uniquePassive: 'Divination',
            };
        case 'riskbreaker':
        default:
            return {
                origin: 'Riskbreaker',
                dialogueFlavor: 'Decisive',
                message: 'Darkness creeps tighter by the night. You will stop its advance.',
                startingWeapon: 'Sword & Shield',
                startingSkills: ['Shield Bash', 'Push'],
                uniquePassive: 'Challenge the Odds',
            };
    }
});

const messageSplit = computed(() =>
    body.value.message
        .split('.')
        .filter((m) => m !== '')
        .map((m) => `${m}.`),
);
</script>

<template>
    <MenuBox
        class="inset-[unset] flex w-[500px] flex-col items-start justify-center rounded-md border-[3px] border-amber-800 bg-bg text-white shadow-lg shadow-slate-950"
    >
        <div class="relative size-full p-3">
            <div
                class="text-standard-sm absolute right-4 top-4 flex flex-row gap-2 text-amber-300 opacity-70"
            >
                <ControlIconSprite command="confirm" size="xs" /> Select
            </div>
            <div class="flex flex-col border-b border-yellow-700 pb-4">
                <strong class="text-standard-lg text-rose-700">{{ body.origin }}</strong>
                <div class="flex flex-col gap-2 pr-4 leading-4">
                    <div v-for="message in messageSplit" :key="message">
                        {{ message }}
                    </div>
                </div>
            </div>
            <div class="pt-4">
                <table>
                    <tbody>
                        <tr>
                            <td
                                class="relative bottom-[2px] py-1 pr-4 font-bold leading-[.5rem] text-rose-700"
                            >
                                Dialogue Flavor:
                            </td>
                            <td class="text-standard-md py-1">{{ body.dialogueFlavor }}</td>
                        </tr>
                        <tr>
                            <td
                                class="relative bottom-[2px] py-1 pr-4 font-bold leading-[.5rem] text-rose-700"
                            >
                                Starting Weapon:
                            </td>
                            <td class="text-standard-md py-1">{{ body.startingWeapon }}</td>
                        </tr>
                        <tr>
                            <td
                                class="relative bottom-[2px] py-1 pr-4 font-bold leading-[.5rem] text-rose-700"
                            >
                                Unique Passive
                            </td>
                            <td class="text-standard-md py-1">{{ body.uniquePassive }}</td>
                        </tr>
                        <tr>
                            <td
                                class="relative bottom-[2px] pb-1 pr-4 pt-2 align-top font-bold leading-[.5rem] text-rose-700"
                            >
                                Starting Skills:
                            </td>
                            <td class="text-standard-md py-1">
                                <div class="flex flex-col gap-1">
                                    <span v-for="(skill, idx) in body.startingSkills" :key="skill">
                                        {{
                                            `${skill}${idx < body.startingSkills.length - 1 ? ',' : ''}`
                                        }}
                                    </span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </MenuBox>
</template>
