import { moveAlongBezier } from '@/lib/helpers/movement.helper';
import { getScale } from '@/lib/helpers/screen.helper';
import { BattleActor } from '@/state/battle/useBattle';
import { useShader } from '@/state/useShader';
import {
    Actor,
    Color,
    Component,
    Entity,
    Font,
    isActor,
    Rectangle,
    Text,
    vec,
    Vector,
} from 'excalibur';

const FONTS = {
    yellow500: 'd2bf55',
    rose950: '4d0218',
    rose700: 'c70036',
    rose500: 'ff2056',
};

export class HealthComponent extends Component {
    public maxHealth: number = 1;
    public currentHealth: number = 1;
    public owner!: BattleActor;
    private width: number;
    private offset: Vector;

    constructor(opts: { max: number; current?: number; offset?: Vector; width?: number }) {
        super();
        const { max, current, offset = vec(0, -12), width = 24 } = opts;
        this.maxHealth = max;
        this.currentHealth = current ?? max;
        this.width = width;
        this.offset = offset;
    }

    onAdd(owner: Entity): void {
        if (!isActor(owner))
            throw new Error('Health component can only be added to battle actors.');

        this.owner = owner as BattleActor;
        this.createHealthbars();
    }

    private healthBg!: Actor;
    private healthFg!: Actor;
    private createHealthbars() {
        const rectBg = new Rectangle({
            height: 10,
            width: this.width * 4,
            color: Color.fromHex(FONTS.rose950),
            strokeColor: Color.fromHex(FONTS.yellow500),
        });
        const rectFg = new Rectangle({
            height: 2,
            width: this.width * this.healthPct(),
            color: Color.fromHex(FONTS.rose700),
        });
        this.healthBg = new Actor({
            offset: this.offset.scale(vec(1, 16)).sub(vec(4, 0)),
            z: this.owner.z + 1,
            scale: vec(0.25, 0.25),
        });
        this.healthBg.graphics.add(rectBg);
        this.healthFg = new Actor({
            offset: this.offset,
            z: this.owner.z + 2,
            width: this.width,
        });
        this.healthFg.graphics.add(rectFg);
    }

    public healthPct() {
        return this.currentHealth / this.maxHealth;
    }

    public isDead() {
        return this.currentHealth <= 0;
    }

    public isWeak() {
        return this.currentHealth > 0 && this.currentHealth / this.maxHealth < 0.25;
    }

    public async endChanges() {
        if (this.isDead()) {
            this.die();
        } else if (this.isWeak()) {
            this.weaken();
        }

        useShader().removeBorder(this.owner);
    }

    public async hurt(damage: number): Promise<void | void[]> {
        if (damage < 0) return this.heal(-1 * damage);
        else if (damage === 0) return this.null();

        this.currentHealth = Math.max(0, this.currentHealth - damage);
        useShader().addBorder(this.owner, 'hurt');

        this.showHealth();
        const text = new Text({
            text: `${damage}`,
            color: Color.fromHex(FONTS.rose500),
            font: new Font({
                size: 32,
                family: 'Bowlby One',
                strokeColor: Color.fromHex(FONTS.rose950),
            }),
            scale: vec(1 / getScale(), 1 / getScale()),
        });
        this.showText(text);
        return this.owner.useAnimation('hurt');
    }

    public async heal(damage: number): Promise<void | void[]> {
        if (damage < 0) return this.hurt(-1 * damage);
        else if (damage === 0) return this.null();

        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + damage);
        useShader().addBorder(this.owner, 'heal');

        this.showHealth();
        return Promise.resolve();
    }

    private async null() {}

    private showText(text: Text) {
        const pos = this.offset.sub(vec(0, 4));
        const fontActor = new Actor({
            pos,
            z: this.owner.z + 10,
            scale: vec(this.owner.scale.x, 1),
        });
        fontActor.graphics.use(text);
        this.owner.addChild(fontActor);
        setTimeout(() => {
            const interval = setInterval(() => {
                if (fontActor.isKilled()) {
                    clearInterval(interval);
                    return;
                }
                fontActor.graphics.opacity -= 0.1;
                if (fontActor.graphics.opacity <= 0) {
                    fontActor.kill();
                    clearInterval(interval);
                    return;
                }
            }, 50);
        }, 1000);
        moveAlongBezier(
            fontActor,
            pos.add(vec(36 * this.owner.scale.x + ~~(Math.random() * 12), -12)),
            {
                amplitude: 8,
                duration: 2000,
            },
        ).then(() => {
            if (!fontActor.isKilled()) fontActor.kill();
        });
    }

    private fadeHandler?: NodeJS.Timeout;
    private showHealth() {
        this.healthBg.graphics.opacity = 1;
        this.healthFg.graphics.opacity = 1;
        const currentBarWidth = ~~(this.width * this.healthPct());
        this.healthFg.graphics.current!.width = currentBarWidth;
        this.healthFg.offset = vec(
            this.owner.scale.x * ((this.width - currentBarWidth) / 2),
            this.healthFg.offset.y,
        );

        if (!this.healthBg.isAdded) {
            this.owner.addChild(this.healthBg);
        }
        if (!this.healthFg.isAdded) {
            this.owner.addChild(this.healthFg);
        }

        const timeout = setTimeout(() => {
            if (timeout !== this.fadeHandler) {
                return;
            }
            const interval = setInterval(() => {
                if (timeout !== this.fadeHandler) {
                    clearInterval(interval);
                    return;
                }
                this.healthBg.graphics.opacity -= 0.05;
                this.healthFg.graphics.opacity -= 0.05;
                if (this.healthBg.graphics.opacity <= 0 && this.healthFg.graphics.opacity <= 0) {
                    this.owner.removeChild(this.healthBg);
                    this.owner.removeChild(this.healthFg);
                    clearInterval(interval);
                }
            }, 25);
        }, 2000);
        this.fadeHandler = timeout;
    }

    private weaken() {
        this.owner.useAnimation('weak');
    }

    private die() {
        this.owner.useAnimation('death');
    }
}
