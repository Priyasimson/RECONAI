/**
 * ========================================================================================
 * RECONAI SURGICAL PLATFORM - 3D WORKFLOW PAGE OBJECT MODEL (POM)
 * ========================================================================================
 * File: appium-tests/pages/WorkflowScreen.js
 * Description: Page Object encapsulating 3D Segmentation, Bone Classification, Cut Plane
 *              Resection, Graft Placement, Fixation Optimization, and Surgical Plan export.
 * ========================================================================================
 */

export class WorkflowScreenPOM {
  constructor(driver) {
    this.driver = driver;
  }

  // Selectors
  get stageSegmentationTab() { return '~tab-stage-segmentation'; }
  get stageResectionTab() { return '~tab-stage-resection'; }
  get stageGraftTab() { return '~tab-stage-graft'; }
  get stageFixationTab() { return '~tab-stage-fixation'; }
  get stageSimulationTab() { return '~tab-stage-simulation'; }

  // Action Buttons
  get btnAutoSegment() { return '~btn-auto-segment'; }
  get btnAddCutPlane() { return '~btn-add-cut-plane'; }
  get btnSelectFibulaGraft() { return '~btn-select-fibula'; }
  get btnAutoFitPlate() { return '~btn-auto-fit-plate'; }
  get btnGenerateSurgicalPlan() { return '~btn-generate-plan'; }
  get btnExportPDF() { return '~btn-export-pdf'; }

  // 3D Canvas viewport selector
  get canvas3D() { return '~viewport-3d-canvas'; }

  // Actions
  async goToStage(stageName) {
    if (!this.driver) return;
    let selector = this.stageSegmentationTab;
    if (stageName === 'resection') selector = this.stageResectionTab;
    if (stageName === 'graft') selector = this.stageGraftTab;
    if (stageName === 'fixation') selector = this.stageFixationTab;
    if (stageName === 'simulation') selector = this.stageSimulationTab;
    await (await this.driver.$(selector)).click();
  }

  async runAutoSegmentation() {
    if (!this.driver) return;
    await (await this.driver.$(this.btnAutoSegment)).click();
  }

  async addVirtualCutPlane() {
    if (!this.driver) return;
    await (await this.driver.$(this.btnAddCutPlane)).click();
  }

  async selectGraftType(type = 'fibula') {
    if (!this.driver) return;
    if (type === 'fibula') {
      await (await this.driver.$(this.btnSelectFibulaGraft)).click();
    }
  }

  async autoFitFixationPlate() {
    if (!this.driver) return;
    await (await this.driver.$(this.btnAutoFitPlate)).click();
  }

  async generateSurgicalReport() {
    if (!this.driver) return;
    await (await this.driver.$(this.btnGenerateSurgicalPlan)).click();
  }
}
