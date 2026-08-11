/**
 * ========================================================================================
 * RECONAI SURGICAL PLATFORM - BASELINE & LOAD TESTING CONFIGURATION
 * ========================================================================================
 * File: load-tests/config/load.config.js
 * Description: Sets target concurrency (100 virtual users), test duration (60 seconds),
 *              target API endpoints, and response latency thresholds.
 * ========================================================================================
 */

export const LOAD_CONFIG = {
  // 100 Virtual Users running concurrently
  VIRTUAL_USERS: parseInt(process.env.VIRTUAL_USERS || '100', 10),

  // 1 Minute (60 Seconds) continuous load duration
  DURATION_SECONDS: parseInt(process.env.DURATION_SECONDS || '60', 10),

  // Target Server Endpoint
  BASE_URL: process.env.SERVER_URL || 'http://localhost:4000',

  // Request Timeout per request (ms)
  REQUEST_TIMEOUT_MS: 5000,

  // Target Endpoints to test under load
  ENDPOINTS: [
    { name: 'System Health Check', path: '/api/health', method: 'GET', weight: 30 },
    { name: 'Patient Directory List', path: '/api/patients', method: 'GET', weight: 40 },
    { name: 'Audit Logs Feed', path: '/api/audit-logs', method: 'GET', weight: 15 },
    { name: 'AI Bone Analysis Endpoint', path: '/api/analysis', method: 'GET', weight: 10 },
    { name: '3D Simulation Benchmark', path: '/api/simulate', method: 'GET', weight: 5 }
  ],

  // Performance SLA Thresholds
  SLA: {
    MAX_AVG_RESPONSE_TIME_MS: 300,
    MIN_EXPECTED_RPS: 100,
    MAX_ERROR_RATE_PERCENT: 1.0
  }
};
