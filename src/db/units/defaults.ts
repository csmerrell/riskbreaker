import { InternalSheetAnimation } from '../types';
import { HealthDefinition, SpeedDefinition } from './BattleUnit';

export const defaultImportedIdle: InternalSheetAnimation = {
    row: 0,
    startFrame: 0,
    frameCount: 6,
    frameDuration: 4,
};

export const defaultIdle: InternalSheetAnimation = {
    row: 0,
    startFrame: 0,
    frameCount: 3,
    frameDuration: 8,
};

export const defaultSpeed: SpeedDefinition = {
    chargePerTick: 8,
};

export const defaultHealth: HealthDefinition = {
    base: 20,
};
