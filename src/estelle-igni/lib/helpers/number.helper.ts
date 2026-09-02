import { InternalSheetAnimation } from '@/db/types';

export function range(start: number, length: number): number[] {
    return [...Array(length).keys()].map((n) => n + start);
}

export function frameRange(numCols: number, spriteRowDef: InternalSheetAnimation) {
    const { row, frameCount: length, startFrame } = spriteRowDef;
    const start = numCols * row + startFrame;
    return [...Array(length).keys()].map((n) => n + start);
}

export function sumArray(arr: number[]) {
    return arr.reduce((sum, n) => (sum += n), 0);
}

export function sortArrayRandom<T>(array: T[]) {
    const arr = [...array];
    let currentIndex = arr.length;

    while (currentIndex != 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
    }

    return arr;
}
