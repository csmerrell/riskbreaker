import { MappedCommand } from '@/game/input/InputMap';
import { useSFX } from '@/state/useSFX';
import { onMounted, Ref, ref } from 'vue';
import { ControlStatePressListener } from './ControlState';

export type MenuElement = Element & {
    focusMenuItem: () => void;
    releaseFocus: () => void;
    beforeUnmount: () => void;
    blur: () => void;
};

export type MenuRow = Element & {};

export function isMenuElement(e: Element): e is MenuElement {
    return (e as MenuElement).hasAttribute('menu-item');
}

export function isMenuRow(e: Element): e is MenuElement {
    return (e as MenuRow).hasAttribute('menu-row');
}

export function getActiveMenuElement(): MenuElement | undefined {
    return document.querySelector('[menu-item][has-focus]');
}

export function getEntryMenuElement(entryCommand: MappedCommand): MenuElement | undefined {
    const entryEls: MenuElement[] = Array.from(
        document.querySelectorAll('[menu-item][menu-entry]'),
    );
    for (const el of entryEls) {
        if (
            el
                .getAttribute('menu-entry')
                .split(',')
                .some((commandKey) => commandKey === entryCommand)
        ) {
            return el;
        }
    }
    return;
}

const focusedElement: Ref<MenuElement | undefined> = ref();
export function useMenuElement() {
    const menu = {
        focusNext(el: Element) {
            let next = el?.nextElementSibling;
            while (next && !isMenuElement(next)) {
                next = next.nextElementSibling;
            }

            if (next && isMenuElement(next)) {
                next.focusMenuItem();
                return next;
            }
            return undefined;
        },
        focusPrev(el: Element) {
            let prev = el?.previousElementSibling;
            while (prev && !isMenuElement(prev)) {
                prev = prev.previousElementSibling;
            }

            if (prev && isMenuElement(prev)) {
                prev.focusMenuItem();
                return prev;
            }
            return undefined;
        },
        focusNextRow(el: Element) {
            const parent = el?.closest('[menu-row]');
            const colIdx = Array.from(parent?.querySelectorAll('[menu-item]') ?? []).findIndex(
                (e) => e === el,
            );
            let next = parent?.nextElementSibling;
            while (next && !isMenuRow(next)) {
                next = next.nextElementSibling;
            }

            if (next && isMenuRow(next)) {
                const rowItems: MenuElement[] = Array.from(next.querySelectorAll('[menu-item]'));
                const el = rowItems[Math.min(colIdx, rowItems.length - 1)];
                if (el && isMenuElement(el)) {
                    el.focusMenuItem();
                    return el;
                }
            }
            return undefined;
        },
        focusPrevRow(el: Element) {
            const parent = el?.closest('[menu-row]');
            const colIdx = Array.from(parent?.querySelectorAll('[menu-item]') ?? []).findIndex(
                (e) => e === el,
            );
            let prev = parent?.previousElementSibling;
            while (prev && !isMenuRow(prev)) {
                prev = prev.previousElementSibling;
            }

            if (prev && isMenuRow(prev)) {
                const rowItems: MenuElement[] = Array.from(prev.querySelectorAll('[menu-item]'));
                const el = rowItems[Math.min(colIdx, rowItems.length - 1)];
                if (el && isMenuElement(el)) {
                    el.focusMenuItem();
                    return el;
                }
            }
            return undefined;
        },
        composeMenuElement(el: Ref<MenuElement>) {
            const focused = ref(false);
            onMounted(() => {
                el.value.focusMenuItem = () => {
                    const { playSFX } = useSFX();
                    playSFX('menuNav');

                    focused.value = true;
                };
                el.value.blur = () => {
                    focused.value = false;
                };
                el.value.beforeUnmount = () => {
                    if (focused.value) {
                        focusedElement.value = undefined;
                    }
                };
            });

            const focus = () => {
                focused.value = true;
                focusedElement.value = el.value;
            };

            const unfocus = () => {
                if ((focusedElement.value = el.value)) {
                    focusedElement.value = undefined;
                }
                focused.value = false;
            };

            return {
                focused,
                focus,
                unfocus,
            };
        },
        getSiblingNavListeners(direction: 'horizontal' | 'vertical') {
            const listeners: Partial<Record<MappedCommand, ControlStatePressListener>> = {};

            const nextCommand = direction === 'horizontal' ? 'menu_right' : 'menu_down';
            listeners[nextCommand] = {
                command: nextCommand,
                listener: () => {
                    const activeElement = getActiveMenuElement();
                    if (activeElement) {
                        const newFocus = menu.focusNext(activeElement);
                        if (newFocus) {
                            activeElement.blur();
                            focusedElement.value = newFocus;
                            return true;
                        }
                        return false;
                    } else {
                        const entryElement = getEntryMenuElement(nextCommand);
                        if (entryElement) {
                            focusedElement.value = entryElement;
                            focusedElement.value.focusMenuItem();
                            return true;
                        }
                        return false;
                    }
                },
            };

            const prevCommand = direction === 'horizontal' ? 'menu_left' : 'menu_up';
            listeners[prevCommand] = {
                command: prevCommand,
                listener: () => {
                    const activeElement = getActiveMenuElement();
                    if (activeElement) {
                        const newFocus = menu.focusPrev(activeElement);
                        if (newFocus) {
                            activeElement.blur();
                            focusedElement.value = newFocus;
                            return true;
                        }
                        return false;
                    } else {
                        const entryElement = getEntryMenuElement(prevCommand);
                        if (entryElement) {
                            focusedElement.value = entryElement;
                            return true;
                        }
                        return false;
                    }
                },
            };

            return listeners;
        },
        setBeforeUnmount(el: Ref<MenuElement>, cb: () => void) {
            if (!el.value) {
                setTimeout(() => menu.setBeforeUnmount, 20);
            } else {
                el.value.beforeUnmount = cb;
            }
        },
        getParentNavListeners(direction: 'horizontal' | 'vertical') {
            const listeners: Partial<Record<MappedCommand, ControlStatePressListener>> = {};
            const nextCommand = direction === 'horizontal' ? 'menu_right' : 'menu_down';
            listeners[nextCommand] = {
                command: nextCommand,
                listener: () => {
                    const activeElement = getActiveMenuElement();
                    if (activeElement) {
                        const newFocus = menu.focusNextRow(activeElement);
                        if (newFocus) {
                            activeElement.blur();
                            focusedElement.value = newFocus;
                            return true;
                        }
                        return false;
                    } else {
                        const entryElement = getEntryMenuElement(nextCommand);
                        if (entryElement) {
                            focusedElement.value = entryElement;
                            focusedElement.value.focusMenuItem();
                            return true;
                        }
                        return false;
                    }
                },
            };

            const prevCommand = direction === 'horizontal' ? 'menu_left' : 'menu_up';
            listeners[prevCommand] = {
                command: prevCommand,
                listener: () => {
                    const activeElement = getActiveMenuElement();
                    if (activeElement) {
                        const newFocus = menu.focusPrevRow(activeElement);
                        if (newFocus) {
                            activeElement.blur();
                            focusedElement.value = newFocus;
                            return true;
                        }
                        return false;
                    } else {
                        const entryElement = getEntryMenuElement(prevCommand);
                        if (entryElement) {
                            focusedElement.value = entryElement;
                            return true;
                        }
                        return false;
                    }
                },
            };

            return listeners;
        },
        focusMenuElement(el: MenuElement) {
            if (focusedElement.value) {
                focusedElement.value.blur();
            }
            focusedElement.value = el;
            el.focusMenuItem();
        },
        cancelFocus() {
            focusedElement.value?.blur();
            focusedElement.value = null;
        },
    };

    return {
        focusedElement,
        ...menu,
    };
}
