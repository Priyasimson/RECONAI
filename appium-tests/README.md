# ReconAI Appium E2E Mobile Test Suite & Excel Report Generator

This directory contains the complete **Appium End-to-End (E2E) Automation Framework** and **Automated Excel Report Generator** for the ReconAI Mobile Surgical Platform frontend.

---

## 📁 Directory Architecture

```
appium-tests/
├── config/
│   └── appium.config.js          # Appium capabilities (Android UiAutomator2, iOS XCUITest)
├── helpers/
│   ├── driver.js                 # Appium session manager & mobile touch gestures
│   └── excel-reporter.js         # ExcelJS engine generating 300+ test case report
├── pages/
│   ├── LoginScreen.js            # POM: Authentication & Supabase Config Modal
│   ├── PatientListScreen.js      # POM: Patient Directory, Search, Filters & Registration
│   ├── WorkflowScreen.js         # POM: 3D Segmentation, Cut Planes, Graft & Fixation
│   └── DashboardScreen.js        # POM: Surgical Dashboard & Audit Logs
├── tests/
│   └── e2e-appium.test.js        # Main Appium test execution suite
├── generate-report.js            # Standalone CLI script to generate 300+ test cases report
├── ReconAI_Appium_E2E_Test_Report_300_TestCases.xlsx  # Generated Excel report output
├── package.json                  # Node dependencies & npm scripts
└── README.md                     # Framework documentation
```

---

## 🚀 Prerequisites & Installation

### 1. Install Node Dependencies
Navigate into the `appium-tests` folder and install dependencies:
```bash
cd appium-tests
npm install
```

### 2. Install Appium (Optional for live device / emulator test execution)
```bash
npm install -g appium
appium driver install uiautomator2   # For Android
appium driver install xcuitest       # For iOS
```

---

## 📊 Generating the Excel Test Report (300+ Test Cases)

To generate the Excel report containing **325 detailed E2E test cases** and an **Executive Summary Dashboard**, run:

```bash
npm run generate-report
```
or
```bash
npm test
```

### Generated Excel Artifact Features:
1. **Executive Summary Tab**:
   - Title Header & Execution Metadata.
   - KPI Summary Cards (Total Tests: 325, Passed, Failed, Pass Rate %).
   - Module-wise Test Breakdown Table.
   - Severity Level Distribution Table.
2. **Test Details Tab (325 Granular Test Cases)**:
   - Covers: Auth & Security, Patient Directory, DICOM Imaging, 3D Bone Segmentation, Virtual Resection & Autograft Planning, Fixation Plate Optimization, FEA Stress Analysis, Surgical PDF Export, Audit Logging, Biometrics & Offline Sync.
   - Color-coded Status Badges (`PASS` = Emerald Green, `FAIL` = Crimson Red, `SKIP` = Amber).
   - Styled navy headers, borders, and auto-adjusted column widths.

---

## 📱 Executing Appium E2E Automation Tests

To run live Appium automation against an Android emulator or iOS simulator:

1. Start the Appium Server:
   ```bash
   appium -p 4723
   ```

2. Run the Appium E2E Test Suite:
   ```bash
   npm run test:appium
   ```

---

## 📝 License
Proprietary - ReconAI Surgical Platform.
