import { Actor, Material } from 'excalibur';
import { makeState } from './Observable';
import { useGameContext } from './useGameContext';
import FOG_SHADER from '@/shader/fog.glsl?raw';
import LANE_TARGET_SHADER from '@/shader/laneTarget.glsl?raw';
import BORDER_HIGHLIGHT_SHADER from '@/shader/borderHighlight.glsl?raw';

const fogMaterial = makeState<Material>();
const laneTargetMaterial = makeState<Material>();
const borderHighlightMaterial = makeState<Material>();

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
    borderHighlightMaterial.set(
        engine.graphicsContext.createMaterial({
            name: 'borderHighlight',
            fragmentSource: BORDER_HIGHLIGHT_SHADER,
        }),
    );
}

type BorderType = 'hurt' | 'heal';

/**
 * Adds a border shader to an actor that highlights the sprite's edge pixels
 * @param actor - The actor to add the border to (must have getDimensions() method)
 * @param type - 'hurt' for red border, 'heal' for green border
 */
function addBorder(
    actor: Actor & {
        getDimensions: () => {
            spriteWidth: number;
            spriteHeight: number;
            columns: number;
            rows: number;
        };
    },
    type: BorderType,
): void {
    if (!borderHighlightMaterial.value) {
        throw new Error('[addBorder] Shaders not initialized. Call initShaders() first.');
    }

    const dimensions = actor.getDimensions();
    const color = type === 'hurt' ? [1.0, 0.0, 0.0] : [0.0, 1.0, 0.0]; // Red or Green

    actor.graphics.material = borderHighlightMaterial.value;
    actor.graphics.material.update((shader) => {
        shader.trySetUniform('uniform3fv', 'u_borderColor', color);
        shader.trySetUniform('uniform2fv', 'u_texelSize', [
            1.0 / (dimensions.spriteWidth * dimensions.columns),
            1.0 / (dimensions.spriteHeight * dimensions.rows),
        ]);
        shader.trySetUniformInt('u_columns', dimensions.columns);
        shader.trySetUniformInt('u_rows', dimensions.rows);
    });
}

/**
 * Removes the border shader from an actor
 * @param actor - The actor to remove the border from
 */
function removeBorder(actor: Actor): void {
    actor.graphics.material = null;
}

export function useShader() {
    return {
        fogMaterial,
        laneTargetMaterial,
        borderHighlightMaterial,
        initShaders,
        addBorder,
        removeBorder,
    };
}
