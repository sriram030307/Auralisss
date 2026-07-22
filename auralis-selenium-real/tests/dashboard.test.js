const createDriver = require("../helpers/driver");
const { By } = require("selenium-webdriver");
const assert = require("assert");

describe("Dashboard Test", function () {

    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await createDriver();
    });

    after(async () => {
        await driver.quit();
    });

    it("should login and reach dashboard", async () => {

        await driver.get(
            "https://auralis-sriram.base44.app/login"
        );

        await driver.sleep(2000);

        // Email
        await driver.findElement(
            By.css("input[type='email']")
        ).sendKeys(
            "sriramv2116.sse@saveetha.com"
        );

        // Password
        await driver.findElement(
            By.css("input[type='password']")
        ).sendKeys(
            "12345678"
        );

        // Login
        await driver.findElement(
            By.css("button[type='submit']")
        ).click();

        await driver.sleep(8000);

        const currentUrl =
            await driver.getCurrentUrl();

        console.log(
            "Dashboard URL:",
            currentUrl
        );

        // Verify login succeeded
        assert.ok(
            currentUrl ===
            "https://auralis-sriram.base44.app/"
        );

    });

    it("should display dashboard content", async () => {

        await driver.get(
            "https://auralis-sriram.base44.app/"
        );

        await driver.sleep(5000);

        const bodyText =
            await driver.findElement(
                By.tagName("body")
            ).getText();

        console.log(
            bodyText.substring(0,500)
        );

        assert.ok(
            bodyText.length > 0
        );

    });

});