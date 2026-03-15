import Aseprite from 'ase-parser';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - resolve paths relative to script location
const ASE_FILE = process.argv[2] || path.join(__dirname, 'AnimationMain.ase');
const CONFIG_FILE = process.argv[3] || path.join(__dirname, 'aseprite-extract-config.json');

// Load configuration
const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));

// Parse Aseprite file
const buffer = fs.readFileSync(ASE_FILE);
const aseFile = new Aseprite(buffer, path.basename(ASE_FILE));
aseFile.parse();

console.log(`Parsing: ${ASE_FILE}`);
console.log(`Canvas: ${aseFile.width}x${aseFile.height}`);
console.log(`Layers: ${aseFile.layers.length}`);
console.log('');

// Helper function to sanitize layer name to PascalCase (remove whitespace)
function sanitizeLayerName(name) {
    return name.replace(/\s+/g, '');
}

// Helper function to ensure directory exists
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Process each layer
async function extractLayers() {
    const frame = aseFile.frames[0]; // We only have one frame

    for (const layer of aseFile.layers) {
        const sanitizedName = sanitizeLayerName(layer.name);
        const outputFilename = `${sanitizedName}.png`;

        // Determine output directory
        const targetDir = config.layers[sanitizedName] || config.default;
        const outputDir = path.resolve(__dirname, targetDir);
        const outputPath = path.join(outputDir, outputFilename);

        // Find the cel for this layer in the frame
        const cel = frame.cels.find((c) => c.layerIndex === aseFile.layers.indexOf(layer));

        if (!cel) {
            console.log(`⚠️  Skipping ${layer.name} (no cel data)`);
            continue;
        }

        try {
            // Create a blank canvas at full sprite dimensions
            const canvas = sharp({
                create: {
                    width: aseFile.width,
                    height: aseFile.height,
                    channels: 4,
                    background: { r: 0, g: 0, b: 0, alpha: 0 },
                },
            });

            // Convert cel data to PNG buffer
            const celBuffer = await sharp(cel.rawCelData, {
                raw: {
                    width: cel.w,
                    height: cel.h,
                    channels: 4,
                },
            })
                .png()
                .toBuffer();

            // Composite the cel onto the canvas at its position
            const finalBuffer = await canvas
                .composite([
                    {
                        input: celBuffer,
                        top: cel.ypos,
                        left: cel.xpos,
                    },
                ])
                .png()
                .toBuffer();

            // Ensure output directory exists
            ensureDir(outputDir);

            // Write the file
            fs.writeFileSync(outputPath, finalBuffer);

            console.log(`✓ ${layer.name} → ${path.relative(process.cwd(), outputPath)}`);
        } catch (error) {
            console.error(`✗ Failed to extract ${layer.name}:`, error.message);
        }
    }
}

extractLayers()
    .then(() => {
        console.log('');
        console.log('✓ Extraction complete');
    })
    .catch((error) => {
        console.error('Extraction failed:', error);
        process.exit(1);
    });
