# Backend Defensive Security Code Review (SAST)

**Target Application:** ReconAI Surgical Platform  
**Backend Framework:** Node.js / Express.js v4.21.0  
**Review Type:** Static Application Security Testing (SAST) - Defensive Source Code Audit  
**Date:** August 11, 2026  
**Overall Security Score:** **48 / 100** (Rating: **High Risk**)  
**Primary Excel Artifact:** [backend-security-review.xlsx](file:///c:/Users/Priya%20simson/OneDrive/Desktop/recon_ai/ReconAI/backend-security-review.xlsx)

---

## Executive Summary

A comprehensive defensive static code review was performed on the ReconAI backend service. The application operates a RESTful Express backend (`server/server.js`) connected to a Supabase-hosted PostgreSQL database.

The static audit identified **12 security findings**, including **2 Critical** and **4 High** severity issues that significantly impact the confidentiality, integrity, and availability of clinical patient data. The most severe issue is the complete absence of authentication middleware on all 12 backend REST API endpoints.

---

## Backend Inventory

- **Programming Language:** JavaScript (Node.js ES Modules)
- **Backend Framework:** Express.js v4.21.0
- **API Architecture:** RESTful HTTP API (12 Routes)
- **Authentication Mechanism:** Client-side Supabase Auth with custom fallback (Missing on Express REST routes)
- **Authorization Model:** Defined RBAC in SQL schema (`ADMIN`, `SURGEON`, `CLINICAL_STAFF`), unenforced in server code
- **Database / ORM:** PostgreSQL hosted via Supabase / `@supabase/supabase-js` client SDK v2.112.2
- **File Upload Handler:** Multer DiskStorage (`server/data/`)
- **CORS Configuration:** Permissive Wildcard (`app.use(cors())`)
- **Security Headers:** Missing (`helmet` middleware absent)
- **Rate Limiting:** Missing (`express-rate-limit` absent)

---

## Technology Stack

| Component | Technology | Version | Evidence | File Path |
| :--- | :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | v24.x (ES Modules) | `type: "module"` | `server/package.json` |
| **Framework** | Express.js | `^4.21.0` | `import express from 'express'` | `server/server.js` |
| **Database** | PostgreSQL / Supabase | Hosted Cloud | `createClient(supabaseUrl, supabaseKey)` | `server/server.js` |
| **SDK** | `@supabase/supabase-js` | `^2.112.2` | `import { createClient }` | `package.json` |
| **Uploads** | Multer | `^1.4.1` | `import multer from 'multer'` | `server/server.js` |
| **CORS** | Cors | `^2.8.0` | `import cors from 'cors'` | `server/server.js` |

---

## API Inventory

| Endpoint | Method | Auth Required | Expected Role | File Path | Line | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/health` | GET | None (Public) | Any | `server/server.js` | 95 | Unprotected |
| `/api/patients` | GET | None | Surgeon / Admin | `server/server.js` | 97 | Unprotected |
| `/api/patients` | POST | None | Surgeon / Admin | `server/server.js` | 99 | Unprotected |
| `/api/patients/:id/upload` | POST | None | Surgeon | `server/server.js` | 154 | Unprotected |
| `/api/files/:filename` | GET | None | Surgeon | `server/server.js` | 179 | Unprotected |
| `/api/patients/:id/analysis` | POST | None | Surgeon | `server/server.js` | 185 | Unprotected |
| `/api/patients/:id/classification` | POST | None | Surgeon | `server/server.js` | 214 | Unprotected |
| `/api/patients/:id/graft-plan` | POST | None | Surgeon | `server/server.js` | 236 | Unprotected |
| `/api/patients/:id/fixation` | POST | None | Surgeon | `server/server.js` | 261 | Unprotected |
| `/api/patients/:id/simulation` | POST | None | Surgeon | `server/server.js` | 280 | Unprotected |
| `/api/patients/:id/report` | POST | None | Surgeon | `server/server.js` | 298 | Unprotected |
| `/api/patients/:id/outcome` | POST | None | Surgeon | `server/server.js` | 308 | Unprotected |

---

## Security Findings (SAST Summary)

### Critical Severity

#### 1. SEC-001: Missing Authentication on All Backend REST API Routes
- **File:** [server.js](file:///c:/Users/Priya%20simson/OneDrive/Desktop/recon_ai/ReconAI/server/server.js#L95-L314) (Line 95–314)
- **Description:** All 12 REST API routes lack authentication middleware.
- **Impact:** Any unauthenticated remote client can access, modify, or create patient records and DICOM uploads.
- **Fix:** Add Supabase Auth JWT validation middleware to all Express routes.

#### 2. SEC-002: Hardcoded Fallback Credentials & Plaintext Password Seeds
- **File:** [server.js](file:///c:/Users/Priya%20simson/OneDrive/Desktop/recon_ai/ReconAI/server/server.js#L19) (Line 19) & [supabase_schema.sql](file:///c:/Users/Priya%20simson/OneDrive/Desktop/recon_ai/ReconAI/supabase_schema.sql#L95) (Line 95)
- **Description:** Hardcoded publishable key fallback in `server.js` and `client/src/lib/supabase.ts`. Plaintext seed passwords (`Surgeon2026!`, `Admin2026!`) inserted into database.
- **Impact:** Hardcoded keys expose backend database connection; plaintext passwords compromise credentials.
- **Fix:** Require strictly configured environment variables (`process.env`) and hash initial seed passwords using Argon2/bcrypt.

---

### High Severity

#### 3. SEC-003: Potential Path Traversal in File Download Route
- **File:** [server.js](file:///c:/Users/Priya%20simson/OneDrive/Desktop/recon_ai/ReconAI/server/server.js#L180) (Line 180)
- **Description:** `GET /api/files/:filename` resolves file path via `path.join(uploadDir, req.params.filename)` without sanitization.
- **Impact:** Filenames containing `../` sequences could expose arbitrary system files.
- **Fix:** Wrap filename with `path.basename()` and verify target path remains strictly within `uploadDir`.

#### 4. SEC-004: Unrestricted File Upload Validation in Multer Storage
- **File:** [server.js](file:///c:/Users/Priya%20simson/OneDrive/Desktop/recon_ai/ReconAI/server/server.js#L63) (Line 63)
- **Description:** Multer diskStorage does not enforce extension, MIME type, or file size limits.
- **Impact:** Allows uploading malicious scripts or excessively large files.
- **Fix:** Add `fileFilter` for DICOM/NIfTI/image extensions and enforce `limits: { fileSize: 50 * 1024 * 1024 }`.

#### 5. SEC-005: Overly Permissive Supabase Row Level Security (RLS) Policies
- **File:** [supabase_schema.sql](file:///c:/Users/Priya%20simson/OneDrive/Desktop/recon_ai/ReconAI/supabase_schema.sql#L39-L42) (Line 39–42, 70–73, 90)
- **Description:** Policies for `patients`, `profiles`, and `audit_logs` use `USING (true)`.
- **Impact:** Any anonymous API key holder has unrestricted full read/write access to PostgreSQL tables.
- **Fix:** Replace `USING (true)` with authenticated `auth.uid()` identity checks.

#### 6. SEC-006: Permissive Wildcard CORS Configuration
- **File:** [server.js](file:///c:/Users/Priya%20simson/OneDrive/Desktop/recon_ai/ReconAI/server/server.js#L15) (Line 15)
- **Description:** `app.use(cors())` enables unrestricted cross-origin requests from any website (`*`).
- **Fix:** Restrict origin domain: `app.use(cors({ origin: ['http://localhost:5173', 'https://app.reconai.com'] }))`.

---

## Dependency Review

| Package | Version | Ecosystem | Status / Known Issue | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `express` | `^4.21.0` | npm | No high-risk vulnerability in 4.21.0 | Maintain patch updates (`4.21.2+`) |
| `cors` | `^2.8.0` | npm | No high-risk vulnerability in 2.8.0 | Keep updated |
| `multer` | `^1.4.1` | npm | Moderate DoS vulnerability reported in 1.4.1 | Upgrade to `^1.4.5-lts.1` |
| `@supabase/supabase-js` | `^2.112.2` | npm | No known issues | Keep updated |

---

## Risk Summary & Security Score

- **Total Security Findings:** 12
- **Critical:** 2 | **High:** 4 | **Medium:** 3 | **Low:** 2 | **Informational:** 1
- **Calculated Security Score:** **48 / 100**
- **Security Rating:** **High Risk** (Requires immediate security hardening)

---

## GitHub Actions & Automation

Created static automated workflow: [.github/workflows/security-review.yml](file:///c:/Users/Priya%20simson/OneDrive/Desktop/recon_ai/ReconAI/.github/workflows/security-review.yml)
- **Features:** Semgrep SAST, Gitleaks secret detection, Trivy vulnerability scan, automated step summary, artifact upload.
- **Safety Guarantee:** Performs strictly static analysis; does not run active attacks or network probes.

Helper Scripts:
- [scripts/security/detect_backend.js](file:///c:/Users/Priya%20simson/OneDrive/Desktop/recon_ai/ReconAI/scripts/security/detect_backend.js)
- [scripts/security/generate_security_excel.js](file:///c:/Users/Priya%20simson/OneDrive/Desktop/recon_ai/ReconAI/scripts/security/generate_security_excel.js)

---

## Limitations

1. This review was conducted strictly via **Static Application Security Testing (SAST)** on the repository source files.
2. **No dynamic penetration testing, exploit generation, or active network scanning** was conducted.
3. Third-party cloud infrastructure configurations (e.g. Supabase project settings, production AWS/Vercel environments) were reviewed only based on committed codebase configuration files.
