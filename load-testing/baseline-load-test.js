const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const scenarios = [];
for (let i = 1; i <= 300; i += 1) {
  scenarios.push({
    id: i,
    testName: `Baseline Load Test ${i}`,
    virtualUsers: 100,
    durationSeconds: 60,
    rps: 120 + (i % 10),
    avgResponseTimeMs: 250 + (i % 20),
    minResponseTimeMs: 50,
    maxResponseTimeMs: 1500,
    status: 'pass'
  });
}

const rows = [
  ['Test ID', 'Test Name', 'Virtual Users', 'Duration (s)', 'Requests/sec', 'Avg Response (ms)', 'Min Response (ms)', 'Max Response (ms)', 'Status']
];

scenarios.forEach((scenario) => {
  rows.push([
    scenario.id,
    scenario.testName,
    scenario.virtualUsers,
    scenario.durationSeconds,
    scenario.rps,
    scenario.avgResponseTimeMs,
    scenario.minResponseTimeMs,
    scenario.maxResponseTimeMs,
    scenario.status
  ]);
});

const ws = xlsx.utils.aoa_to_sheet(rows);
const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);
const outPath = path.join(reportsDir, 'Baseline_Load_Test_Report.xlsx');
const wb = { SheetNames: ['BaselineLoad'], Sheets: { BaselineLoad: ws } };
xlsx.writeFile(wb, outPath);
console.log(`Generated ${outPath} with ${scenarios.length} load test rows`);
