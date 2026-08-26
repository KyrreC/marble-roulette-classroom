const { readFileSync, readdirSync, statSync } = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || '');
if (!root || !statSync(root).isDirectory()) throw new Error('Build directory is required');

const textExtensions = new Set(['.css', '.html', '.js', '.json', '.map', '.svg', '.txt', '.webmanifest']);
const forbidden = [
  'umami.lazygyu.net',
  'marblerouletteshop.com',
  'G-5899C1DJM0',
  '/api/ads/',
  '/api/external/',
];

const files = [];
const walk = (directory) => {
  for (const entry of readdirSync(directory)) {
    const file = path.join(directory, entry);
    if (statSync(file).isDirectory()) walk(file);
    else files.push(file);
  }
};
walk(root);

const violations = [];
for (const file of files) {
  if (!textExtensions.has(path.extname(file).toLowerCase())) continue;
  const content = readFileSync(file, 'utf8');
  for (const value of forbidden) {
    if (content.includes(value)) violations.push(`${path.relative(root, file)} contains ${value}`);
  }
}

if (violations.length) {
  console.error('Privacy verification failed:\n' + violations.join('\n'));
  process.exit(1);
}

console.log(`Privacy verification passed for ${path.basename(root)} (${files.length} files)`);
