import { docManager } from '@/db';
import { makeState } from './Observable';

export type DisplayModes = 'windowed' | 'borderless' | 'fullscreen';
type SettingsState = {
    resolution: { width: number; height: number };
    displayMode: DisplayModes;
    textSpeed: 'slow' | 'fast' | '2x' | 'instant';
};
export type SettingsKey = keyof SettingsState;

const settingsState = makeState<SettingsState>({
    resolution: { width: 1280, height: 720 },
    displayMode: 'windowed',
    textSpeed: 'fast',
});

const disabledSettings = makeState<Partial<Record<SettingsKey, boolean>>>({});

function setSettingDisabled(key: SettingsKey, val: boolean) {
    if (val) {
        disabledSettings.set({
            ...disabledSettings.value,
            [key]: true,
        });
    } else {
        const newSettings = { ...disabledSettings.value };
        delete newSettings[key];
        disabledSettings.set(newSettings);
    }
}

async function loadSettings() {
    try {
        const {
            resolution: defRes,
            displayMode: defDisp,
            textSpeed: defTextSpd,
        } = settingsState.value;
        const {
            resolution = defRes,
            displayMode = defDisp,
            textSpeed = defTextSpd,
        } = await docManager.tryGet<SettingsState>('_local/settings');
        settingsState.set({
            resolution,
            displayMode,
            textSpeed,
        });

        if (displayMode !== 'windowed') {
            disabledSettings.set({
                ...disabledSettings.value,
                resolution: true,
            });
        }

        window.electron.changeWindowResolution(resolution.width, resolution.height);
        window.electron.changeWindowMode(displayMode);
        return;
    } catch (_e) {
        const { resolution, displayMode, textSpeed } = settingsState.value;
        //First load. Store default settings
        docManager.upsert('_local/settings', {
            resolution,
            displayMode,
            textSpeed,
        });
    }
}

async function saveSetting<T extends SettingsKey>(key: T, value: SettingsState[T]) {
    docManager.upsert('_local/settings', {
        ...settingsState.value,
        [key]: value,
    });
}

export function useSettings() {
    return {
        settingsState,
        disabledSettings,
        setSettingDisabled,
        loadSettings,
        saveSetting,
    };
}
