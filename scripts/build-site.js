const { spawnSync } = require('node:child_process');
const { copyFileSync, mkdirSync, rmSync, writeFileSync } = require('node:fs');
const path = require('node:path');

const mode = process.argv[2];
if (!['online', 'portable'].includes(mode)) {
  throw new Error('Usage: node scripts/build-site.js <online|portable>');
}

const root = path.resolve(__dirname, '..');
const distName = mode === 'online' ? 'dist-online' : 'dist-portable';
const distDir = path.join(root, distName);
const publicUrl = mode === 'online' ? process.env.PAGES_BASE_PATH || './' : './';

if (!['dist-online', 'dist-portable'].includes(path.basename(distDir))) {
  throw new Error(`Refusing to clean unexpected directory: ${distDir}`);
}

rmSync(distDir, { recursive: true, force: true });
const result = spawnSync(
  process.execPath,
  [require.resolve('parcel/lib/bin.js'), 'build', 'index.html', '--dist-dir', distName, '--public-url', publicUrl],
  { cwd: root, stdio: 'inherit' }
);

if (result.status !== 0) process.exit(result.status ?? 1);

mkdirSync(distDir, { recursive: true });
copyFileSync(path.join(root, 'LICENSE'), path.join(distDir, 'LICENSE.txt'));
writeFileSync(
  path.join(distDir, 'NOTICE.txt'),
  [
    'Marble Roulette Classroom is an unofficial classroom-oriented derivative.',
    'Based on LazyGyu Marble Roulette: https://github.com/lazygyu/roulette',
    'Upstream copyright and MIT license are preserved in LICENSE.txt.',
    'This classroom build contains no analytics, advertisements, or external name/sprite lookup.',
    '',
  ].join('\n'),
  'utf8'
);

const verify = spawnSync(process.execPath, [path.join(root, 'scripts', 'verify-build.js'), distDir], {
  cwd: root,
  stdio: 'inherit',
});
if (verify.status !== 0) process.exit(verify.status ?? 1);
