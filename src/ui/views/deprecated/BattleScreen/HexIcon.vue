<script setup lang="ts">
import { HexTile } from '@/game/actors/Arena/HexTile';
import { getScale } from '@/lib/helpers/screen.helper';

type Props = {
    hex: HexTile;
    focused: boolean;
};

const { hex, focused = false } = defineProps<Props>();

// Cardinalities in spatial order: NW, N, NE, C, SW, S, SE
const cardinalities = ['NW', 'N', 'NE', 'C', 'SW', 'S', 'SE'] as const;

// Flat-top hex axial positions (q, r)
const positions = {
    C: { x: 0, y: 0 },
    N: { x: 0, y: -1 },
    NE: { x: 1, y: -1 },
    SE: { x: 1, y: 0 },
    S: { x: 0, y: 1 },
    SW: { x: -1, y: 1 },
    NW: { x: -1, y: 0 },
};

const HEX_SIZE = 1.25; // tweak as needed
const HEX_PADDING = 0.33; // tweak as needed
const scale = Math.min(3, getScale());

const radius = HEX_SIZE * scale;
const padding = HEX_PADDING * scale;

const svgWidth = 3 * (radius * 2 + padding);
const svgHeight = (radius * 2 + padding) * 3;

const baseFill = '#7D6C0C';
const brightFill = '#D2BF55';

// Flat-top hex math
function getHexPosition(card: (typeof cardinalities)[number]) {
    const { x: q, y: r } = positions[card];
    // Flat-top: x = size * 3/2 * q, y = size * sqrt(3) * (r + q/2)
    const xOffset = (radius + padding) * 1.5 * q;
    const yOffset = (radius + padding) * Math.sqrt(3) * (r + q / 2);
    return { x: xOffset, y: yOffset };
}

function getHexPoints(cx: number, cy: number, size: number) {
    // Flat-top hex: start at angle 0 (right), then every 60deg
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = cx + size * Math.cos(angle);
        const py = cy + size * Math.sin(angle);
        points.push(`${px},${py}`);
    }
    return points.join(' ');
}
</script>

<template>
    <div class="z-10">
        <div
            class="relative -top-1/2 left-[-2px] -translate-y-1/2"
            :style="{ height: `${svgHeight}px`, width: `${svgWidth}px` }"
        >
            <div
                v-if="!focused"
                class="before:absolute before:inset-0 before:-inset-x-px before:inset-y-[10%] before:z-0 before:rounded-lg before:bg-bg"
                :class="focused ? 'opacity-50' : ''"
            />
            <svg :width="svgWidth" :height="svgHeight" class="absolute inset-0">
                <g>
                    <template v-for="card in cardinalities" :key="card">
                        <polygon
                            class="bg-black p-[10px]"
                            :points="
                                getHexPoints(
                                    getHexPosition(card).x + svgWidth / 2,
                                    getHexPosition(card).y + svgHeight / 2,
                                    HEX_SIZE * scale,
                                )
                            "
                            :fill="card === hex.cardinality ? brightFill : baseFill"
                            :opacity="1"
                            stroke="#411d31"
                            stroke-width="0.5"
                        />
                    </template>
                </g>
            </svg>
        </div>
    </div>
</template>
