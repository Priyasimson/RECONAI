/**
 * ========================================================================================
 * RECONAI SURGICAL PLATFORM - BASELINE LOAD TEST EXECUTION CLI
 * ========================================================================================
 * File: load-tests/run-baseline-test.js
 * Description: CLI entry point to run Baseline/Load Testing (100 VUs for 60s continuous),
 *              displaying real-time RPS & latency metrics, and compiling Excel reports.
 * ========================================================================================
 */

import { runBaselineLoadTest } from './engine/load-runner.js';
import { generateLoadTestExcelReport } from './reporter/excel-load-reporter.js';
import path from 'path';

const OUTPUT_EXCEL_PATH = path.resolve('./ReconAI_Load_Concurrency_Test_Report_300_TestCases.xlsx');

async function main() {
  console.log('================================================================');
  console.log('  RECONAI SURGICAL PLATFORM - BASELINE LOAD TESTING SUITE');
  console.log('================================================================');
  console.log('  Target Concurrency : 100 Virtual Users');
  console.log('  Target Duration    : 60 Seconds (1 Minute Continuous)');
  console.log('================================================================\n');

  const results = await runBaselineLoadTest();

  console.log('================================================================');
  console.log('  BASELINE LOAD TEST RESULTS & METRICS SUMMARY');
  console.log('================================================================');
  console.log(`  Concurrent Virtual Users : ${results.virtualUsers}`);
  console.log(`  Actual Test Duration     : ${results.durationSeconds} seconds`);
  console.log(`  Total Requests Sent      : ${results.totalRequests.toLocaleString()}`);
  console.log(`  Requests Per Second (RPS): ${results.rps} req/sec`);
  console.log('----------------------------------------------------------------');
  console.log('  RESPONSE TIMES (LATENCY)');
  console.log(`  • Average Response Time : ${results.latency.avgMs} ms`);
  console.log(`  • Fastest Response (Min): ${results.latency.minMs} ms`);
  console.log(`  • Slowest Response (Max): ${results.latency.maxMs} ms`);
  console.log(`  • P50 (Median)          : ${results.latency.p50Ms} ms`);
  console.log(`  • P90 Percentile        : ${results.latency.p90Ms} ms`);
  console.log(`  • P95 Percentile        : ${results.latency.p95Ms} ms`);
  console.log(`  • P99 Percentile        : ${results.latency.p99Ms} ms`);
  console.log('----------------------------------------------------------------');
  console.log('  REQUEST STATUS & RELIABILITY');
  console.log(`  • Successful Requests (2xx) : ${results.successRequests.toLocaleString()}`);
  console.log(`  • Failed Requests (4xx/5xx) : ${results.failedRequests.toLocaleString()}`);
  console.log(`  • Success Rate              : ${((results.successRequests / results.totalRequests) * 100).toFixed(2)}%`);
  console.log('================================================================\n');

  console.log('[CLI] Compiling Baseline Load Test Excel Report...');
  await generateLoadTestExcelReport(results, OUTPUT_EXCEL_PATH);

  console.log('\n================================================================');
  console.log('  SUCCESS! LOAD TEST REPORT GENERATED:');
  console.log(`  Report File Path: ${OUTPUT_EXCEL_PATH}`);
  console.log('================================================================');
}

main().catch(err => {
  console.error('[CLI Error] Baseline Load Test execution error:', err);
  process.exit(1);
});
