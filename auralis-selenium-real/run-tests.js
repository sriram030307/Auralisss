const Mocha = require("mocha");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");

// Ensure screenshots folder exists
const screenshotsDir = path.join(__dirname, "screenshots");
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
}

// Instantiate Mocha with options
const mocha = new Mocha({
    timeout: 90000,
    reporter: "spec" // prints results in console
});

const testDir = path.join(__dirname, "tests");

// Add all test files to Mocha
fs.readdirSync(testDir)
    .filter(file => file.endsWith(".test.js"))
    .forEach(file => {
        mocha.addFile(path.join(testDir, file));
    });

const results = [];
let testCounter = 1;

// Run the tests
const runner = mocha.run((failures) => {
    console.log(`\n==========================================`);
    console.log(`E2E Test Run Completed.`);
    console.log(`Total Failures: ${failures}`);
    console.log(`==========================================\n`);

    // Prepare workbook
    const workbook = XLSX.utils.book_new();
    
    // Headers
    const headers = [
        "Test ID",
        "Test File",
        "Test Suite",
        "Test Case",
        "Duration (Seconds)",
        "Status",
        "Actual Result / Error"
    ];

    const rows = results.map(r => [
        r.id,
        r.file,
        r.suite,
        r.name,
        r.duration,
        r.status,
        r.error
    ]);

    const sheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Auto-fit columns
    const cols = headers.map((h, colIndex) => {
        let maxLen = h.length;
        for (const row of rows) {
            const val = String(row[colIndex] || "");
            if (val.length > maxLen) {
                maxLen = val.length;
            }
        }
        return { wch: maxLen + 3 };
    });
    worksheet["!cols"] = cols;

    XLSX.utils.book_append_sheet(workbook, worksheet, "E2E Test Report");

    const reportPath = path.join(__dirname, "Auralis_Test_Report.xlsx");
    XLSX.writeFile(workbook, reportPath);

    console.log(`Dynamic Excel Report written to: ${reportPath}`);
    process.exitCode = failures ? 1 : 0;
});

// Hook into test completion events
runner.on("pass", (test) => {
    const filename = path.basename(test.file || "unknown");
    const suiteName = test.parent ? test.parent.title : "Root";
    const testId = `TC${String(testCounter++).padStart(3, "0")}`;
    const durationSec = test.duration ? (test.duration / 1000).toFixed(2) : "0.00";

    results.push({
        id: testId,
        file: filename,
        suite: suiteName,
        name: test.title,
        duration: durationSec,
        status: "PASS",
        error: "Verified successfully"
    });
});

runner.on("fail", (test, err) => {
    const filename = path.basename(test.file || "unknown");
    const suiteName = test.parent ? test.parent.title : "Root";
    const testId = `TC${String(testCounter++).padStart(3, "0")}`;
    const durationSec = test.duration ? (test.duration / 1000).toFixed(2) : "0.00";

    results.push({
        id: testId,
        file: filename,
        suite: suiteName,
        name: test.title,
        duration: durationSec,
        status: "FAIL",
        error: err ? err.message : "Test execution failed"
    });
});
