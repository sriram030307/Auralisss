const createDriver = require("../helpers/driver");
const { By } = require("selenium-webdriver");
const assert = require("assert");

describe("Emergency Services Test", function () {

    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await createDriver();
    });

    after(async () => {
        await driver.quit();
    });

    it("should verify emergency numbers", async () => {

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

        await driver.sleep(7000);

        const body = await driver
            .findElement(By.tagName("body"))
            .getText();

        console.log(body);

        assert.ok(body.includes("100"));
        assert.ok(body.includes("108"));
        assert.ok(body.includes("101"));
        assert.ok(body.includes("1091"));

    });

});