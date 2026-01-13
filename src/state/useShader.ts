import { Material } from 'excalibur';
import { makeState } from './Observable';
import { useGameContext } from './useGameContext';
import FOG_SHADER from '@/shader/fog.glsl?raw';

const fogMaterial = makeState<Material>();

function initShaders() {
    const { explorationEngine } = useGameContext();
    fogMaterial.set(
        explorationEngine.value.graphicsContext.createMaterial({
            name: 'fog',
            fragmentSource: FOG_SHADER,
        }),
    );
}

export function useShader() {
    return {
        fogMaterial,
        initShaders,
    };
}
