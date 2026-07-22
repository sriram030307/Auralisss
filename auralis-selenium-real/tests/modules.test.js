const createDriver = require("../helpers/driver");
const { By } = require("selenium-webdriver");
const assert = require("assert");

describe("Dashboard Modules Test", function () {

    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await createDriver();
    });

    after(async () => {
        await driver.quit();
    });

    it("should verify all dashboard modules exist", async () => {

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

        const modules = [
            "Journey",
            "Guardian",
            "Analytics",
            "Incidents",
            "Modes",
            "Community",
            "Report",
            "Guardian Hub"
        ];

        for(const module of modules){

            console.log(
                "Checking:",
                module
            );

            assert.ok(
                body.includes(module),
                `${module} not found`
            );

        }

    });

});