import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import { BattleScene } from '@/game/scenes/battle.scene';
import { AnimationStrategy, vec } from 'excalibur';
import { ScriptedScene } from '.';

const stonecaller = new CompositeActor({
    hair: 'dragonBob',
    armor: 'stonecallerRobe',
    pos: vec(0, 12),
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
            animationKey: 'walkFace',
            preDelay: 1000,
            strategy: AnimationStrategy.Loop,
            movement: {
                destination: vec(-82, -2),
                type: 'walk',
            },
        },
        {
            type: 'characterAnimation',
            actor: stonecaller,
            animationKey: 'handForward',
            preDelay: 1000,
        },
        {
            type: 'characterAnimation',
            actor: stonecaller,
            animationKey: 'prepItem',
            preDelay: 2000,
        },
        {
            type: 'dialogue',
            actor: stonecaller,
            messages: [
                { text: '. . .', tempo: [{ start: 0, length: 5, scale: 0.25 }] },
                { text: '. . .How can these grow here?', start: 5 },
            ],
        },
    ],
};
