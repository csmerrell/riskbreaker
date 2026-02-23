import { Component, Ref, shallowRef } from 'vue';
export type MenuInstance = {
    id: number;
    component: Component;
    props?: Record<string, unknown>;
    position: Ref<{ x: number; y: number }>;
    xAnchor?: 'left' | 'right';
    yAnchor?: 'top' | 'bottom';
    zIndex: number;
};

export const MENU_TRANSITION_DURATION = 200;

const menus = shallowRef<MenuInstance[]>([]);

let nextId = 1;
let zCounter = 1000;

export function useMenuRegistry() {
    return menus;
}

export function addMenu(
    component: Component,
    options: Omit<MenuInstance, 'id' | 'zIndex' | 'component'>,
) {
    const instance: MenuInstance = {
        id: nextId++,
        zIndex: zCounter++,
        component,
        ...options,
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
