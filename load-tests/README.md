# ReconAI Baseline & Load Testing Framework

This directory contains the automated **Baseline & Load Testing Suite** for the ReconAI Surgical Platform API backend.

---

## 🎯 Test Objectives & Parameters

The Baseline Load Test evaluates system throughput and latency stability under typical peak concurrent load.

- **Concurrent Virtual Users**: `100 users`
- **Execution Duration**: `1 minute` (60 seconds continuously)
- **Target Metrics Captured**:
  - **Requests Per Second (RPS)**: Measure of system API throughput.
  - **Response Time**: Min (ms), Average (ms), Max (ms), P50, P90, P95, P99.
  - **Success & Failure Rate**: Percentage of requests returning HTTP 200 vs Errors.

---

## 📁 Directory Architecture

```
load-tests/
├── config/
│   └── load.config.js              # Target VU count (100), duration (60s), endpoint definitions
├── engine/
│   └── load-runner.js              # High-concurrency async load engine & latency tracker
├── reporter/
│   └── excel-load-reporter.js      # ExcelJS report engine creating executive XLSX dashboard
├── run-baseline-test.js            # Main CLI runner script
├── ReconAI_Baseline_Load_Test_Report.xlsx # Generated Excel load report
├── package.json                    # Dependencies & npm run load-test scripts
└── README.md                       # Documentation
```

---

## 🚀 Installation & Execution

### 1. Install Dependencies
```bash
cd load-tests
npm install
```

### 2. Run 100-User 1-Minute Baseline Load Test
```bash
npm run load-test
```
or
```bash
npm test
```

---

## 📊 Sample Output Metrics

```text
================================================================
  BASELINE LOAD TEST RESULTS & METRICS SUMMARY
================================================================
  Concurrent Virtual Users : 100
  Actual Test Duration     : 60.0 seconds
  Total Requests Sent      : 18,420
  Requests Per Second (RPS): 307.0 req/sec
----------------------------------------------------------------
  RESPONSE TIMES (LATENCY)
  • Average Response Time : 142.5 ms
  • Fastest Response (Min): 42.0 ms
  • Slowest Response (Max): 612.0 ms
  • P50 (Median)          : 128.0 ms
  • P90 Percentile        : 220.0 ms
  • P95 Percentile        : 310.0 ms
  • P99 Percentile        : 480.0 ms
----------------------------------------------------------------
  REQUEST STATUS & RELIABILITY
  • Successful Requests (2xx) : 18,348
  • Failed Requests (4xx/5xx) : 72
  • Success Rate              : 99.61%
================================================================
```

---

## 📝 Excel Report Artifact
The generated report is saved to:
`load-tests/ReconAI_Baseline_Load_Test_Report.xlsx`

Contains Executive Summary cards, SLA validation badges, Percentile distribution, and Endpoint performance tables.
