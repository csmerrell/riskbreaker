import { Loader } from 'excalibur';

export class LiteLoader extends Loader {
    override onDraw() {
        // Override to do nothing (removes default Excalibur loading screen)
    }
}
