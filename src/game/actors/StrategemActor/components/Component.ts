import { Component } from 'excalibur';
import type { StrategemActor } from '../StrategemActor';

export class ActorComponent extends Component {
    declare public owner: StrategemActor;
    public isActorComponent: true;

    constructor(public name: string) {
        super();
    }

    onAdd(owner: StrategemActor): void {
        this.owner = owner;
    }

    cancelClockObservers(): void {}
}

export function isActorComponent(comp: Component): comp is ActorComponent {
    return (comp as ActorComponent).isActorComponent;
}
