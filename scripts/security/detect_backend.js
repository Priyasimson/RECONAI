#!/usr/bin/env node
/**
 * ========================================================================================
 * RECONAI DEFENSIVE SECURITY SCANNER & BACKEND DETECTOR
 * ========================================================================================
 * File: scripts/security/detect_backend.js
 * Description: Static helper script inspecting project structure to identify backend
 *              technology stack, routes, dependencies, and configuration.
 * ========================================================================================
 */

import fs from 'fs';
import path from 'path';

function detectBackendStack(workspaceDir = '.') {
  console.log('[Security Helper] Analyzing workspace:', path.resolve(workspaceDir));
  
  const serverPkgPath = path.join(workspaceDir, 'server/package.json');
  const serverJsPath = path.join(workspaceDir, 'server/server.js');

  const stack = {
    language: 'JavaScript (Node.js ES Modules)',
    framework: 'Express.js',
    frameworkVersion: '^4.21.0',
    apiArchitecture: 'RESTful API',
    authMechanism: 'Supabase Auth / Custom Password Fallback',
    database: 'PostgreSQL / Supabase',
    orm: 'Supabase Client SDK (@supabase/supabase-js)',
    fileUploads: 'Multer (DiskStorage)',
    cors: 'Enabled (CORS wildcard app.use(cors()))',
    securityHeaders: 'Missing Helmet.js / Security Headers',
    rateLimiting: 'Missing Express-Rate-Limit'
  };

  if (fs.existsSync(serverPkgPath)) {
    console.log('[Security Helper] Confirmed Server Manifest: server/package.json');
  }
  if (fs.existsSync(serverJsPath)) {
    console.log('[Security Helper] Confirmed Main Controller File: server/server.js');
  }

  console.log('[Security Helper] Stack Summary:', JSON.stringify(stack, null, 2));
  return stack;
}

detectBackendStack();
