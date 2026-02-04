import { gameEnum } from '@/lib/enum/game.enum';
import { LiteLoader } from '@/resource/loader';
import { Color, DisplayMode, Engine } from 'excalibur';
import { TitleScene } from '@/game/scenes/title.scene';
import { makeState } from './Observable';
import { initControls, provideInput } from '@/game/input/useInput';
import { ref } from 'vue';
import { useSFX } from './useSFX';
import { ExplorationScene } from '@/game/scenes/exploration.scene';
import { colors } from '@/lib/enum/colors.enum';

const loader = new LiteLoader();

type AvailableScenes = 'exploration';
const paused = ref(false);
const game = makeState<Engine<AvailableScenes>>();
const ready = ref(false);
const activeView = ref('');
const activeScript = ref<null | string>();
const hasFrame = makeState<boolean>(true);
const inputType = makeState<'keyboard' | 'controller'>('controller');

export function initGame() {
    game.set(
        new Engine<AvailableScenes>({
            canvasElementId: 'main-canvas',
            width: gameEnum.nativeWidth,
            height: gameEnum.nativeHeight,
            pixelArt: true,
            pixelRatio: 2,
            enableCanvasTransparency: true,
            backgroundColor: Color.fromHex(colors.bg),
            displayMode: DisplayMode.FitContainerAndZoom,
            suppressPlayButton: true,
            antialiasing: false,
            scenes: {
                exploration: {
                    scene: ExplorationScene,
                    loader: loader,
                },
            },
        }),
    );

    initControls(game.value);

    provideInput();

    return game.value;
}

let storedTimescale = -1;
const { bufferAudioCb } = useSFX();
function togglePause() {
    paused.value = !paused.value;

    if (paused.value) {
        storedTimescale = game.value.timescale;
        game.value.timescale = 0;
        return Promise.resolve();
    } else {
        return bufferAudioCb('menuBack', () => {
            game.value.timescale = storedTimescale;
        });
    }
}

export const gameContext = {
    activeView,
    activeScript,
    game,
    ready,
    hasFrame,
    paused,
    inputType,
    togglePause,
};
export type GameContext = typeof gameContext;

export function useGameContext() {
    return gameContext;
}
