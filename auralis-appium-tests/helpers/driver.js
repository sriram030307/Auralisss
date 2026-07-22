const { remote } = require('webdriverio');

// Placeholder capabilities – replace with your app's actual package/activity and device info.
const caps = {
  platformName: 'Android',
  platformVersion: '11',            // <--- update
  deviceName: 'Pixel_4_API_30',    // <--- update
  automationName: 'UiAutomator2',
  appPackage: 'com.example.myapp', // <--- update
  appActivity: '.MainActivity',    // <--- update
  noReset: true,
  newCommandTimeout: 300
};

let driver;

module.exports = {
  async getDriver() {
    if (!driver) {
      driver = await remote({
        path: '/wd/hub',
        port: 4723,
        capabilities: caps
      });
    }
    return driver;
  },
  async quit() {
    if (driver) {
      await driver.deleteSession();
      driver = null;
    }
  }
};
