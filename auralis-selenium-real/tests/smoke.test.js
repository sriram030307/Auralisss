const createDriver = require("../helpers/driver");
const assert = require("assert");

describe("Auralis Smoke Test", function () {

    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await createDriver();
    });

    after(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    it("should open Auralis website", async () => {

        await driver.get(
            "https://auralis-sriram.base44.app"
        );

        await driver.sleep(5000);

        const currentUrl = await driver.getCurrentUrl();

        console.log("Current URL:", currentUrl);

        assert.ok(currentUrl.includes("base44.app"));
    });

});