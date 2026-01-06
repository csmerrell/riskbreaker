import { Component } from 'vue';
import { defineMenuItem } from '../SettingsMenuItemMeta';
import ShallowSelect from '../selectors/ShallowSelect.vue';
import { useGameContext } from '@/state/useGameContext';

const DisplayModeSelect = ShallowSelect as Component<{
    options: {
        key: string;
        label: string;
    }[];
    onSelect: (e: string) => void;
}>;

export const displayModeMenuItem = defineMenuItem({
    key: 'displayMode',
    label: 'Display Mode',
    component: DisplayModeSelect,
    componentProps: {
        options: [
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
        ],
        onSelect: setDisplayMode,
    },
});

function setDisplayMode(e: 'windowed' | 'borderless' | 'fullscreen') {
    const { game, hasFrame } = useGameContext();
    if (e.match(/borderless|fullscreen/)) {
        game.value.screen.enterFullscreen();
        hasFrame.set(false);
    } else {
        game.value.screen.exitFullscreen();
        hasFrame.set(true);
    }
    window.electron.changeWindowMode(e);
}
