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
    try {
        const result = await window.electron.changeWindowResolution(w, h);
        if (result && result.success) {
            let fontSizeVar: string;
            if (h < 540) {
                fontSizeVar = 'var(--font-480p)';
            } else if (h < 720) {
                fontSizeVar = 'var(--font-540p)';
            } else {
                fontSizeVar = 'var(--font-720plus)';
            }
            document.querySelector(':root').style.setProperty('font-size', fontSizeVar);
        }
    } catch (error) {
        console.error('Resolution change error:', error);
    }
}
