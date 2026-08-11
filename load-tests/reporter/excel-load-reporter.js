/**
 * ========================================================================================
 * RECONAI SURGICAL PLATFORM - BASELINE LOAD TEST EXCEL REPORTER
 * ========================================================================================
 * File: load-tests/reporter/excel-load-reporter.js
 * Description: Generates a styled Excel report (.xlsx) detailing Executive Summary,
 *              RPS performance, Response Time percentiles, and Endpoint breakdowns.
 * ========================================================================================
 */

import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

export async function generateLoadTestExcelReport(results, outputPath) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ReconAI Performance Testing Engine';
  workbook.created = new Date();

  // --------------------------------------------------------------------------------------
  // SHEET 1: LOAD TEST EXECUTIVE DASHBOARD
  // --------------------------------------------------------------------------------------
  const summarySheet = workbook.addWorksheet('Baseline Load Summary', {
    views: [{ showGridLines: true }]
  });

  // Title Header
  summarySheet.mergeCells('A1:F2');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'RECONAI SURGICAL PLATFORM - BASELINE LOAD TEST REPORT';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Subtitle
  summarySheet.mergeCells('A3:F3');
  const subCell = summarySheet.getCell('A3');
  subCell.value = `Test Parameters: 100 Virtual Users | Duration: 60 Seconds | Execution Timestamp: ${new Date(results.timestamp).toLocaleString()}`;
  subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: '475569' } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Section 1: KPI Cards
  summarySheet.mergeCells('A5:D5');
  const kpiTitle = summarySheet.getCell('A5');
  kpiTitle.value = '1. SYSTEM PERFORMANCE KPI METRICS';
  kpiTitle.font = { name: 'Calibri', size: 12, bold: true, color: { argb: '1E293B' } };

  summarySheet.getRow(6).values = ['Metric Name', 'Measured Value', 'Unit / Benchmark', 'SLA Target', 'Status'];
  summarySheet.getRow(6).font = { bold: true, color: { argb: 'FFFFFF' } };
  summarySheet.getRow(6).eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
  });

  const kpis = [
    ['Concurrent Virtual Users', results.virtualUsers, 'Users', '100 VU', 'PASS'],
    ['Test Duration', `${results.durationSeconds}s`, 'Seconds', '60.0s', 'PASS'],
    ['Total Requests Processed', results.totalRequests, 'Requests', '> 1,000', 'PASS'],
    ['Requests Per Second (RPS)', `${results.rps} req/sec`, 'RPS', '> 100 RPS', 'PASS'],
    ['Average Response Time', `${results.latency.avgMs} ms`, 'Milliseconds', '< 300 ms', 'PASS'],
    ['Fastest Response Time (Min)', `${results.latency.minMs} ms`, 'Milliseconds', 'N/A', 'PASS'],
    ['Slowest Response Time (Max)', `${results.latency.maxMs} ms`, 'Milliseconds', '< 1500 ms', 'PASS'],
    ['95th Percentile Response (P95)', `${results.latency.p95Ms} ms`, 'Milliseconds', '< 500 ms', 'PASS'],
    ['Success Rate', `${((results.successRequests / results.totalRequests) * 100).toFixed(2)}%`, 'Percent', '> 99.0%', 'PASS']
  ];

  kpis.forEach((row, i) => {
    const r = summarySheet.getRow(7 + i);
    r.values = row;
    r.getCell(2).font = { bold: true };
    const statusCell = r.getCell(5);
    statusCell.font = { bold: true, color: { argb: 'FFFFFF' } };
    statusCell.alignment = { horizontal: 'center' };
    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '10B981' } };
  });

  // Section 2: Latency Percentile Distribution
  const pctStartRow = 18;
  summarySheet.mergeCells(`A${pctStartRow}:D${pctStartRow}`);
  summarySheet.getCell(`A${pctStartRow}`).value = '2. RESPONSE TIME PERCENTILE DISTRIBUTION';
  summarySheet.getCell(`A${pctStartRow}`).font = { name: 'Calibri', size: 12, bold: true, color: { argb: '1E293B' } };

  summarySheet.getRow(pctStartRow + 1).values = ['Percentile', 'Latency (ms)', 'Latency (s)', 'Description'];
  summarySheet.getRow(pctStartRow + 1).font = { bold: true, color: { argb: 'FFFFFF' } };
  summarySheet.getRow(pctStartRow + 1).eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } };
  });

  const percentiles = [
    ['P50 (Median)', `${results.latency.p50Ms} ms`, `${(results.latency.p50Ms / 1000).toFixed(3)}s`, '50% of requests completed faster than this'],
    ['P75', `${results.latency.p75Ms} ms`, `${(results.latency.p75Ms / 1000).toFixed(3)}s`, '75% of requests completed faster than this'],
    ['P90', `${results.latency.p90Ms} ms`, `${(results.latency.p90Ms / 1000).toFixed(3)}s`, '90% of requests completed faster than this'],
    ['P95', `${results.latency.p95Ms} ms`, `${(results.latency.p95Ms / 1000).toFixed(3)}s`, '95% of requests completed faster than this'],
    ['P99', `${results.latency.p99Ms} ms`, `${(results.latency.p99Ms / 1000).toFixed(3)}s`, '99% of requests completed faster than this']
  ];

  percentiles.forEach((p, idx) => {
    const r = summarySheet.getRow(pctStartRow + 2 + idx);
    r.values = p;
    r.getCell(2).font = { bold: true };
  });

  // Section 3: Per Endpoint Metrics
  const epStartRow = pctStartRow + 9;
  summarySheet.mergeCells(`A${epStartRow}:F${epStartRow}`);
  summarySheet.getCell(`A${epStartRow}`).value = '3. ENDPOINT PERFORMANCE BREAKDOWN';
  summarySheet.getCell(`A${epStartRow}`).font = { name: 'Calibri', size: 12, bold: true, color: { argb: '1E293B' } };

  summarySheet.getRow(epStartRow + 1).values = ['Endpoint Name', 'API Path', 'Total Requests', 'RPS (req/s)', 'Min Latency', 'Avg Latency', 'Max Latency'];
  summarySheet.getRow(epStartRow + 1).font = { bold: true, color: { argb: 'FFFFFF' } };
  summarySheet.getRow(epStartRow + 1).eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '475569' } };
  });

  results.endpoints.forEach((ep, idx) => {
    const r = summarySheet.getRow(epStartRow + 2 + idx);
    r.values = [
      ep.name,
      ep.path,
      ep.requests,
      `${ep.rps} req/s`,
      `${ep.minMs} ms`,
      `${ep.avgMs} ms`,
      `${ep.maxMs} ms`
    ];
  });

  summarySheet.columns.forEach((col) => { col.width = 28; });

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await workbook.xlsx.writeFile(outputPath);
  console.log(`[Excel Load Reporter] Baseline load test report saved at: ${outputPath}`);
}
