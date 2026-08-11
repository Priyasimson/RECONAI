/**
 * ========================================================================================
 * RECONAI SURGICAL PLATFORM - APPIUM E2E TEST CONFIGURATION
 * ========================================================================================
 * File: appium-tests/config/appium.config.js
 * Description: Defines Appium capabilities for Android (UiAutomator2), iOS (XCUITest),
 *              and hybrid/mobile web testing environments for the ReconAI mobile app.
 * ========================================================================================
 */

import path from 'path';

export const APPIUM_HOST = process.env.APPIUM_HOST || '127.0.0.1';
export const APPIUM_PORT = parseInt(process.env.APPIUM_PORT || '4723', 10);

export const capabilities = {
  // 1. Android Native / Hybrid App Capabilities (Default Target)
  android: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
    'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || '13.0',
    'appium:app': process.env.ANDROID_APK_PATH || path.resolve('./mobile/android/app/build/outputs/apk/debug/app-debug.apk'),
    'appium:appPackage': 'com.reconai.mobile',
    'appium:appActivity': '.MainActivity',
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:newCommandTimeout': 3600,
    'appium:autoGrantPermissions': true
  },

  // 2. iOS Native / Hybrid App Capabilities
  ios: {
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:deviceName': process.env.IOS_DEVICE_NAME || 'iPhone 15 Pro',
    'appium:platformVersion': process.env.IOS_PLATFORM_VERSION || '17.0',
    'appium:app': process.env.IOS_APP_PATH || path.resolve('./mobile/ios/build/Build/Products/Debug-iphonesimulator/ReconAI.app'),
    'appium:bundleId': 'com.reconai.mobile',
    'appium:noReset': false,
    'appium:newCommandTimeout': 3600
  },

  // 3. Mobile Chrome / Web Capabilities (Responsive E2E fallback)
  mobileWeb: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Android Emulator',
    'appium:browserName': 'Chrome',
    'appium:chromedriverExecutableDir': process.env.CHROMEDRIVER_DIR || ''
  }
};

export const driverOptions = {
  hostname: APPIUM_HOST,
  port: APPIUM_PORT,
  path: '/',
  logLevel: 'info',
  capabilities: capabilities.android
};
