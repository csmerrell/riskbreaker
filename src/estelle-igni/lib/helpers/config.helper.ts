import { DisplayMode, EngineOptions } from 'excalibur';

export const ExcaliburDefaults: { [key: string]: Partial<EngineOptions> } = {
    base: {
        pixelArt: true,
        suppressPlayButton: true,
        antialiasing: false,
    },
    fixedComponent: {
        displayMode: DisplayMode.Fixed,
    },
};
