const { expect } = require('chai');
const driverHelper = require('../helpers/driver');

describe('Auralis Mobile Smoke Test', function () {
  this.timeout(60000);
  let driver;

  before(async () => {
    driver = await driverHelper.getDriver();
  });

  after(async () => {
    await driverHelper.quit();
  });

  it('should launch the app and check home screen title', async () => {
    const titleElem = await driver.$('android=new UiSelector().text("Auralis")');
    const isDisplayed = await titleElem.isDisplayed();
    expect(isDisplayed).to.be.true;
  });

  // Additional test cases can be added here.
});
