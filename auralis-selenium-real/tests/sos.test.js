const createDriver = require("../helpers/driver");
const { By } = require("selenium-webdriver");
const assert = require("assert");

describe("SOS Test", function () {

    this.timeout(90000);

    let driver;

    before(async () => {
        driver = await createDriver();
    });

    after(async () => {
        await driver.quit();
    });

    it("should login and inspect all SOS buttons", async () => {

        await driver.get(
            "https://auralis-sriram.base44.app/login"
        );

        await driver.sleep(2000);

        // Login
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

        await driver.sleep(8000);

        console.log("\n===== SOS BUTTON DISCOVERY =====");

        const buttons = await driver.findElements(
            By.xpath(
                "//button[contains(.,'SOS') or contains(.,'Emergency') or contains(.,'Help')]"
            )
        );

        console.log(
            "SOS Buttons Found:",
            buttons.length
        );

        assert.ok(
            buttons.length > 0,
            "No SOS buttons found"
        );

        for (let i = 0; i < buttons.length; i++) {

            try {

                const text =
                    await buttons[i].getText();

                console.log(
                    `Button ${i}: ${text}`
                );

            } catch (err) {

                console.log(
                    `Button ${i}: Unable to read text`
                );

            }

        }

        console.log(
            "\n===== TESTING EACH BUTTON ====="
        );

        for (let i = 0; i < buttons.length; i++) {

            try {

                console.log(
                    `\nClicking Button ${i}...`
                );

                await buttons[i].click();

                await driver.sleep(3000);

                const currentUrl =
                    await driver.getCurrentUrl();

                console.log(
                    `URL after click ${i}:`,
                    currentUrl
                );

            } catch (err) {

                console.log(
                    `Button ${i} failed:`,
                    err.message
                );

            }

        }

        const finalUrl =
            await driver.getCurrentUrl();

        console.log(
            "\nFinal URL:",
            finalUrl
        );

    });

});