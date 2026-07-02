import { Component, ImageSource, Vector } from 'excalibur';

export type HotbarIcon = { spritePos: Vector } | { imageSrc: ImageSource };

export class HotbarEventComponent extends Component {
    public icon?: HotbarIcon;
    public label?: string;

    constructor(config?: { icon?: HotbarIcon; label?: string }) {
        super();
        this.icon = config?.icon;
        this.label = config?.label;
    }

    public async activateEvent(): Promise<void> {
        const entity = this.owner as { activateEvent?: () => Promise<void> };
        if (entity.activateEvent) {
            await entity.activateEvent();
        }
    }

    public enableEvent(_enabled: boolean): void {
        // Lifecycle hook - entities can override if needed
    }
}
