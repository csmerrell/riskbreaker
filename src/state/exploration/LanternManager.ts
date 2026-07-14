import { LightSource } from '@/game/actors/LightSource/LightSource.component';
import {
    captureControls,
    registerInputListener,
    unCaptureControls,
    unregisterInputListener,
} from '@/game/input/useInput';
import { resources } from '@/resource';
import { Actor, vec } from 'excalibur';
import { SceneManager } from '../SceneManager';
import type { ExplorationManager } from './ExplorationManager';

const RADIAN_TRANSFORM = Math.PI / 180;

export class LanternManager extends SceneManager {
    private state: 'idle' | 'prep' | 'send' | 'snuff' | 'expire' = 'idle';
    private prepListeners: string[] = [];
    private lantern!: Actor;
    private indicator!: Actor;
    private lanternUpdateHandler!: () => void;

    constructor(private parent: ExplorationManager) {
        super({ scene: parent.scene });

        if (!resources.image.misc.arrowIndicator.isLoaded()) {
            resources.image.misc.arrowIndicator.load().then(this.initSprites);
        } else {
            this.initSprites();
        }
        this.createLanternUpdateHandler();
    }

    private initSprites() {
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
    }

    private createLanternUpdateHandler() {
        this.lanternUpdateHandler = () => {
            const bounds = this.parent.mapManager.getBounds();
            if (!bounds) return;

            const pos = this.lantern.pos;

            // Check if lantern is outside bounds
            if (
                pos.x < bounds.left ||
                pos.x > bounds.right ||
                pos.y < bounds.top ||
                pos.y > bounds.bottom
            ) {
                this.killLantern();
            }
        };
    }

    private killLantern(): void {
        this.lantern.off('preupdate', this.lanternUpdateHandler);
        this.returnCameraToPlayer();
        this.scene.remove(this.lantern);
    }

    private async returnCameraToPlayer() {
        const leader = this.parent.actorManager.getLeader();
        const distance = this.lantern.pos.distance(leader.pos);
        const duration = (distance / 300) * 1000; // 1s per 300 pixels

        return this.parent.cameraManager.moveToActor(leader, duration).then(() => {
            this.parent.cameraManager.lockToActor(leader);
            this.idle();
            unCaptureControls();
        });
    }

    public prepLantern() {
        captureControls();
        this.indicator.pos = this.parent.actorManager.getLeader().pos;
        this.scene.add(this.indicator);

        this.prepListeners = [
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
                this.parent.movementManager.enableMovement();
                this.prepListeners.forEach((l) => {
                    unregisterInputListener(l);
                });
                this.prepListeners = [];
            }, 'cancel'),

            registerInputListener(() => {
                this.scene.remove(this.indicator);
                this.send();
                this.prepListeners.forEach((l) => {
                    unregisterInputListener(l);
                });
                this.prepListeners = [];
            }, 'confirm'),
        ];
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
        this.parent.actorManager.getLeader().useAnimation('raiseItem', { noReset: true });
        setTimeout(() => {
            this.parent.actorManager.getLeader().useAnimation('static');
        }, 1000);
        const player = this.parent.actorManager.getLeader();
        this.lantern.pos = player.pos;
        this.scene.add(this.lantern);

        // Lock camera to lantern and apply bounds
        this.parent.cameraManager.lockToActor(this.lantern);

        // Calculate velocity based on indicator rotation
        // Rotation 0 = vec(-1, 0), so we offset by π to align with standard trig
        const adjustedRotation = this.indicator.rotation + Math.PI;
        this.lantern.vel = vec(Math.cos(adjustedRotation), Math.sin(adjustedRotation)).scale(
            vec(25, 25),
        );

        // Start monitoring lantern position
        this.lantern.on('preupdate', this.lanternUpdateHandler);
    }

    private trackLanternExpiration() {
        return new Promise<void>(async (resolve) => {
            if (this.lantern.isKilled()) {
                resolve();
            } else {
                setTimeout(async () => {
                    await this.trackLanternExpiration();
                    resolve();
                }, 250);
            }
        });
    }

    private idle() {
        this.state = 'idle';
    }

    public snuff() {
        this.state = 'snuff';
        this.killLantern();
    }

    public getState() {
        return this.state;
    }
}
