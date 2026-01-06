import { gameEnum } from '@/lib/enum/game.enum';
import { BattleScene } from '@/game/scenes/battle.scene';
import { LiteLoader } from '@/resource/loader';
import { Color, DisplayMode, Engine } from 'excalibur';
import { TitleScene } from '@/game/scenes/title.scene';
import { makeState } from './Observable';
import { initControls, provideInput } from '@/game/input/useInput';
import { ref } from 'vue';
import { useClock } from './useClock';
import { TestScene } from '@/game/scenes/test.scene';

const loader = new LiteLoader();

type AvailableScenes = 'battle' | 'title' | 'test';
const paused = ref(false);
const game = makeState<Engine<AvailableScenes>>();
const hasFrame = makeState<boolean>(true);
const currentSceneReady = makeState<boolean>(false);

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
            displayMode: DisplayMode.FitScreen,
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

let storedTimescale = -1;
function togglePause() {
    paused.value = !paused.value;

    if (paused.value) {
        storedTimescale = game.value.timescale;
        game.value.timescale = 0;
        setLogicClock('off', { noPersistence: true });
    } else {
        game.value.timescale = storedTimescale;
        if (!logicClockOff.value) {
            setLogicClock('on', { noPersistence: true });
        }
    }
}

const logicClockOff = makeState(false);
function setLogicClock(val: 'off' | 'on', options: { noPersistence?: boolean } = {}) {
    const {
        suspendClock: suspendLogicClock,
        resumeClock: resumeLogicClock,
        isRunning,
    } = useClock();
    if ((!isRunning.value && val === 'off') || (isRunning.value && val == 'on')) {
        return;
    }
    const { noPersistence = false } = options;

    if (!noPersistence) {
        logicClockOff.set(val === 'off');
    }

    if (val === 'off') {
        suspendLogicClock();
    } else {
        resumeLogicClock();
    }
}

export const gameContext = {
    currentSceneReady,
    game,
    hasFrame,
    logicClockOff,
    paused,
    togglePause,
    setLogicClock,
};
export type GameContext = typeof gameContext;

export function useGameContext() {
    return gameContext;
}
