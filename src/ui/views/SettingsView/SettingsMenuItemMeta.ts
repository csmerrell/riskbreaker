import { PropsOf } from '@/lib/types/ComponentHelper';
import { SettingsKey } from '@/state/useSettings';
import { Component } from 'vue';

export type MenuItemExposed = {
    focus?: () => void;
    blur: () => void;
    getValue: () => unknown;
    isDisabled: () => boolean;
};

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MenuItemMeta<C extends Component = any> = {
    key: SettingsKey;
    settingKey: SettingsKey;
    label: string;
    component: C;
    componentProps: PropsOf<C>;
};

export function defineMenuItem<C extends Component>(item: MenuItemMeta<C>) {
    return item;
}
