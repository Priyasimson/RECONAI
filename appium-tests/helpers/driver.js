/**
 * ========================================================================================
 * RECONAI SURGICAL PLATFORM - APPIUM DRIVER HELPER UTILITIES
 * ========================================================================================
 * File: appium-tests/helpers/driver.js
 * Description: Abstracted wrapper for WebdriverIO session management, custom mobile selectors,
 *              gesture interactions (swipe/scroll), and error recovery.
 * ========================================================================================
 */

import { remote } from 'webdriverio';
import { driverOptions } from '../config/appium.config.js';

let driverInstance = null;

/**
 * Initializes and returns a WebdriverIO Appium session.
 */
export async function createDriver(customCaps = null) {
  if (driverInstance) {
    return driverInstance;
  }

  const options = { ...driverOptions };
  if (customCaps) {
    options.capabilities = customCaps;
  }

  try {
    driverInstance = await remote(options);
    console.log(`[Appium Driver] Session initiated successfully. SessionID: ${driverInstance.sessionId}`);
    return driverInstance;
  } catch (error) {
    console.warn(`[Appium Driver] Could not connect to live Appium server at ${options.hostname}:${options.port}. Operating in test runner mode.`);
    return null;
  }
}

/**
 * Utility to close active Appium session.
 */
export async function quitDriver() {
  if (driverInstance) {
    try {
      await driverInstance.deleteSession();
      console.log('[Appium Driver] Session closed cleanly.');
    } catch (e) {
      console.error('[Appium Driver] Error while closing session:', e.message);
    } finally {
      driverInstance = null;
    }
  }
}

/**
 * Finds element by Accessibility ID (mobile best practice) or XPath fallback.
 */
export async function findMobileElement(driver, accessibilityId, xpathFallback) {
  if (!driver) return null;
  try {
    const elByAccessId = await driver.$(`~${accessibilityId}`);
    if (await elByAccessId.isDisplayed()) {
      return elByAccessId;
    }
  } catch (e) {
    // Fall back to XPath
  }
  if (xpathFallback) {
    return await driver.$(xpathFallback);
  }
  return null;
}

/**
 * Swipes down on the mobile screen to scroll content.
 */
export async function swipeDown(driver) {
  if (!driver) return;
  const size = await driver.getWindowSize();
  const startX = size.width / 2;
  const startY = size.height * 0.8;
  const endY = size.height * 0.2;

  await driver.performActions([
    {
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: startX, y: startY },
        { type: 'pointerDown', button: 0 },
        { type: 'pointerMove', duration: 600, x: startX, y: endY },
        { type: 'pointerUp', button: 0 }
      ]
    }
  ]);
}
