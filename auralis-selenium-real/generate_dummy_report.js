// generate_dummy_report.js
// This script creates a dummy Excel report emulating 20 modules (pages) with 120+ test cases each.
// It uses the same 'xlsx' library already employed in the real test runner.

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Configuration
const MODULE_COUNT = 20;
const TESTS_PER_MODULE = 120; // >=120 as requested
const OUTPUT_FILE = path.join(__dirname, 'Auralis_Dummy_Test_Report.xlsx');

// Helper to generate a pseudo‑random test name
function randomTestName(moduleName, index) {
  const actions = ['Login', 'Logout', 'Create', 'Edit', 'Delete', 'Search', 'Navigate', 'Submit', 'Validate', 'Upload'];
  const objects = ['User', 'Profile', 'Item', 'Record', 'Form', 'Page', 'Widget', 'Report'];
  const action = actions[Math.floor(Math.random() * actions.length)];
  const object = objects[Math.floor(Math.random() * objects.length)];
  return `${moduleName} - ${action} ${object} #${index}`;
}

// Build worksheet data
const header = [
  'Test ID',
  'Module',
  'Test Name',
  'Description',
  'Steps',
  'Expected Result',
  'Actual Result',
  'Status',
  'Execution Time (s)'
];

const rows = [];
let testId = 1;
for (let m = 1; m <= MODULE_COUNT; m++) {
  const moduleName = `Module${m}`; // placeholder module name (page title)
  for (let i = 1; i <= TESTS_PER_MODULE; i++) {
    const testName = randomTestName(moduleName, i);
    rows.push([
      testId++,
      moduleName,
      testName,
      `Auto‑generated test case for ${moduleName}`,
      `Step 1: ...\nStep 2: ...`,
      'All UI elements behave as expected',
      'Pending (to be filled after real execution)',
      'Not Run',
      ''
    ]);
  }
}

// Create workbook and worksheet
const ws = xlsx.utils.aoa_to_sheet([header, ...rows]);

const wb = { SheetNames: ['TestReport'], Sheets: { TestReport: ws } };

// Write workbook to file
xlsx.writeFile(wb, OUTPUT_FILE);

console.log(`Dummy Selenium test report generated at ${OUTPUT_FILE}`);
