import type { StrategemAction } from '@/game/actions/StrategemAction';
import type { StrategemActor } from '../StrategemActor';
import { ActorComponent } from './Component';

export class TargetedComponent extends ActorComponent {
    public setOwner(owner: StrategemActor) {
        this.owner = owner;
    }
    public shouldActivate(_action: StrategemAction) {
        return false;
    }
    public beforeEffect() {
        return Promise.resolve();
    }
    public onEffect() {
        return Promise.resolve();
    }
    public afterEffect() {
        return Promise.resolve();
    }
}
