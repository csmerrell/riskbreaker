import { BattleScene } from '@/game/scenes/battle.scene';
import { resources } from '@/resource';
import { Actor, Scene, SpriteSheet } from 'excalibur';

type ScriptedEventBase = {
    type: 'dialogue' | 'characterMotion';
    endSignal: 'playerConfirm' | 'animationEnd' | 'actorFrame';
};

type CharacterMotionEvent = {
    type: 'characterMotion';
    actor: Actor;
};

type DialogueEvent = {
    type: 'dialogue';
    actor: Actor;
    messages: {
        message: string;
        intensity: 'standard' | 'whisper' | 'urgent';
    }[];
};

type ScriptedEvent = ScriptedEventBase & (CharacterMotionEvent | DialogueEvent);

type ScriptedScene = {
    scene: Scene;
    map: string;
    actors: Actor[];
    events: ScriptedEvent[];
};

const stonecaller = new Actor();
stonecaller.graphics.add(
    'static',
    SpriteSheet.fromImageSource({
        image: resources.image.units.unique.stonecaller,
        grid: {
            rows:
        },
    }),
);

const introMetadata: ScriptedScene = {
    scene: new BattleScene(),
    map: 'grass',
    actors: [],
    events: [
        {
            type: 'characterMotion',
        },
    ],
};
