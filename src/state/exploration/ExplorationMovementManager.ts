import { vec, Vector } from 'excalibur';
import { canMoveBetween } from '@/lib/helpers/tile.helper';
import { registerHoldListener, unregisterInputListener } from '@/game/input/useInput';
import { useExploration } from '@/state/useExploration';
import { isBonfire, isHaltingKeypoint, isZoneChangePoint } from '@/resource/maps';
import { InputMap } from '@/game/input/InputMap';
import { SceneManager } from '../SceneManager';
import type { ExplorationManager } from './ExplorationManager';

export type ExplorationMovementManagerOpts = {
    movementSpeed?: number;
};

export class ExplorationMovementManager extends SceneManager {
    private bufferedInput: Vector | undefined;
    private debounceTime = 0;
    private playerOffset?: Vector;
    private movementSpeed: number;

    constructor(
        private parent: ExplorationManager,
        opts?: ExplorationMovementManagerOpts,
    ) {
        super({ scene: parent.scene });

        const { movementSpeed = 250 } = opts ?? {};
        this.movementSpeed = movementSpeed;
    }

    public getPlayerTileCoord(): Vector {
        return this.parent.playerTileCoord.value;
    }

    public setPlayerTileCoord(coord: Vector): void {
        this.parent.playerTileCoord.set(coord);
    }

    public setMovementSpeed(speed: number): void {
        this.movementSpeed = speed;
    }

    private listener: string;
    public enableMovement() {
        this.listener = registerHoldListener((commands: InputMap) => {
            if (this.bufferedInput || Date.now() - this.debounceTime < this.movementSpeed - 20) {
                return;
            }

            const mapGround = this.parent.mapManager.getMapGround();
            if (!mapGround) return;

            let direction: Vector;
            if (commands.menu_down || commands.movement_down) {
                direction = vec(0, 1);
            } else if (commands.menu_up || commands.movement_up) {
                direction = vec(0, -1);
            } else if (commands.menu_right || commands.movement_right) {
                direction = vec(1, 0);
            } else if (commands.menu_left || commands.movement_left) {
                direction = vec(-1, 0);
            } else {
                return;
            }

            const currentCoord = this.getPlayerTileCoord();
            if (!this.bufferedInput) {
                this.move(direction);
            } else if (canMoveBetween(currentCoord, currentCoord.add(direction), mapGround)) {
                this.bufferedInput = direction;
            }
        });
    }

    public disableMovement() {
        unregisterInputListener(this.listener);
    }

    private move(direction: Vector) {
        const mapGround = this.parent.mapManager.getMapGround();
        if (!mapGround) return;

        const player = this.parent.actorManager.getLeader();
        player.scale = vec(direction.x * -1 || player.scale.x, 1);

        const currentCoord = this.getPlayerTileCoord();
        const nextCoord = currentCoord.add(direction);
        if (!canMoveBetween(currentCoord, nextCoord, mapGround)) {
            delete this.bufferedInput;
            return;
        } else if (
            this.bufferedInput &&
            !canMoveBetween(nextCoord, nextCoord.add(this.bufferedInput), mapGround)
        ) {
            delete this.bufferedInput;
        }
        this.debounceTime = Date.now();
        const prevOffset = this.getTileOffset().scale(-1);
        this.setPlayerTileCoord(currentCoord.add(direction));
        const duration = this.movementSpeed;
        player.actions.moveBy({
            offset: vec(24, 24).scale(direction).add(this.getTileOffset()).add(prevOffset),
            duration,
        });
        setTimeout(() => {
            this.movementAfterEffects();
        }, duration - 10);
    }

    private getTileOffset() {
        const { x, y } = this.getPlayerTileCoord();
        const keyPoint = this.parent.mapManager.currentMap.value.keyPoints[`${x}_${y}`];
        const player = this.parent.actorManager.getLeader();

        if (keyPoint && isBonfire(keyPoint)) {
            const { offset, playerScale } = this.parent.bonfireManager.getTileOffsets();
            this.playerOffset = offset;
            player.scale = playerScale;
            return this.playerOffset;
        }
        return vec(0, 0);
    }

    private async movementAfterEffects() {
        const player = this.parent.actorManager.getLeader();
        const { tileControlPrompts, saveExplorationState, playerPos } = useExploration();
        tileControlPrompts.set(null);
        playerPos.set({
            pos: vec(player.pos.x, player.pos.y),
            size: player.height,
        });

        const { x, y } = this.getPlayerTileCoord();
        const keyPoint = this.parent.mapManager.currentMap.value.keyPoints[`${x}_${y}`];

        if (this.bufferedInput && !isHaltingKeypoint(keyPoint)) {
            this.move(this.bufferedInput);
            delete this.bufferedInput;
        }

        setTimeout(() => {
            const coord = `${x}_${y}`;
            if (keyPoint) {
                if (isZoneChangePoint(keyPoint)) {
                    this.scene.events.emit('keypoint:zoneChange', { coord, keypoint: keyPoint });
                } else if (isBonfire(keyPoint)) {
                    this.scene.events.emit('keypoint:bonfire', { coord, keypoint: keyPoint });
                    saveExplorationState();
                } else {
                    saveExplorationState();
                    if (keyPoint.type === 'interactable') {
                        this.scene.events.emit('keypoint:interactable', {
                            coord,
                            keypoint: keyPoint,
                        });
                    }
                }
            } else {
                saveExplorationState();
            }
            this.scene.events.emit('moved', {
                newPos: this.getPlayerTileCoord(),
            });
        }, 75);
    }
}
