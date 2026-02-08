#!/usr/bin/env node

import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const targets = [
  '.next',
  'tsconfig.tsbuildinfo',
  'node_modules/.cache',
  '.eslintcache',
];

console.log('[clear-cache] Frontend cache cleanup starting...');

for (const target of targets) {
  const fullPath = path.join(projectRoot, target);
  if (!existsSync(fullPath)) {
    console.log(`[skip] ${target} (not found)`);
    continue;
  }

  rmSync(fullPath, { recursive: true, force: true });
  console.log(`[ok] removed ${target}`);
}

console.log('[clear-cache] Done.');
console.log('[clear-cache] Browser app cache: use the "Clear Cache & Refresh" button in the UI.');
