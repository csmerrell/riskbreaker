import Aseprite from 'ase-parser';
import fs from 'fs';

const buffer = fs.readFileSync('./AnimationMain.ase');
const aseFile = new Aseprite(buffer, 'AnimationMain.ase');

aseFile.parse();

console.log('Canvas dimensions:', aseFile.width, 'x', aseFile.height);
console.log('Number of frames:', aseFile.numFrames);
console.log('Number of layers:', aseFile.layers.length);
console.log('\nLayers:');

aseFile.layers.forEach((layer, index) => {
    console.log(`  ${index + 1}. ${layer.name}`);
});
