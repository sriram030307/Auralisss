const createDriver = require("../helpers/driver");
const { By, until } = require("selenium-webdriver");
const assert = require("assert");
const capture = require("../helpers/screenshot");

describe("Auralis Login Test", function () {

    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await createDriver();
    });

    after(async () => {
        await driver.quit();
    });

    it("should login successfully", async () => {

        await driver.get(
            "https://auralis-sriram.base44.app/login"
        );

        await driver.sleep(3000);

        // Locate email field
        const emailField = await driver.findElement(
            By.css("input[type='email']")
        );

        await emailField.clear();
        await emailField.sendKeys(
            "sriramv2116.sse@saveetha.com"
        );

        // Locate password field
        const passwordField = await driver.findElement(
            By.css("input[type='password']")
        );

        await passwordField.clear();
        await passwordField.sendKeys(
            "12345678"
        );

        // Click login button
        const loginButton = await driver.findElement(
            By.css("button[type='submit']")
        );

        await loginButton.click();

        await driver.sleep(8000);
        await capture(driver, "login-success");

        const currentUrl = await driver.getCurrentUrl();

        console.log("After Login URL:", currentUrl);

        assert.ok(
            !currentUrl.includes("/login")
        );
    });

});