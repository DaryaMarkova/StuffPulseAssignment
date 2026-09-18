import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSeedNodes } from '../src/data/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../../public/data');
const outFile = path.join(outDir, 'nodes.json');

mkdirSync(outDir, { recursive: true });

const payload = { nodes: createSeedNodes() };

writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

console.log(`Wrote ${payload.nodes.length} nodes → ${outFile}`);
