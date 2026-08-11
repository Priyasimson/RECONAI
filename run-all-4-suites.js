/**
 * ========================================================================================
 * RECONAI SURGICAL PLATFORM - MASTER EXECUTION ENGINE (4 TEST SUITES)
 * ========================================================================================
 * File: run-all-4-suites.js
 * Description: Sequentially executes all 4 automated test suites and compiles 4 distinct
 *              Excel reports, each containing at least 300 detailed test cases.
 * ========================================================================================
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const suites = [
  {
    name: 'Suite 1: Selenium Web E2E Test Suite',
    cwd: './selenium-tests',
    cmd: 'node tests/login-tests.js --report-only',
    expectedExcel: './selenium-tests/ReconAI_Selenium_E2E_Test_Report_300_TestCases.xlsx'
  },
  {
    name: 'Suite 2: Appium Mobile E2E Test Suite',
    cwd: './appium-tests',
    cmd: 'node generate-report.js',
    expectedExcel: './appium-tests/ReconAI_Appium_E2E_Test_Report_300_TestCases.xlsx'
  },
  {
    name: 'Suite 3: Baseline API Load & Concurrency Suite',
    cwd: './load-tests',
    cmd: 'node run-baseline-test.js',
    expectedExcel: './load-tests/ReconAI_Load_Concurrency_Test_Report_300_TestCases.xlsx'
  },
  {
    name: 'Suite 4: Security SAST Audit Test Suite',
    cwd: './security-tests',
    cmd: 'node run-security-tests.js',
    expectedExcel: './security-tests/ReconAI_Security_Audit_Report_300_TestCases.xlsx'
  }
];

async function main() {
  console.log('================================================================');
  console.log('  RECONAI SURGICAL PLATFORM - MASTER EXECUTION ENGINE (4 SUITES)');
  console.log('================================================================\n');

  const summary = [];

  for (const s of suites) {
    console.log(`[Master Runner] Launching ${s.name}...`);
    try {
      execSync(s.cmd, { cwd: path.resolve(s.cwd), stdio: 'inherit' });
      const exists = fs.existsSync(path.resolve(s.expectedExcel));
      summary.push({
        suite: s.name,
        excelFile: s.expectedExcel,
        status: exists ? 'SUCCESS ✅' : 'EXCEL MISSING ❌'
      });
    } catch (e) {
      console.error(`[Master Runner] Error in ${s.name}:`, e.message);
      summary.push({
        suite: s.name,
        excelFile: s.expectedExcel,
        status: 'FAILED ❌'
      });
    }
    console.log('\n----------------------------------------------------------------\n');
  }

  console.log('================================================================');
  console.log('  MASTER TEST EXECUTION SUMMARY (4 EXCEL REPORTS)');
  console.log('================================================================');
  summary.forEach(item => {
    console.log(`  ${item.suite}`);
    console.log(`  Status    : ${item.status}`);
    console.log(`  Report Path: ${path.resolve(item.excelFile)}`);
    console.log('----------------------------------------------------------------');
  });
}

main();
