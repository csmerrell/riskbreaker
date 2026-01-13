import { Component } from 'excalibur';

export class LightSource extends Component {
    public radius: number;
    constructor(opts: { radius: number }) {
        super();
        this.radius = opts.radius;
    }
}
