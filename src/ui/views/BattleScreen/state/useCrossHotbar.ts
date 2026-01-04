import { StrategemActor } from '@/game/actors/StrategemActor/StrategemActor';
import { MappedCommand } from '@/game/input/InputMap';
import { nanoid } from 'nanoid';
import { ref, Ref } from 'vue';

export type CrossHotbarCommand = Extract<
    MappedCommand,
    | 'hotbarDDown'
    | 'hotbarDRight'
    | 'hotbarDUp'
    | 'hotbarDLeft'
    | 'hotbarFDown'
    | 'hotbarFUp'
    | 'hotbarFRight'
    | 'hotbarFLeft'
>;

export type HotbarAction = {
    name: string;
    imgPath: string;
    cooldown?: number;
    timer?: number;
};
export type HotbarActionSet = Partial<Record<CrossHotbarCommand, HotbarAction>>;

export class HotbarSet {
    private cleanupActionPrompt: () => void;

    public id: string;
    public leftSet: HotbarActionSet = {};
    public rightSet: HotbarActionSet = {};
    public actionSelected: Promise<HotbarAction>;
    public selectAction: (a: HotbarAction) => void;

    constructor(sets?: { leftSet: HotbarActionSet; rightSet: HotbarActionSet }) {
        this.id = nanoid(16);
        if (sets) {
            this.leftSet = sets.leftSet;
            this.rightSet = sets.rightSet;
        }
        this.resetSelection();
    }

    public resetSelection() {
        ({
            promise: this.actionSelected,
            resolve: this.selectAction,
            reject: this.cleanupActionPrompt,
        } = Promise.withResolvers<HotbarAction>());
    }

    public destroy() {
        this.cleanupActionPrompt();
    }

    public export() {
        const leftSet = { ...this.leftSet };
        Object.keys(leftSet).forEach((k: keyof HotbarActionSet) => {
            delete leftSet[k].cooldown;
            delete leftSet[k].timer;
        });
        const rightSet = { ...this.rightSet };
        Object.keys(rightSet).forEach((k: keyof HotbarActionSet) => {
            delete rightSet[k].cooldown;
            delete rightSet[k].timer;
        });

        return JSON.stringify({
            leftSet,
            rightSet,
        });
    }
}

const currentHotbar = ref<HotbarSet | null>(null);
function setHotbar(hotbarActions: HotbarSet) {
    currentHotbar.value = hotbarActions;
}

const hotbarState = {
    currentHotbar,
    setHotbar,
};

export type CrossHotbarState = typeof hotbarState;

export function useCrossHotbar() {
    return hotbarState;
}
