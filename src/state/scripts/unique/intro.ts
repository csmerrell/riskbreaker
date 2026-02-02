import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import { Animation, AnimationStrategy, EasingFunctions, SpriteSheet, vec } from 'excalibur';
import { GameScript } from '../types/GameScript';
import { resources } from '@/resource';
import { COMPOSITE_SPRITE_GRID } from '@/resource/image/units/spriteMap';
import { gameEnum } from '@/lib/enum/game.enum';
import { useGameContext } from '@/state/useGameContext';
import { useBattle } from '@/state/useBattle';

const stonecaller = new CompositeActor({
    name: 'stonecaller',
    hair: 'stonecallerHood',
    armor: 'stonecallerRobe',
    z: 9999,
});

const stonecallerUniqueSheet = SpriteSheet.fromImageSource({
    image: resources.image.units.unique.stonecaller,
    grid: COMPOSITE_SPRITE_GRID,
});
const poisedSlideAnimation = new Animation({
    frames: resources.image.units.unique.spriteMaps.stonecaller.poisedSlide.frames.map((f) => ({
        graphic: stonecallerUniqueSheet.getSprite(f[0], f[1]),
        duration: Math.max(f[2] * gameEnum.frameMs, 1),
    })),
    strategy: AnimationStrategy.Freeze,
});

export const intro: GameScript = {
    events: [
        async () => {
            useBattle().getBattleManager().openBattle();
        },
        async () => {
            const engine = useGameContext().game.value;
            return new Promise((resolve) => {
                setTimeout(async () => {
                    await stonecaller.isLoaded();
                    stonecaller.pos = engine.currentScene.camera.pos.add(vec(-8, 18));
                    engine.currentScene.add(stonecaller);
                    resolve();
                }, 100);
            });
        },
        {
            type: 'compositeAnimation',
            actor: stonecaller,
            animationKey: 'walkFace',
            preDelay: 1000,
            strategy: AnimationStrategy.Loop,
            movement: {
                direction: vec(-82, -12),
                type: 'walk',
            },
        },
        {
            type: 'compositeAnimation',
            actor: stonecaller,
            animationKey: 'handForward',
            preDelay: 1000,
        },
        {
            type: 'compositeAnimation',
            actor: stonecaller,
            animationKey: 'prepItem',
            preDelay: 2000,
        },
        {
            type: 'dialogue',
            actor: stonecaller,
            messages: [
                { text: '. . .', tempo: [{ start: 0, length: 5, scale: 0.25 }], autoAdvance: 1000 },
                { text: '. . .How strange.', start: 5 },
            ],
        },
        [
            {
                type: 'uniqueAnimation',
                actor: stonecaller,
                animation: poisedSlideAnimation,
                movement: {
                    type: 'slide',
                    direction: vec(10, 4),
                    duration: 3000,
                    easing: EasingFunctions.EaseOutQuad,
                },
                postDelay: 5000,
            },
            {
                type: 'dialogueMarker',
                key: 'exclamation',
                anchor: stonecaller,
            },
        ],
    ],
};
