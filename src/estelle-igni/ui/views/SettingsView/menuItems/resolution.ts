import { Component } from 'vue';
import DDLSelect from '../selectors/DDLSelect.vue';
import { defineMenuItem } from '../SettingsMenuItemMeta.js';
import { useSettings } from '@/state/useSettings.js';

export type ResolutionOption = {
    key: '540p_16_9' | '720p_16_9' | '900p_16_9' | '1080p_16_9' | '2160p_16_9';
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
    {
        key: '2160p_16_9',
        label: '3840 x 2160',
        width: 3840,
        height: 2160,
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

export async function setResolution(value: string) {
    const { width, height } = resolutionOptions.find((o) => o.key === value);
    try {
        const result = await window.electron.changeWindowResolution(width, height);
        if (result && result.success) {
            let fontSizeVar: string;
            if (height < 540) {
                fontSizeVar = 'var(--font-480p)';
            } else if (height < 720) {
                fontSizeVar = 'var(--font-540p)';
            } else if (height < 900) {
                fontSizeVar = 'var(--font-720p)';
            } else if (height < 1080) {
                fontSizeVar = 'var(--font-900p)';
            } else if (height < 2160) {
                fontSizeVar = 'var(--font-1080p)';
            } else {
                fontSizeVar = 'var(--font-4k)';
            }
            (document.querySelector(':root') as HTMLElement).style.setProperty(
                'font-size',
                fontSizeVar,
            );
            (document.querySelector('body') as HTMLElement).style.setProperty(
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
