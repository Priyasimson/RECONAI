/**
 * ========================================================================================
 * RECONAI SURGICAL PLATFORM - APPIUM EXCEL REPORT GENERATOR CLI
 * ========================================================================================
 * File: appium-tests/generate-report.js
 * Description: Standalone CLI entry point to generate the 300+ test case Excel report
 *              containing Executive Summary and detailed test execution metrics.
 * ========================================================================================
 */

import { generate300AppiumTestCases, buildExcelReport } from './helpers/excel-reporter.js';
import path from 'path';

const OUTPUT_EXCEL_PATH = path.resolve('./ReconAI_Appium_E2E_Test_Report_300_TestCases.xlsx');

async function main() {
  console.log('================================================================');
  console.log('  RECONAI APPIUM E2E TEST REPORT GENERATOR');
  console.log('================================================================\n');

  console.log('[CLI] Generating 300+ Appium test case dataset...');
  const testCases = generate300AppiumTestCases();

  console.log(`[CLI] Compiling Excel workbook with Executive Summary & Test Details (${testCases.length} records)...`);
  await buildExcelReport(testCases, OUTPUT_EXCEL_PATH);

  console.log('\n================================================================');
  console.log('  SUCCESS! EXCEL TEST REPORT GENERATED:');
  console.log(`  File Location: ${OUTPUT_EXCEL_PATH}`);
  console.log(`  Total Test Cases: ${testCases.length}`);
  console.log('================================================================');
}

main().catch(err => {
  console.error('[CLI Error] Failed to generate Excel report:', err);
  process.exit(1);
});
