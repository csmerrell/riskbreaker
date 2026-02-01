import { docManager } from '@/db';
import { MappedCommand } from '@/game/input/InputMap';
import { maps } from '@/resource/maps';
import { MapMetaKeyed } from '@/resource/maps/maps';
import { makeState } from '@/state/Observable';
import { vec, Vector } from 'excalibur';
import { BonfireManager } from './exploration/BonfireManager';

const sceneReady = makeState<boolean>(false);

//saved state
const playerPos = makeState<{
    pos: Vector;
    size: number;
}>();
const currentMap = makeState<MapMetaKeyed>();
const transitionMap = makeState<MapMetaKeyed>();
const playerTileCoord = makeState<Vector>();
const scriptReady = makeState<boolean>();
const battleOpen = makeState<boolean>();
const campOpen = makeState<boolean>();
const bonfireManager = makeState<BonfireManager>();

//temp state
export type TileControlPrompt = {
    commands: {
        command?: MappedCommand;
        label: string;
        labelColor?: string;
    }[];
};
const tileControlPrompts = makeState<TileControlPrompt>();
const fadeOutEnd = makeState<boolean>(false);
const fadeInStart = makeState<boolean>(false);
const loaded = makeState<boolean>(false);

function awaitScene() {
    if (sceneReady.value) {
        return Promise.resolve();
    } else {
        return new Promise<void>((resolve) => {
            const listener = sceneReady.subscribe((next) => {
                if (next) {
                    resolve();
                    sceneReady.unsubscribe(listener);
                }
            });
        });
    }
}

function setCurrentMap(key: keyof typeof maps, posOverride?: Vector) {
    currentMap.set(
        posOverride
            ? {
                  ...maps[key],
                  startPos: posOverride,
              }
            : maps[key],
    );
}

function setTransitionMap(key: keyof typeof maps, posOverride?: Vector) {
    transitionMap.set(
        posOverride
            ? {
                  ...maps[key],
                  startPos: posOverride,
              }
            : maps[key],
    );
}

function openCamp() {
    campOpen.set(true);
}

function openBattle() {
    battleOpen.set(true);
}

export type SavedExplorationState = {
    mapKey: keyof typeof maps;
    playerCoord: Vector;
};

async function saveExplorationState() {
    const { x, y } = playerTileCoord.value;
    return docManager.upsert('_local/explorationState', {
        mapKey: currentMap.value.key,
        playerCoord: { x, y },
    });
}

async function loadExplorationState() {
    const state = await docManager.tryGet<SavedExplorationState>('_local/explorationState');
    if (state) {
        const { mapKey, playerCoord } = state;
        setCurrentMap(mapKey);

        const { x, y } = playerCoord;
        playerTileCoord.set(vec(x, y));
    }
}

export function useExploration() {
    return {
        sceneReady,
        currentMap,
        playerPos,
        transitionMap,
        bonfireManager,
        scriptReady,
        campOpen,
        battleOpen,
        playerTileCoord,
        tileControlPrompts,
        fadeOutEnd,
        fadeInStart,
        loaded,
        awaitScene,
        loadExplorationState,
        saveExplorationState,
        setCurrentMap,
        setTransitionMap,
        openCamp,
        openBattle,
    };
}
