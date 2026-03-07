import { gameEnum } from '@/lib/enum/game.enum';
import { LiteLoader } from '@/resource/loader';
import { Color, DisplayMode, Engine } from 'excalibur';
import { makeState } from './Observable';
import { initControls, provideInput } from '@/game/input/useInput';
import { ref } from 'vue';
import { useSFX } from './useSFX';
import { ExplorationScene } from '@/game/scenes/exploration.scene';
import { HeadshotScene } from '@/game/scenes/headshot.scene';
import { colors } from '@/lib/enum/colors.enum';

const loader = new LiteLoader();

type AvailableScenes = 'exploration';
type HeadshotScenes = 'headshot';
const paused = ref(false);
const game = makeState<Engine<AvailableScenes>>();
const headshotEngine = makeState<Engine<HeadshotScenes>>();
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
            pixelRatio: 4,
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

    headshotEngine.set(
        new Engine<HeadshotScenes>({
            canvasElementId: 'headshot-canvas',
            width: gameEnum.nativeWidth,
            height: gameEnum.nativeHeight,
            pixelArt: true,
            pixelRatio: 4,
            backgroundColor: Color.Transparent,
            displayMode: DisplayMode.Fixed,
            suppressPlayButton: true,
            antialiasing: false,
            scenes: {
                headshot: {
                    scene: HeadshotScene,
                },
            },
        }),
    );
    headshotEngine.value.goToScene('headshot');

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
    headshotEngine,
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
