import { Component } from 'vue';
import DDLSelect from '../selectors/DDLSelect.vue';
import { defineMenuItem } from '../SettingsMenuItemMeta';

const ResolutionSelect = DDLSelect as Component<{
    options: {
        key: string;
        label: string;
    }[];
    onSelect: (e: string) => void;
}>;

export const resolutionMenuItem = defineMenuItem({
    key: 'resolution',
    label: 'Resolution',
    component: ResolutionSelect,
    componentProps: {
        options: [
            {
                key: '540p_16_9',
                label: '960 x 540',
            },
            {
                key: '720p_16_9',
                label: '1280 x 720',
            },
            {
                key: '900p_16_9',
                label: '1600 x 900',
            },
            {
                key: '1080p_16_9',
                label: '1920 x 1080',
            },
        ],
        onSelect: setResolution,
    },
});

async function setResolution(value: string) {
    const label = resolutionMenuItem.componentProps.options.find((o) => o.key === value).label;
    const [w, h] = label.split(' x ').map((v: string) => parseInt(v, 10));
    console.log(`Attempting to change resolution to: ${w}x${h}`);
    try {
        const result = await window.electron.changeWindowResolution(w, h);
        console.log('Resolution change result:', result);
        if (result && !result.success) {
            console.error('Resolution change failed:', result.error);
        }
    } catch (error) {
        console.error('Resolution change error:', error);
    }
}
