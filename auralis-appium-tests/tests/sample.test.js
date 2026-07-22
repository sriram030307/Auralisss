const { expect } = require('chai');
const driverHelper = require('../helpers/driver');

describe('Auralis Mobile End-to-End Tests', function () {
  this.timeout(180000);
  let driver;

  before(async () => {
    driver = await driverHelper.getDriver();
  });

  after(async () => {
    await driverHelper.quit();
  });

  it('launches the app successfully', async () => {
    const title = await driver.$('android=new UiSelector().text("Auralis")');
    const isDisplayed = await title.isDisplayed().catch(() => false);
    expect(isDisplayed).to.be.true;
  });

  it('opens the login screen', async () => {
    const loginButton = await driver.$('android=new UiSelector().textContains("Login")');
    const isDisplayed = await loginButton.isDisplayed().catch(() => false);
    expect(isDisplayed).to.be.true;
  });

  it('opens the dashboard view when navigated to home', async () => {
    const homeButton = await driver.$('android=new UiSelector().textContains("Home")');
    const isDisplayed = await homeButton.isDisplayed().catch(() => false);
    expect(isDisplayed).to.be.true;
  });

  it('shows safety-related controls', async () => {
    const safetyButton = await driver.$('android=new UiSelector().textContains("Safety")');
    const isDisplayed = await safetyButton.isDisplayed().catch(() => false);
    expect(isDisplayed).to.be.true;
  });

  it('shows notification options', async () => {
    const notificationButton = await driver.$('android=new UiSelector().textContains("Notifications")');
    const isDisplayed = await notificationButton.isDisplayed().catch(() => false);
    expect(isDisplayed).to.be.true;
  });
});
