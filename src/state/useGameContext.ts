import { gameEnum } from '@/lib/enum/game.enum';
import { BattleScene } from '@/game/scenes/battle.scene';
import { LiteLoader } from '@/resource/loader';
import { Color, DisplayMode, Engine } from 'excalibur';
import { TitleScene } from '@/game/scenes/title.scene';
import { makeState } from './Observable';
import { initControls, provideInput } from '@/game/input/useInput';
import { ref } from 'vue';
import { TestScene } from '@/game/scenes/test.scene';
import { ExplorationScene } from '@/game/scenes/exploration.scene';
import { useSFX } from './useSFX';

const loader = new LiteLoader();

type AvailableScenes = 'battle' | 'title' | 'test';
const paused = ref(false);
const game = makeState<Engine<AvailableScenes>>();
const explorationEngine = makeState<Engine<'exploration'>>();
const battleEngine = makeState<Engine<'battle'>>();
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
            backgroundColor: Color.Transparent,
            displayMode: DisplayMode.FitContainerAndZoom,
            suppressPlayButton: true,
            antialiasing: false,
            scenes: {
                battle: {
                    scene: BattleScene,
                    loader: loader,
                },
                title: {
                    scene: TitleScene,
                    loader: loader,
                },
                test: {
                    scene: TestScene,
                    loader: loader,
                },
            },
        }),
    );

    initControls(game.value);

    provideInput();

    return game.value;
}

export async function initExplorationEngine() {
    explorationEngine.set(
        new Engine<'exploration'>({
            canvasElementId: 'exploration-canvas',
            pixelArt: true,
            pixelRatio: 2,
            width: gameEnum.nativeWidth,
            height: gameEnum.nativeHeight,
            enableCanvasTransparency: true,
            backgroundColor: Color.Transparent,
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

    return explorationEngine.value.start(new LiteLoader());
}

export function initBattleEngine() {
    battleEngine.set(
        new Engine<'battle'>({
            canvasElementId: 'battle-canvas',
            pixelArt: true,
            pixelRatio: 1,
            width: gameEnum.nativeWidth,
            height: gameEnum.nativeHeight,
            enableCanvasTransparency: true,
            backgroundColor: Color.Transparent,
            displayMode: DisplayMode.FitContainerAndZoom,
            suppressPlayButton: true,
            antialiasing: false,
            scenes: {
                battle: {
                    scene: BattleScene,
                    loader: loader,
                },
            },
        }),
    );

    battleEngine.value.start(new LiteLoader());
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
    game,
    explorationEngine,
    battleEngine,
    hasFrame,
    paused,
    inputType,
    togglePause,
};
export type GameContext = typeof gameContext;

export function useGameContext() {
    return gameContext;
}
