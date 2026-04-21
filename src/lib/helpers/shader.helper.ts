import { Actor } from 'excalibur';

export function progressShader(actor: Actor, duration: number): Promise<void> {
    const startTime = Date.now();

    return new Promise<void>((resolve) => {
        const updateFn = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1.0);

            // Update shader uniform
            if (actor.graphics.material) {
                actor.graphics.material.update((shader) => {
                    shader.trySetUniformFloat('u_progress', progress);
                });
            }

            // Check if complete
            if (progress >= 1.0) {
                actor.off('preupdate', updateFn);
                resolve();
            }
        };
        actor.events.on('preupdate', updateFn);
    });
}
