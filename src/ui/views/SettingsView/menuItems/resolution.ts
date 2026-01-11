import { Component } from 'vue';
import DDLSelect from '../selectors/DDLSelect.vue';
import { defineMenuItem } from '../SettingsMenuItemMeta';
import { useSettings } from '@/state/useSettings';

type ResolutionOption = {
    key: string;
    label: string;
    width: number;
    height: number;
};

const ResolutionSelect = DDLSelect as Component<{
    options: ResolutionOption[];
    getSelected: () => ResolutionOption;
    onSelect: (e: string) => void;
}>;

const resolutionOptions: ResolutionOption[] = [
    {
        key: '540p_16_9',
        label: '960 x 540',
        width: 960,
        height: 540,
    },
    {
        key: '720p_16_9',
        label: '1280 x 720',
        width: 1280,
        height: 720,
    },
    {
        key: '900p_16_9',
        label: '1600 x 900',
        width: 1600,
        height: 900,
    },
    {
        key: '1080p_16_9',
        label: '1920 x 1080',
        width: 1920,
        height: 1080,
    },
];

export const resolutionMenuItem = defineMenuItem({
    key: 'resolution',
    settingKey: 'resolution',
    label: 'Resolution',
    component: ResolutionSelect,
    componentProps: {
        options: resolutionOptions,
        getSelected() {
            const { resolution } = useSettings().settingsState.value;
            return this.options.find(
                (o: ResolutionOption) =>
                    o.width === resolution.width && o.height === resolution.height,
            );
        },
        onSelect: setResolution,
    },
});

async function setResolution(value: string) {
    const { width, height } = resolutionOptions.find((o) => o.key === value);
    try {
        const result = await window.electron.changeWindowResolution(width, height);
        if (result && result.success) {
            let fontSizeVar: string;
            if (height < 540) {
                fontSizeVar = 'var(--font-480p)';
            } else if (height < 720) {
                fontSizeVar = 'var(--font-540p)';
            } else {
                fontSizeVar = 'var(--font-720plus)';
            }
            (document.querySelector(':root') as HTMLElement).style.setProperty(
                'font-size',
                fontSizeVar,
            );
        }
        const { saveSetting } = useSettings();
        return saveSetting('resolution', { width, height });
    } catch (error) {
        console.error('Resolution change error:', error);
    }
}
