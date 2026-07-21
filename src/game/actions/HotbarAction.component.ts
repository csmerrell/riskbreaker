import { Component, ImageSource, Vector } from 'excalibur';

export class HotbarActionComponent extends Component {
    public iconSrc: ImageSource;
    public iconPos: Vector;
    public label: string;
    private action: undefined | (() => Promise<unknown>);

    constructor(config: {
        iconSrc: ImageSource;
        iconPos: Vector;
        label: string;
        action?: () => Promise<unknown>;
    }) {
        super();
        this.iconSrc = config.iconSrc;
        this.iconPos = config.iconPos;
        this.label = config.label;
        this.action = config.action;
    }

    public async activateEvent(): Promise<unknown> {
        if (this.action) {
            return this.action();
        } else {
            const entity = this.owner as { activateEvent?: () => Promise<void> };
            if (entity.activateEvent) {
                await entity.activateEvent();
            } else {
                console.error(`Hotbar for ${this.label} executed with no defined action.`);
            }
        }
    }
}
