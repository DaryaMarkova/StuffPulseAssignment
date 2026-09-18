import { createGzip } from 'node:zlib';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable, PassThrough } from 'node:stream';

const LIMIT_BYTES = 200 * 1024;
const DIST = path.resolve('dist');
const EXTENSIONS = new Set(['.js', '.css', '.html', '.svg']);

/**
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return walk(full);
      }

      return [full];
    }),
  );

  return files.flat();
}

/**
 * @param {Buffer} buf
 * @returns {Promise<number>}
 */
async function gzipSize(buf) {
  const gzip = createGzip({ level: 9 });
  const sink = new PassThrough();
  let size = 0;

  sink.on('data', (chunk) => {
    size += chunk.length;
  });

  await pipeline(Readable.from(buf), gzip, sink);

  return size;
}

const all = await walk(DIST);
const assets = all.filter((file) => EXTENSIONS.has(path.extname(file)));

let totalGzip = 0;

for (const file of assets) {
  const buf = await readFile(file);
  const gz = await gzipSize(buf);
  const raw = (await stat(file)).size;
  totalGzip += gz;
  console.log(
    `${path.relative(DIST, file).padEnd(40)} raw ${String(raw).padStart(8)}  gzip ${String(gz).padStart(8)}`,
  );
}

const kb = (totalGzip / 1024).toFixed(1);
console.log(`\nTOTAL gzip: ${totalGzip} bytes (${kb} KiB), limit ${LIMIT_BYTES} (${LIMIT_BYTES / 1024} KiB)`);

if (totalGzip > LIMIT_BYTES) {
  console.error('FAIL: production gzip size exceeds 200 KiB');
  process.exit(1);
}

console.log('OK: within 200 KiB gzip budget');
