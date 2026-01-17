import { LightSource } from '@/game/actors/LightSource/LightSource.component';
import {
    captureControls,
    consumeCollisions,
    registerInputListener,
    registerWildcardListener,
    unCaptureControls,
    unregisterInputListener,
} from '@/game/input/useInput';
import { resources } from '@/resource';
import {
    Actor,
    Animation,
    AnimationStrategy,
    LockCameraToActorStrategy,
    Scene,
    SpriteSheet,
    vec,
} from 'excalibur';

const RADIAN_TRANSFORM = Math.PI / 180;

export class LanternStateMachine {
    private player: Actor;
    private scene: Scene;
    private state: 'idle' | 'prep' | 'send' | 'snuff' | 'expire';
    private raiseAnimation: Animation;
    private listeners: string[] = [];
    private lantern: Actor;
    private indicator: Actor;

    constructor(player: Actor, scene: Scene) {
        this.player = player;
        this.scene = scene;

        this.player.graphics.add(
            'prepLantern',
            SpriteSheet.fromImageSource({
                image: resources.image.units.Naturalist,
                grid: {
                    rows: 1,
                    columns: 3,
                    spriteHeight: 24,
                    spriteWidth: 24,
                },
            }).getSprite(1, 0),
        );
        this.player.graphics.add(
            'raiseLantern',
            SpriteSheet.fromImageSource({
                image: resources.image.units.Naturalist,
                grid: {
                    rows: 1,
                    columns: 3,
                    spriteHeight: 24,
                    spriteWidth: 24,
                },
            }).getSprite(2, 0),
        );

        this.lantern = new Actor({
            height: 24,
            width: 24,
        });
        this.lantern.graphics.add('main', resources.image.misc.lantern.toSprite());
        this.lantern.graphics.use('main');
        this.lantern.addComponent(new LightSource({ radius: 2 }));
        this.lantern.z = 100;

        this.indicator = new Actor({
            height: 48,
            width: 48,
        });
        this.indicator.graphics.add('main', resources.image.misc.arrowIndicator.toSprite());
        this.indicator.graphics.use('main');
        this.indicator.offset = vec(-8, 0);
        this.indicator.z = 100;

        this.listeners.push(
            registerWildcardListener((inputs) => {
                if ((inputs.shoulder_left && inputs.hotbarFDown) || inputs.hotbar1) {
                    delete inputs.shoulder_left;
                    delete inputs.hotbarFDown;
                    consumeCollisions(inputs, ['shoulder_left', 'hotbarFDown', 'hotbar1']);
                    this.prep();
                }
            }),
        );
    }

    private prep() {
        captureControls();
        this.player.graphics.use('prepLantern');
        this.scene.add(this.indicator);
        this.indicator.rotation = this.player.scale.x < 0 ? Math.PI : 0;
        this.indicator.pos = this.player.pos;
        const listeners: string[] = [];
        listeners.concat([
            registerInputListener(() => {
                this.moveTrajectory(90);
            }, 'menu_up'),
            registerInputListener(() => {
                this.moveTrajectory(270);
            }, 'menu_down'),
            registerInputListener(() => {
                this.moveTrajectory(0);
            }, 'menu_left'),
            registerInputListener(() => {
                this.moveTrajectory(180);
            }, 'menu_right'),

            registerInputListener(() => {
                this.scene.remove(this.indicator);
                this.idle();
                unCaptureControls();
                listeners.forEach((l) => {
                    unregisterInputListener(l);
                });
            }, 'cancel'),

            registerInputListener(() => {
                this.scene.remove(this.indicator);
                this.send();
                unCaptureControls();
                listeners.forEach((l) => {
                    unregisterInputListener(l);
                });
            }, 'confirm'),
        ]);
    }
    private moveTrajectory(targetAngle: number) {
        const targetRadians = targetAngle * RADIAN_TRANSFORM;
        const currentRadians = this.indicator.rotation;

        // Calculate the shortest angular difference
        let diff = targetRadians - currentRadians;

        // Normalize the difference to be between -π and π
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;

        // If we're close enough, don't move
        if (Math.abs(diff) < 10 * RADIAN_TRANSFORM) {
            return;
        }

        // Move in the direction of the shortest path
        if (diff > 0) {
            this.indicator.rotation += 15 * RADIAN_TRANSFORM;
        } else {
            this.indicator.rotation -= 15 * RADIAN_TRANSFORM;
        }
    }

    private async send() {
        this.state = 'send';
        this.player.graphics.use('raiseLantern');
        setTimeout(() => {
            this.player.graphics.use('idle');
        }, 1000);
        this.lantern.pos = this.player.pos.sub(vec(this.player.scale.x * 8, 8));
        this.scene.add(this.lantern);
        this.scene.camera.strategy.lockToActor(this.lantern);

        // Calculate velocity based on indicator rotation
        // Rotation 0 = vec(-1, 0), so we offset by π to align with standard trig
        const adjustedRotation = this.indicator.rotation + Math.PI;
        this.lantern.vel = vec(Math.cos(adjustedRotation), Math.sin(adjustedRotation)).scale(
            vec(15, 15),
        );
        this.expire();
    }
    private expire() {
        this.state = 'expire';
        //TODO - implement
        this.idle();
    }
    private idle() {
        this.state = 'idle';
        //TODO - implement
        this.player.graphics.use('idle');
    }

    public snuff() {
        this.state = 'snuff';
    }

    public getState() {
        return this.state;
    }
}
