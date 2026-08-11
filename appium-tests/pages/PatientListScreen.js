/**
 * ========================================================================================
 * RECONAI SURGICAL PLATFORM - PATIENT MANAGEMENT PAGE OBJECT MODEL (POM)
 * ========================================================================================
 * File: appium-tests/pages/PatientListScreen.js
 * Description: Page Object encapsulating Patient directory listing, search queries,
 *              status filters, patient details selection, and New Patient registration.
 * ========================================================================================
 */

export class PatientListScreenPOM {
  constructor(driver) {
    this.driver = driver;
  }

  // Selectors
  get searchBar() { return '~input-patient-search'; }
  get newPatientBtn() { return '~btn-add-new-patient'; }
  get filterAllTab() { return '~filter-all'; }
  get filterPreOpTab() { return '~filter-preop'; }
  get filterPlannedTab() { return '~filter-planned'; }
  get filterCompletedTab() { return '~filter-completed'; }

  // New Patient Form Selectors
  get inputPatientId() { return '~input-new-patient-id'; }
  get inputName() { return '~input-new-patient-name'; }
  get inputAge() { return '~input-new-patient-age'; }
  get selectGender() { return '~select-new-patient-gender'; }
  get inputDefectSite() { return '~input-new-patient-defect'; }
  get btnSavePatient() { return '~btn-save-patient'; }
  get btnCancelPatient() { return '~btn-cancel-patient'; }

  // Actions
  async searchPatient(query) {
    if (!this.driver) return;
    const el = await this.driver.$(this.searchBar);
    await el.setValue(query);
  }

  async filterByStatus(status) {
    if (!this.driver) return;
    let selector = this.filterAllTab;
    if (status === 'PRE_OP') selector = this.filterPreOpTab;
    if (status === 'PLANNED') selector = this.filterPlannedTab;
    if (status === 'COMPLETED') selector = this.filterCompletedTab;
    const el = await this.driver.$(selector);
    await el.click();
  }

  async openNewPatientModal() {
    if (!this.driver) return;
    const el = await this.driver.$(this.newPatientBtn);
    await el.click();
  }

  async createPatient(patientData) {
    if (!this.driver) return;
    if (patientData.id) await (await this.driver.$(this.inputPatientId)).setValue(patientData.id);
    if (patientData.name) await (await this.driver.$(this.inputName)).setValue(patientData.name);
    if (patientData.age) await (await this.driver.$(this.inputAge)).setValue(String(patientData.age));
    if (patientData.defectSite) await (await this.driver.$(this.inputDefectSite)).setValue(patientData.defectSite);
    await (await this.driver.$(this.btnSavePatient)).click();
  }

  async selectPatientByName(name) {
    if (!this.driver) return;
    const patientItem = await this.driver.$(`//*[@text='${name}' or @content-desc='${name}']`);
    await patientItem.click();
  }
}
