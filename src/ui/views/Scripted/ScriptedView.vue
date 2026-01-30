<script setup lang="ts">
import { useRoute } from 'vue-router';
import BattleScreen from '../BattleScreen/BattleScreen.vue';
import { scenes, ScriptedEvent } from './scenes';
import { useGameContext } from '@/state/useGameContext';
import { onMounted, ref } from 'vue';
import { scriptCharacterAnimation } from './scripts/characterAnimation';
import { scriptDialogue } from './scripts/dialogue';

const scene = scenes[useRoute().query.scene as string];
const { explorationEngine, battleEngine } = useGameContext();

const battleScreen = ref<InstanceType<typeof BattleScreen>>();
const readyPromises: Promise<unknown>[] = [];
onMounted(() => {
    switch (scene.type) {
        case 'exploration':
            readyPromises.push(explorationEngine.value.goToScene('exploration'));
            break;
        case 'battle':
            readyPromises.push(
                battleEngine.value.goToScene('battle').then(() => {
                    scene.actors.forEach((actor) => {
                        const pos = actor.pos;
                        battleEngine.value.currentScene.add(actor);
                        actor.pos = pos;
                    });
                    battleScreen.value.setVisible(true);
                }),
            );
            break;
    }

    Promise.all(readyPromises).then(async () => {
        while (scene.events.length > 0) {
            const event = scene.events.shift();
            await handleEvent(event);
        }
    });
});

function handleEvent(event: ScriptedEvent) {
    return new Promise<void>((resolve) => {
        setTimeout(async () => {
            switch (event.type) {
                case 'characterAnimation':
                    await scriptCharacterAnimation(event);
                    break;
                case 'dialogue':
                    await scriptDialogue(event);
                    break;
            }

            resolve();
        }, event.preDelay ?? 0);
    });
}
</script>

<template>
    <div class="relative size-full">
        <BattleScreen ref="battleScreen" />
    </div>
</template>
