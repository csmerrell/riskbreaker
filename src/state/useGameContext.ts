import { gameEnum } from '@/lib/enum/game.enum';
import { BattleScene } from '@/game/scenes/battle.scene';
import { LiteLoader } from '@/resource/loader';
import { Color, DisplayMode, Engine, ImageFiltering } from 'excalibur';
import { TitleScene } from '@/game/scenes/title.scene';
import { makeState } from './Observable';
import { initControls, provideInput } from '@/game/input/useInput';
import { ref } from 'vue';
import { TestScene } from '@/game/scenes/test.scene';
import { ExplorationScene } from '@/game/scenes/exploration.scene';
import { useSFX } from './useSFX';
import { CampScene } from '@/game/scenes/camp.scene';

const loader = new LiteLoader();

type AvailableScenes = 'battle' | 'title' | 'test';
const paused = ref(false);
const game = makeState<Engine<AvailableScenes>>();
const explorationEngine = makeState<Engine>();
const battleEngine = makeState<Engine>();
const campEngine = makeState<Engine>();
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

type EngineKey = 'exploration' | 'battle' | 'camp';
function getEngine(key: EngineKey) {
    switch (key) {
        case 'battle':
            return { engine: battleEngine, scene: BattleScene };
        case 'exploration':
            return { engine: explorationEngine, scene: ExplorationScene };
        case 'camp':
            return { engine: campEngine, scene: CampScene };
        default:
            throw new Error(`Engine [${key}] does not exist`);
    }
}

export function initEngine(key: EngineKey) {
    const { engine, scene } = getEngine(key);
    engine.set(
        new Engine({
            canvasElementId: `${key}-canvas`,
            pixelArt: true,
            pixelRatio: 3,
            width: gameEnum.nativeWidth,
            height: gameEnum.nativeHeight,
            enableCanvasTransparency: true,
            backgroundColor: Color.Transparent,
            displayMode: DisplayMode.FitContainerAndZoom,
            suppressPlayButton: true,
            antialiasing: false,
            scenes: {
                [key]: {
                    scene,
                    loader: loader,
                },
            },
        }),
    );

    return engine.value.start(new LiteLoader());
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
    campEngine,
    hasFrame,
    paused,
    inputType,
    togglePause,
};
export type GameContext = typeof gameContext;

export function useGameContext() {
    return gameContext;
}
