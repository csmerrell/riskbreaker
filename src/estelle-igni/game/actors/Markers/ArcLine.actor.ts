import * as ex from 'excalibur';

export class ArcLine extends ex.Actor {
    private arcResolve: () => void;
    public arcComplete: Promise<void> = new Promise((resolve) => {
        this.arcResolve = resolve;
    });

    private animationProgress: number = 0.0;
    private animationSpeed: number = 0.05;
    private curve: ex.BezierCurve;
    private points: ex.Vector[];
    private segments: ex.Line[] = [];

    constructor(start: ex.Vector, end: ex.Vector) {
        super();

        const control1 = ex.vec(start.x + (end.x - start.x) / 4, start.y - 25);
        const control2 = ex.vec(start.x + (3 * (end.x - start.y)) / 4, end.y - 25);

        this.curve = new ex.BezierCurve({
            controlPoints: [start, control1, control2, end],
        });

        this.points = [start];
    }

    onAdd() {
        this.graphics.anchor = ex.Vector.Zero;
    }

    onPostUpdate() {
        if (this.points.length > 10 || this.animationProgress > 1) {
            this.points.shift();
            this.segments.shift();
        }
        if (this.animationProgress < 1) {
            this.points.push(this.curve.getPoint(this.animationProgress));
            const segment = new ex.Line({
                start: this.points[this.points.length - 2],
                end: this.points[this.points.length - 1],
            });

            segment.thickness = 1;
            segment.color = ex.Color.Azure;
            this.segments.push(segment);
        }

        this.graphics.add(
            'curve',
            new ex.GraphicsGroup({
                members: this.segments,
            }),
        );
        this.graphics.use('curve');

        this.animationProgress += this.animationSpeed * this.easeInOut(this.animationProgress);
        if (this.points.length === 0) {
            this.arcResolve();
            this.kill();
        }
    }

    easeInOut(t: number) {
        return t < 0.25 ? 0.75 : t > 0.75 ? 0.25 : 1.25;
    }
}
