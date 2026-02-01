<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';

import MenuBox from '../MenuBox.vue';

import { useSettings } from '@/state/useSettings';
import { getScreenCoords } from '@/lib/helpers/screen.helper';
import { CharacterLine, useDialogue } from '@/state/useDialogue';
import {
    captureControls,
    registerInputListener,
    unCaptureControls,
    unregisterInputListener,
} from '@/game/input/useInput';

type Props = {
    line: CharacterLine;
};

const { line } = defineProps<Props>();
const { actor: anchorActor, xBias = 'right', yBias = 'top' } = line;
const messages = ref([...line.messages]);

const posBase = getScreenCoords(anchorActor.pos);
const leftAnchor = ref({ left: `${posBase.x + 48}px` });
const rightAnchor = ref({ right: `${window.innerWidth - posBase.x + 48}px` });
const topAnchor = ref({ top: `${posBase.y + 16}px` });
const bottomAnchor = ref({ bottom: `${window.innerHeight - posBase.y + 36}px` });

const biases = ref({
    x: xBias,
    y: yBias,
});

const alignmentStyles = computed(() => {
    const xAlign = biases.value.x === 'left' ? rightAnchor.value : leftAnchor.value;
    const yAlign = biases.value.y === 'top' ? bottomAnchor.value : topAnchor.value;
    return {
        ...xAlign,
        ...yAlign,
    };
});

const intervalMs = ref(100);

const message = computed(() => messages.value[0] ?? { text: '' });

const letterProgress = ref(message.value.start ?? 0);
const procMessage = computed(() => message.value.text.slice(0, letterProgress.value));
let scaleMod: number[] = [];
function progressMessage() {
    const textSpeed = useSettings().settingsState.value.textSpeed;
    intervalMs.value = useDialogue().getLetterTiming();
    if (message.value.tempo?.length > 0 && letterProgress.value === message.value.tempo[0].start) {
        const tempo = message.value.tempo.shift();
        scaleMod = Array.from({ length: tempo.length }, () => tempo.scale);
    }
    const interval = intervalMs.value * (1 / (scaleMod.shift() ?? 1));
    if (textSpeed === 'instant') {
        letterProgress.value = message.value.text.length;
    } else {
        setTimeout(() => {
            if (
                message.value.pauses?.length > 0 &&
                message.value.pauses[0].idx === letterProgress.value
            ) {
                setTimeout(() => {
                    progressMessage();
                }, message.value.pauses.shift().duration);
            } else if (letterProgress.value < message.value.text.length) {
                letterProgress.value += 1;
                progressMessage();
            }
        }, interval);
    }

    if (letterProgress.value > 2 || message.value.text.length < 3) {
        registerInputListeners();
    }
}
const animationDone = computed(() => letterProgress.value === message.value.text.length);
const showPrompt = ref(false);
const inputDebounce = ref(0);
watch(animationDone, () => {
    if (!animationDone.value) {
        showPrompt.value = false;
    } else {
        inputDebounce.value = Date.now();
        if (message.value.autoAdvance) {
            setTimeout(() => {
                if (animationDone.value) {
                    nextMessage();
                }
            }, message.value.autoAdvance);
        } else {
            setTimeout(() => {
                if (animationDone.value) {
                    showPrompt.value = true;
                }
            }, 2000);
        }
    }
});

const boundingRef = ref<InstanceType<typeof MenuBox>>();
watch(boundingRef, () => {
    const { left, right, top, bottom } = boundingRef.value.$el.getBoundingClientRect();
    if (left < 0) {
        biases.value = {
            ...biases.value,
            x: 'right',
        };
    } else if (right > window.innerWidth) {
        biases.value = {
            ...biases.value,
            x: 'left',
        };
    }

    if (bottom > window.innerHeight) {
        biases.value = {
            ...biases.value,
            y: 'top',
        };
    } else if (top < 0) {
        biases.value = {
            ...biases.value,
            y: 'bottom',
        };
    }

    if (letterProgress.value === 0) {
        progressMessage();
    }
});

const listeners: string[] = [];
const emit = defineEmits(['done']);
function registerInputListeners() {
    captureControls();
    listeners.push(
        registerInputListener(() => {
            if (letterProgress.value < message.value.text.length) {
                letterProgress.value = message.value.text.length;
                showPrompt.value = true;
            } else if (Date.now() - inputDebounce.value > 250) {
                nextMessage();
            } else {
                inputDebounce.value = 0;
            }
        }, ['confirm', 'cancel']),
    );
}

function nextMessage() {
    messages.value = [...messages.value.slice(1)];
    letterProgress.value = message.value.start ?? 0;
    showPrompt.value = false;
    nextTick(() => {
        progressMessage();
    });
    unregisterInputListeners();
    if (messages.value.length === 0) {
        emit('done');
    }
}

function unregisterInputListeners() {
    listeners.forEach((id) => {
        unregisterInputListener(id);
    });
    unCaptureControls();
}

const classes = ref(
    'text-standard-md text-black; inset-[unset] flex items-center justify-center rounded-md border-[3px] border-amber-800 bg-paper px-8 pb-3 pt-4 shadow-lg shadow-teal-950',
);
</script>

<template>
    <div class="fixed inset-0 z-50">
        <div class="relative size-full">
            <MenuBox ref="boundingRef" :class="`${classes} invisible`" :style="alignmentStyles">
                {{ message.text }}
            </MenuBox>
            <MenuBox :class="classes" :style="alignmentStyles">
                <div>
                    <span v-if="message.text.startsWith('. . .')">
                        <b>{{ procMessage.slice(0, 5) }}</b>
                        {{ procMessage.slice(5) }}
                    </span>
                    <span v-else>{{ procMessage }}</span>
                    <Transition name="fade">
                        <span
                            v-if="showPrompt"
                            class="picon-arrow-bar-right fade-pulse absolute bottom-[-6px] right-1 scale-y-75 text-lg opacity-80"
                        />
                    </Transition>
                </div>
            </MenuBox>
        </div>
    </div>
</template>

<style>
.fade-pulse {
    transition: opacity;
    animation: fade-pulse 4s infinite;
}
@keyframes fade-pulse {
    0% {
        opacity: 1;
    }
    45% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
    55% {
        opacity: 1;
    }
    100% {
        opacity: 1;
    }
}
</style>
