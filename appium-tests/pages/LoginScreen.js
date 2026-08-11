/**
 * ========================================================================================
 * RECONAI SURGICAL PLATFORM - LOGIN SCREEN PAGE OBJECT MODEL (POM)
 * ========================================================================================
 * File: appium-tests/pages/LoginScreen.js
 * Description: Page Object encapsulating elements and user actions on the Mobile Login screen,
 *              Role switching (Surgeon vs Admin), and Supabase Configuration Modal.
 * ========================================================================================
 */

export class LoginScreen POM {
  constructor(driver) {
    this.driver = driver;
  }

  // Selectors
  get surgeonTab() { return '~tab-surgeon'; }
  get adminTab() { return '~tab-admin'; }
  get emailInput() { return '~input-email'; }
  get passwordInput() { return '~input-password'; }
  get togglePasswordBtn() { return '~btn-toggle-password'; }
  get submitBtn() { return '~btn-login-submit'; }
  get errorMessage() { return '~text-error-msg'; }
  get configModalBtn() { return '~btn-open-supabase-config'; }

  // Actions
  async selectRole(role = 'surgeon') {
    if (!this.driver) return;
    const tabSelector = role === 'admin' ? this.adminTab : this.surgeonTab;
    const el = await this.driver.$(tabSelector);
    await el.click();
  }

  async enterEmail(email) {
    if (!this.driver) return;
    const el = await this.driver.$(this.emailInput);
    await el.setValue(email);
  }

  async enterPassword(password) {
    if (!this.driver) return;
    const el = await this.driver.$(this.passwordInput);
    await el.setValue(password);
  }

  async togglePasswordVisibility() {
    if (!this.driver) return;
    const el = await this.driver.$(this.togglePasswordBtn);
    await el.click();
  }

  async submitLogin() {
    if (!this.driver) return;
    const el = await this.driver.$(this.submitBtn);
    await el.click();
  }

  async getErrorText() {
    if (!this.driver) return '';
    const el = await this.driver.$(this.errorMessage);
    return await el.getText();
  }

  async openSupabaseConfig() {
    if (!this.driver) return;
    const el = await this.driver.$(this.configModalBtn);
    await el.click();
  }
}
