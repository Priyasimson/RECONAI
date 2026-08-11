/**
 * ========================================================================================
 * RECONAI SURGICAL PLATFORM - DASHBOARD PAGE OBJECT MODEL (POM)
 * ========================================================================================
 * File: appium-tests/pages/DashboardScreen.js
 * Description: Page Object encapsulating Surgical Dashboard analytics cards, active cases,
 *              quick actions, and user profile management.
 * ========================================================================================
 */

export class DashboardScreenPOM {
  constructor(driver) {
    this.driver = driver;
  }

  // Selectors
  get surgeonProfileHeader() { return '~header-surgeon-profile'; }
  get cardTotalPatients() { return '~card-total-patients'; }
  get cardActivePreOps() { return '~card-active-preops'; }
  get cardCompletedSurgeries() { return '~card-completed-surgeries'; }
  get cardAiAccuracy() { return '~card-ai-accuracy'; }
  get btnQuickNewPatient() { return '~btn-quick-new-patient'; }
  get btnLogout() { return '~btn-logout'; }

  // Actions
  async getSurgeonName() {
    if (!this.driver) return '';
    const el = await this.driver.$(this.surgeonProfileHeader);
    return await el.getText();
  }

  async clickQuickNewPatient() {
    if (!this.driver) return;
    const el = await this.driver.$(this.btnQuickNewPatient);
    await el.click();
  }

  async logout() {
    if (!this.driver) return;
    const el = await this.driver.$(this.btnLogout);
    await el.click();
  }
}
