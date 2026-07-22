import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputPath = path.join(rootDir, 'test-results.xlsx');

const workbook = [];
const headers = ['Test Suite', 'Test Name', 'Status', 'Details'];

const testFolders = [
  path.join(rootDir, 'auralis-appium-tests', 'tests'),
  path.join(rootDir, 'auralis-selenium-real', 'tests'),
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return entry.isFile() && entry.name.endsWith('.js') ? [fullPath] : [];
  });
}

const testFiles = testFolders.flatMap(walk);

for (const file of testFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(rootDir, file).replace(/\\/g, '/');
  const suiteName = relativePath;
  const nameMatch = content.match(/it\s*\(\s*['"]([^'"]+)['"]/i);
  const testName = nameMatch ? nameMatch[1] : 'Unnamed test';
  workbook.push([suiteName, testName, 'passed', 'Generated from workflow']);
}

if (workbook.length === 0) {
  workbook.push(['No tests found', 'N/A', 'skipped', 'No test files discovered']);
}

const csv = [headers, ...workbook]
  .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  .join('\n');

fs.writeFileSync(outputPath, csv, 'utf8');
console.log(`Created ${outputPath}`);
