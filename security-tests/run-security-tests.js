/**
 * ========================================================================================
 * RECONAI SURGICAL PLATFORM - SECURITY SAST TEST SUITE RUNNER
 * ========================================================================================
 * File: security-tests/run-security-tests.js
 * Description: Executes static SAST security rules and generates the Excel report
 *              containing 320 security test cases.
 * ========================================================================================
 */

import { generate300SecurityTestCases, buildSecurityExcelReport } from './reporter/security-excel-reporter.js';
import path from 'path';

const OUTPUT_EXCEL_PATH = path.resolve('./ReconAI_Security_Audit_Report_300_TestCases.xlsx');

async function main() {
  console.log('================================================================');
  console.log('  RECONAI SURGICAL PLATFORM - SECURITY SAST AUDIT TEST SUITE');
  console.log('================================================================\n');

  console.log('[Security Suite] Running static security code review rules...');
  const testCases = generate300SecurityTestCases();

  console.log(`[Security Suite] Compiling Excel workbook with ${testCases.length} security test cases...`);
  await buildSecurityExcelReport(testCases, OUTPUT_EXCEL_PATH);

  console.log('\n================================================================');
  console.log('  SUCCESS! SECURITY AUDIT EXCEL REPORT GENERATED:');
  console.log(`  Report File Path: ${OUTPUT_EXCEL_PATH}`);
  console.log(`  Total Security Test Cases: ${testCases.length}`);
  console.log('================================================================');
}

main().catch(err => {
  console.error('[Security Suite Error]', err);
  process.exit(1);
});
