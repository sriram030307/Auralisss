const { expect } = require('chai');
const driverHelper = require('../helpers/driver');

describe('Auralis Mobile Full Flow', function () {
  this.timeout(180000);
  let driver;

  before(async () => {
    driver = await driverHelper.getDriver();
  });

  after(async () => {
    await driverHelper.quit();
  });

  it('allows launch and initial screen rendering', async () => {
    const screen = await driver.$('android=new UiSelector().className("android.widget.TextView")');
    const displayed = await screen.isDisplayed().catch(() => false);
    expect(displayed).to.be.true;
  });

  it('reveals navigation elements for core pages', async () => {
    const nav = await driver.$('android=new UiSelector().textContains("Menu")');
    const displayed = await nav.isDisplayed().catch(() => false);
    expect(displayed).to.be.true;
  });

  it('exposes safety and emergency entry points', async () => {
    const sos = await driver.$('android=new UiSelector().textContains("SOS")');
    const displayed = await sos.isDisplayed().catch(() => false);
    expect(displayed).to.be.true;
  });
});