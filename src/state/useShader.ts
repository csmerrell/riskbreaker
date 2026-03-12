import { Material } from 'excalibur';
import { makeState } from './Observable';
import { useGameContext } from './useGameContext';
import FOG_SHADER from '@/shader/fog.glsl?raw';
import LANE_TARGET_SHADER from '@/shader/laneTarget.glsl?raw';

const fogMaterial = makeState<Material>();
const laneTargetMaterial = makeState<Material>();

function initShaders() {
    const engine = useGameContext().game.value;
    fogMaterial.set(
        engine.graphicsContext.createMaterial({
            name: 'fog',
            fragmentSource: FOG_SHADER,
        }),
    );
    laneTargetMaterial.set(
        engine.graphicsContext.createMaterial({
            name: 'laneTarget',
            fragmentSource: LANE_TARGET_SHADER,
        }),
    );
}

export function useShader() {
    return {
        fogMaterial,
        laneTargetMaterial,
        initShaders,
    };
}
