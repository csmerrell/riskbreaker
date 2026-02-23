import { docManager } from '@/db';
import { MappedCommand } from '@/game/input/InputMap';
import { maps } from '@/resource/maps';
import { MapMetaKeyed } from '@/resource/maps/maps';
import { makeState } from '@/state/Observable';
import { Scene, Vector } from 'excalibur';
import { ExplorationManager } from './exploration/ExplorationManager';

const sceneReady = makeState<boolean>(false);

//saved state
const playerPos = makeState<{
    pos: Vector;
    size: number;
}>();
const explorationManager = makeState<ExplorationManager>();

//temp state
export type TileControlPrompt = {
    commands: {
        command?: MappedCommand;
        label: string;
        labelColor?: string;
    }[];
};
const tileControlPrompts = makeState<TileControlPrompt>();
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

function initExplorationManager(scene: Scene) {
    explorationManager.set(new ExplorationManager({ scene }));
}

function getExplorationManager() {
    return explorationManager.value;
}

export type SavedExplorationState = {
    mapKey: keyof typeof maps;
    playerCoord: Vector;
};

async function saveExplorationState() {
    if (!explorationManager.value) return;
    const { x, y } = explorationManager.value.playerTileCoord.value;
    return docManager.upsert('_local/explorationState', {
        mapKey: explorationManager.value.mapManager.currentMap.value.key,
        playerCoord: { x, y },
    });
}

export function useExploration() {
    return {
        sceneReady,
        playerPos,
        tileControlPrompts,
        loaded,
        awaitScene,
        initExplorationManager,
        getExplorationManager,
        saveExplorationState,
    };
}
