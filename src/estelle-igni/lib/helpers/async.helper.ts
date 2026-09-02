export async function loopUntil(
    conditionFn: () => boolean,
    repeatingFn: () => void,
    stepMs: number = 25,
) {
    let count = 0;
    while (!conditionFn()) {
        count++;
        if (count > 100) {
            console.warn(
                `[loopUntil] Loop has occurred more than 100 times. 
                Is there an exit condition that will never be met?`,
            );
        }
        repeatingFn();

        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, stepMs);
        });
    }
}
