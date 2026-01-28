import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import { BattleScene } from '@/game/scenes/battle.scene';
import { vec } from 'excalibur';
import { ScriptedScene } from '.';

const stonecaller = new CompositeActor({
    hair: 'poofyBob',
    armor: 'stonecallerRobe',
    pos: vec(-72, 24),
});

export const introMetadata: ScriptedScene = {
    type: 'battle',
    scene: new BattleScene(),
    map: 'grass',
    actors: [stonecaller],
    events: [
        {
            type: 'characterAnimation',
            actor: stonecaller,
            animationKey: 'raiseItem',
            preDelay: 3000,
        },
    ],
};
