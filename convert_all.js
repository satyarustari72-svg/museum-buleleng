const fs = require('fs');
const path = require('path');
const heicConvert = require('heic-convert');

const rawDir = path.join('asset', 'all_raw');
const outBaseDir = path.join('asset', 'all_jpg');
if (!fs.existsSync(outBaseDir)) fs.mkdirSync(outBaseDir, { recursive: true });

const allFiles = [];
const rooms = fs.readdirSync(rawDir);

for (const room of rooms) {
  const roomPath = path.join(rawDir, room);
  if (!fs.statSync(roomPath).isDirectory()) continue;
  const files = fs.readdirSync(roomPath);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (['.heif', '.heic', '.jpg', '.jpeg', '.png'].includes(ext)) {
      allFiles.push({ room, file, fullPath: path.join(roomPath, file) });
    }
  }
}

const CONCURRENCY = 6;
let idx = 0;
let successCount = 0;
let failCount = 0;
const startTime = Date.now();

async function worker() {
  while (idx < allFiles.length) {
    const current = allFiles[idx++];
    const safeRoom = current.room.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeName = current.file.replace(/[^a-zA-Z0-9_\-\.]/g, '_').replace(/\.(heif|heic|png|jpeg)$/i, '.jpg');
    const outRoomDir = path.join(outBaseDir, safeRoom);
    if (!fs.existsSync(outRoomDir)) fs.mkdirSync(outRoomDir, { recursive: true });
    const outPath = path.join(outRoomDir, safeName);

    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) {
      successCount++;
      continue;
    }

    try {
      const ext = path.extname(current.file).toLowerCase();
      if (ext === '.jpg') {
        fs.copyFileSync(current.fullPath, outPath);
      } else {
        const input = fs.readFileSync(current.fullPath);
        const output = await heicConvert({ buffer: input, format: 'JPEG', quality: 0.70 });
        fs.writeFileSync(outPath, output);
      }
      successCount++;
      if (successCount % 25 === 0 || successCount === allFiles.length) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log('Progress: ' + successCount + '/' + allFiles.length + ' (' + elapsed + 's)');
      }
    } catch (err) {
      failCount++;
      console.error('Failed:', current.room, current.file, err.message);
    }
  }
}

(async () => {
  console.log('Starting batch conversion of ' + allFiles.length + ' images with concurrency ' + CONCURRENCY + '...');
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) workers.push(worker());
  await Promise.all(workers);
  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('All done! Success: ' + successCount + ', Failed: ' + failCount + ', Elapsed: ' + totalElapsed + 's');
})();

