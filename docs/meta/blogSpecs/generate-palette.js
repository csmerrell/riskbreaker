const fs = require('fs');
const { PNG } = require('pngjs');

// Usage:
// node generate-palette.js palette.json output.png

const input = process.argv[2] || 'palette.json';
const output = process.argv[3] || 'palette.png';

const { ramps } = JSON.parse(fs.readFileSync(input, 'utf8'));

const CELL_SIZE = 24;
const COLS = 4;

const width = COLS * CELL_SIZE;
const height = ramps.length * CELL_SIZE;

const png = new PNG({
    width,
    height,
    colorType: 6, // RGBA
});

// Starts fully transparent by default.
png.data.fill(0);

function setPixel(x, y, r, g, b, a = 255) {
    const idx = (png.width * y + x) * 4;
    png.data[idx] = r;
    png.data[idx + 1] = g;
    png.data[idx + 2] = b;
    png.data[idx + 3] = a;
}

function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');

    return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
    };
}

ramps.forEach((ramp, row) => {
    ramp.colors.forEach((hex, col) => {
        const { r, g, b } = hexToRgb(hex);

        const startX = col * CELL_SIZE;
        const startY = row * CELL_SIZE;

        for (let y = startY; y < startY + CELL_SIZE; y++) {
            for (let x = startX; x < startX + CELL_SIZE; x++) {
                setPixel(x, y, r, g, b, 255);
            }
        }
    });
});

png.pack().pipe(fs.createWriteStream(output));

console.log(`Wrote ${output} (${width}x${height})`);
