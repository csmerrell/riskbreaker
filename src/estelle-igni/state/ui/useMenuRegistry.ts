import { MenuItemHooks } from '@/ui/components/menus/MenuItem.vue';
import { Component, ref, Ref, shallowRef } from 'vue';
import { MenuAnchor } from './useActorAnchors';
export type MenuInstance = {
    id: number;
    component: Component;
    addHooks: (hooks: MenuItemHooks) => void;
    hooks?: MenuItemHooks;
    props?: Record<string, unknown>;
    position: Ref<{ x: number; y: number }>;
    xAnchor?: 'left' | 'right';
    yAnchor?: 'top' | 'bottom';
    zIndex: number;
};
export type AnchoredMenu = MenuInstance & { anchor: MenuAnchor };

export const MENU_TRANSITION_DURATION = 200;

const menus = shallowRef<MenuInstance[]>([]);

let nextId = 1;
let zCounter = 1000;

export function useMenuRegistry() {
    return menus;
}

type MenuOptions = Omit<MenuInstance, 'id' | 'zIndex' | 'component' | 'addHooks'>;
export function addMenu(
    component: Component,
    options: Omit<MenuInstance, 'id' | 'zIndex' | 'component' | 'addHooks' | 'position'> & {
        position?: MenuInstance['position'];
    },
) {
    if (!options.position) {
        options.position = ref({ x: 0, y: 0 });
    }
    const instance: MenuInstance = {
        id: nextId++,
        zIndex: zCounter++,
        component,
        addHooks: (hooks) => {
            instance.hooks = hooks;
        },
        ...(options as MenuOptions),
    };

    menus.value = [...menus.value, instance];
    return instance;
}

export function removeMenu(id: number) {
    const index = menus.value.findIndex((m) => m.id === id);
    if (index !== -1)
        menus.value = [...menus.value.slice(0, index), ...menus.value.slice(index + 1)];
}

export function closeAllMenus() {
    menus.value = [];
}
