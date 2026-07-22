// Programmatic runner that executes Mocha tests and writes an Excel summary.
const Mocha = require('mocha');
const path = require('path');
const xlsx = require('xlsx');
const fs = require('fs');

const mocha = new Mocha({
  timeout: 120000,
  reporter: 'spec'
});

// Add all test files under ./tests
fs.readdirSync(path.join(__dirname, 'tests'))
  .filter(file => file.endsWith('.test.js'))
  .forEach(file => mocha.addFile(path.join(__dirname, 'tests', file)));

// Store results
const results = [];

mocha.suite.on('test', test => {
  test.startTime = Date.now();
});

mocha.suite.on('test end', test => {
  const duration = (Date.now() - test.startTime) / 1000;
  results.push({
    testId: results.length + 1,
    module: test.parent.title || 'General',
    name: test.title,
    description: test.title,
    steps: 'See test implementation',
    expected: 'Pass',
    actual: test.state === 'passed' ? 'Pass' : 'Fail',
    status: test.state,
    execTime: duration
  });
});

mocha.run(failures => {
  const header = [
    'Test ID', 'Module', 'Test Name', 'Description',
    'Steps', 'Expected Result', 'Actual Result',
    'Status', 'Execution Time (s)'
  ];
  const rows = results.map(r => [
    r.testId, r.module, r.name, r.description,
    r.steps, r.expected, r.actual,
    r.status, r.execTime
  ]);

  const ws = xlsx.utils.aoa_to_sheet([header, ...rows]);

  const reportsDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

  const outPath = path.join(reportsDir, 'Auralis_Mobile_Test_Report.xlsx');
  const wb = { SheetNames: ['Report'], Sheets: { Report: ws } };
  xlsx.writeFile(wb, outPath);

  console.log(`\nMobile test report generated: ${outPath}`);
  process.exit(failures ? 1 : 0);
});
