import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Configuration
const ICON_SIZE = 24;
const COLUMNS = 10;
const INPUT_FOLDER = process.argv[2] || './icons';
const OUTPUT_FILE = process.argv[3] || './stitched-icons.png';

async function stitchIcons() {
  // Read all PNG files from the input folder
  const files = fs.readdirSync(INPUT_FOLDER)
    .filter(file => file.toLowerCase().endsWith('.png'))
    .sort();

  if (files.length === 0) {
    console.error('No PNG files found in the input folder');
    process.exit(1);
  }

  console.log(`Found ${files.length} PNG files`);

  // Calculate dimensions
  const rows = Math.ceil(files.length / COLUMNS);
  const width = COLUMNS * ICON_SIZE;
  const height = rows * ICON_SIZE;

  console.log(`Creating ${width}x${height} image (${COLUMNS} columns × ${rows} rows)`);

  // Create a blank canvas
  const canvas = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  });

  // Prepare composite operations
  const compositeOps = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(INPUT_FOLDER, file);
    
    const col = i % COLUMNS;
    const row = Math.floor(i / COLUMNS);
    const x = col * ICON_SIZE;
    const y = row * ICON_SIZE;

    compositeOps.push({
      input: filePath,
      left: x,
      top: y
    });
  }

  // Composite all icons onto the canvas
  await canvas
    .composite(compositeOps)
    .png()
    .toFile(OUTPUT_FILE);

  console.log(`✓ Successfully created ${OUTPUT_FILE}`);
  console.log(`  Total icons: ${files.length}`);
  console.log(`  Dimensions: ${width}x${height}px`);
}

stitchIcons().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
