import { resources } from '@/resource';
import { useClock } from '@/state/useClock';
import {
    Actor,
    Engine,
    ImageSource,
    SpriteSheet,
    vec,
    Vector,
    Color,
    Polygon,
    GraphicsGroup,
    Sprite,
} from 'excalibur';
import { MAX_CT, SpeedComponent } from '../StrategemActor/components/SpeedComponent';
import type { StrategemActor } from '../StrategemActor/StrategemActor';

const source: ImageSource = resources.image.tiles.hexBase;

export class HexTile extends Actor {
    public sheet: SpriteSheet;
    public spriteDimensions = {
        width: 39,
        height: 26,
    };
    public fieldPosition: Vector;

    private unitRef: StrategemActor;
    private fillPct: number = 0;
    private overlayColor: string = 'rgba(179, 179, 255, 0.25)'; // Default color for the overlay
    private perimeterPoints: Vector[] = [];
    private baseGraphic: Sprite;
    private intervalRate: number;
    private overlay: Polygon;
    private graphicsGroup: GraphicsGroup;
    private atbInterval: NodeJS.Timeout;
    private atbChargePerTick: () => number;

    public cardinality: 'N' | 'NW' | 'NE' | 'C' | 'SW' | 'SE' | 'S';

    constructor(options: { cardinality: typeof this.cardinality; pos?: Vector; invert?: boolean }) {
        super({
            height: 21,
            width: 39,
            pos: options.pos ?? vec(0, 0),
        });
        this.fieldPosition = options.pos ?? vec(0, 0);
        this.cardinality = options.cardinality;
        this.sheet = SpriteSheet.fromImageSource({
            image: source,
            grid: {
                rows: 1,
                columns: 1,
                spriteWidth: 39,
                spriteHeight: 26,
            },
        });

        this.graphics.flipHorizontal = options?.invert;
        this.perimeterPoints = [
            vec(1, 6), // v1
            vec(16, 0), // v2
            vec(32, 1), // v3
            vec(38, 12), // v4
            vec(38, 13), // v5
            vec(22, 19), // v6
            vec(6, 18), // v7
            vec(1, 7), // v8
        ];

        this.baseGraphic = this.sheet.getSprite(0, 0);
    }

    static getDependencies() {
        return [source];
    }

    public setActorRef(actor: StrategemActor) {
        this.unitRef = actor;
    }

    public onInitialize(_engine: Engine): void {
        this.graphics.add('base', this.sheet.getSprite(0, 0));
        this.graphics.use('base');
    }

    private onTick(perimeterPoints: Vector[], baseGraphic: Sprite) {
        this.calibrateATB();
        this.fillPct = this.unitRef.getComponent(SpeedComponent).currentComputedCT() / 100;

        // Compute the fill point along the top and bottom perimeters
        const topFillPoint = this.pointAlongThreeSides(
            perimeterPoints[0], // v1
            perimeterPoints[1], // v2
            vec(perimeterPoints[2].x, perimeterPoints[2].y), // v3
            perimeterPoints[3], // v4,
            this.fillPct,
        );

        const bottomFillPoint = this.pointAlongThreeSides(
            perimeterPoints[7], // v8
            perimeterPoints[6], // v7
            perimeterPoints[5], // v3
            perimeterPoints[4], // v5,
            this.fillPct,
        );

        const points: Vector[] = [];
        for (let i = 0; i < 4; i++) {
            if (topFillPoint.x > perimeterPoints[i].x) {
                points.push(perimeterPoints[i]);
            }
        }
        points.push(topFillPoint);
        points.push(bottomFillPoint);

        for (let i = 4; i < 8; i++) {
            if (bottomFillPoint.x > perimeterPoints[i].x) {
                points.push(perimeterPoints[i]);
            }
        }

        const yMin =
            points[
                points.reduce(
                    (highestIdx, pt, idx) => (pt.y < points[highestIdx].y ? idx : highestIdx),
                    0,
                )
            ].y;

        this.graphics.remove('combined');
        if (this.graphicsGroup) {
            this.overlay.points = points;
            this.graphicsGroup.members.splice(1, 1);
            this.graphicsGroup.members.push({ graphic: this.overlay, offset: vec(1, yMin + 1) });
        } else {
            this.overlay = new Polygon({
                points,
                color: Color.fromRGBString(this.overlayColor),
            });
            this.graphicsGroup = new GraphicsGroup({
                members: [
                    { graphic: baseGraphic, offset: Vector.Zero },
                    {
                        graphic: this.overlay,
                        offset: vec(1, yMin + 1),
                    },
                ],
            });
        }

        this.graphics.remove('combined');
        this.graphics.add('combined', this.graphicsGroup);
        this.graphics.use('combined');
    }

    public calibrateATB(chargePerTick?: () => number, initialFill?: number) {
        this.atbChargePerTick = chargePerTick ?? this.atbChargePerTick;
        this.fillPct = initialFill ?? this.fillPct;

        const { tickRate } = useClock();
        const ticksRequired = MAX_CT / this.atbChargePerTick();
        const msToFill = tickRate.value * ticksRequired;

        this.intervalRate = Math.round(msToFill / MAX_CT + 0.5);

        if (this.atbInterval) {
            clearInterval(this.atbInterval);

            this.atbInterval = setInterval(() => {
                this.onTick(this.perimeterPoints, this.baseGraphic);
            }, this.intervalRate);
        }
    }

    public runATB() {
        this.atbInterval = setInterval(() => {
            this.onTick(this.perimeterPoints, this.baseGraphic);
        }, this.intervalRate);
    }

    private pointAlongThreeSides(p0: Vector, p1: Vector, p2: Vector, p3: Vector, fillPct: number) {
        fillPct = Math.max(0, Math.min(1, fillPct)); // Clamp between 0 and 1

        function length(a: Vector, b: Vector) {
            return Math.hypot(b.x - a.x, b.y - a.y);
        }

        function interpolate(a: Vector, b: Vector, fillPct: number) {
            return vec(a.x + (b.x - a.x) * fillPct, a.y + (b.y - 0.5 - a.y) * fillPct);
        }

        const lenA = length(p0, p1);
        const lenB = length(p1, p2);
        const lenC = length(p2, p3);
        const total = lenA + lenB + lenC;

        let dist = fillPct * total;

        if (dist <= lenA) {
            return interpolate(p0, p1, dist / lenA);
        }

        dist -= lenA;
        if (dist <= lenB) {
            return interpolate(p1, p2, dist / lenB);
        }

        dist -= lenB;
        return interpolate(p2, p3, dist / lenC);
    }

    public clearOverlayFill(options: { cancel?: boolean } = {}) {
        this.graphics.use('base'); // Switch back to the base graphic
        this.fillPct = 0;

        if (options.cancel) {
            clearInterval(this.atbInterval);
        }
    }
}
