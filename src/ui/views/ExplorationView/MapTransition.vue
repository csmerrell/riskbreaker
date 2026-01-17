<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useExploration } from '../../../state/useExploration';

const { loaded, transitionMap, fadeInStart, fadeOutEnd } = useExploration();
const showOverlay = ref(false);

const GRID_SIZE = 200;
const CELL_SIZE = 2;
const BATCH_SIZE = 1000;
const DURATION_MS = 250;

onMounted(() => {
    // Subscribe to transition state changes for debugging
    transitionMap.subscribe((next) => {
        if (!next) return;
        if (!loaded.value) return;
        showOverlay.value = true;

        animateCanvas(canvasRef.value).then(() => {
            fadeOutEnd.set(true);
        });
    });

    fadeInStart.subscribe((shouldStart) => {
        if (shouldStart) {
            // Simulate fade in completion after a short delay
            animateCanvas(canvasRef.value).then(() => {
                showOverlay.value = false;
                fadeOutEnd.set(false);
                fadeInStart.set(false);
            });
        }
    });
});

const canvasRef = ref<HTMLCanvasElement | null>(null);

interface Cell {
    x: number;
    y: number;
    opacity: number; // 0 or 1
}

// Initialize grid cells
const cells: Cell[] = [];
for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
        cells.push({ x, y, opacity: 0 });
    }
}

/**
 * Draw the grid to the canvas
 */
function draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    for (const cell of cells) {
        if (cell.opacity > 0) {
            ctx.fillStyle = '#151d28'; // bg-bg color
            ctx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
}

/**
 * Animate grid in batches
 * Returns a Promise that resolves when animation is complete
 */
function animateCanvas(
    canvas: HTMLCanvasElement,
    { batchSize = BATCH_SIZE, durationMs = DURATION_MS } = {},
): Promise<void> {
    return new Promise((resolve) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            resolve();
            return;
        }

        const total = cells.length;
        const batches = Math.ceil(total / batchSize);
        const delay = durationMs / batches;

        // Weighted shuffle to favor top-left cells
        const shuffled = [...cells];
        shuffled.sort((a, b) => {
            const wA = 1 / (1 + a.x + a.y);
            const wB = 1 / (1 + b.x + b.y);
            return Math.random() ** (1 / wB) - Math.random() ** (1 / wA);
        });

        let cursor = 0;

        function nextBatch() {
            if (cursor >= shuffled.length) {
                resolve(); // animation complete
                return;
            }

            const batch = shuffled.slice(cursor, cursor + batchSize);
            cursor += batchSize;

            // Toggle opacity
            for (const cell of batch) {
                cell.opacity = cell.opacity === 0 ? 1 : 0;
            }

            draw(ctx);

            setTimeout(nextBatch, delay);
        }

        nextBatch();
    });
}
</script>

<template>
    <canvas ref="canvasRef" class="absolute left-0 top-0 size-full"></canvas>
</template>
