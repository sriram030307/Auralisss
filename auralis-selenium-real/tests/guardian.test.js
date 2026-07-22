const createDriver = require("../helpers/driver");
const { By } = require("selenium-webdriver");
const assert = require("assert");

describe("Guardian Network Test", function () {

    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await createDriver();
    });

    after(async () => {
        await driver.quit();
    });

    it("should open Guardian Network page", async () => {

        await driver.get(
            "https://auralis-sriram.base44.app/login"
        );

        await driver.sleep(2000);

        await driver.findElement(
            By.css("input[type='email']")
        ).sendKeys(
            "sriramv2116.sse@saveetha.com"
        );

        await driver.findElement(
            By.css("input[type='password']")
        ).sendKeys(
            "12345678"
        );

        await driver.findElement(
            By.css("button[type='submit']")
        ).click();

        await driver.sleep(6000);

        await driver.get(
            "https://auralis-sriram.base44.app/guardian-network"
        );

        await driver.sleep(5000);

        const url =
            await driver.getCurrentUrl();

        console.log(
            "Guardian URL:",
            url
        );

        const body =
            await driver.findElement(
                By.tagName("body")
            ).getText();

        console.log(
            body.substring(0,500)
        );

        assert.ok(
            body.length > 0
        );

    });

});