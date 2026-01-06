import { PropsOf } from '@/lib/types/ComponentHelper';
import { Component } from 'vue';

export type MenuItemExposed = {
    focus?: () => void;
    getValue: () => unknown;
};

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MenuItemMeta<C extends Component = any> = {
    key: string;
    label: string;
    component: C;
    componentProps: PropsOf<C>;
};

export function defineMenuItem<C extends Component>(item: MenuItemMeta<C>) {
    return item;
}
