import { ControlState } from '@/state/menus/ControlState';
import {
    getActiveMenuElement,
    getEntryMenuElement,
    useMenuElement,
} from '@/state/menus/useMenuElement';

export class InspectUnitState extends ControlState {
    constructor() {
        super();
        const { getSiblingNavListeners, getParentNavListeners, focusMenuElement, cancelFocus } =
            useMenuElement();
        const siblingNavListeners = getSiblingNavListeners('horizontal');
        const parentNavListeners = getParentNavListeners('vertical');

        this.pressListeners = {
            ...siblingNavListeners,
            ...parentNavListeners,
            confirm: {
                command: 'confirm',
                listener: () => {
                    if (getActiveMenuElement()) {
                        return false;
                    }

                    const entryElement = getEntryMenuElement('confirm');
                    if (entryElement) {
                        focusMenuElement(entryElement);
                        return true;
                    }
                    return false;
                },
            },
            cancel: {
                command: 'cancel',
                listener: () => {
                    if (getActiveMenuElement()) {
                        cancelFocus();
                        return true;
                    }
                    return false;
                },
            },
        };
    }
}
