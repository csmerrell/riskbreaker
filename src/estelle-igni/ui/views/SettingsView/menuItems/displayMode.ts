import { Component } from 'vue';
import { defineMenuItem } from '../SettingsMenuItemMeta';
import ShallowSelect from '../selectors/ShallowSelect.vue';
import { useGameContext } from '@/state/useGameContext';
import { useSettings, type DisplayModes } from '@/state/useSettings';

type DisplayModeOption = { key: DisplayModes; label: string };
const DisplayModeSelect = ShallowSelect as Component<{
    options: DisplayModeOption[];
    getSelected: () => DisplayModeOption;
    onSelect: (e: string) => void;
}>;

const displayModeOptions: DisplayModeOption[] = [
    {
        key: 'windowed',
        label: 'Windowed',
    },
    {
        key: 'borderless',
        label: 'Borderless',
    },
    {
        key: 'fullscreen',
        label: 'Fullscreen',
    },
];

export const displayModeMenuItem = defineMenuItem({
    key: 'displayMode',
    settingKey: 'displayMode',
    label: 'Display Mode',
    component: DisplayModeSelect,
    componentProps: {
        options: displayModeOptions,
        getSelected() {
            const { displayMode } = useSettings().settingsState.value;
            return this.options.find((o: DisplayModeOption) => o.key === displayMode);
        },
        onSelect: setDisplayMode,
    },
});

async function setDisplayMode(e: 'windowed' | 'borderless' | 'fullscreen') {
    const { hasFrame } = useGameContext();
    const { setSettingDisabled } = useSettings();
    if (e.match(/borderless|fullscreen/)) {
        hasFrame.set(false);
        await window.electron.changeWindowMode(e);
        setSettingDisabled('resolution', true);
    } else {
        const { width, height } = useSettings().settingsState.value.resolution;
        hasFrame.set(true);
        await window.electron.changeWindowMode(e, width, height);
        setSettingDisabled('resolution', false);
    }

    const { saveSetting } = useSettings();
    return saveSetting('displayMode', e);
}
