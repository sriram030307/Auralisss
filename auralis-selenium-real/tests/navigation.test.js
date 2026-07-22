const createDriver = require("../helpers/driver");
const { By } = require("selenium-webdriver");
const assert = require("assert");

describe("Navigation Test", function () {

    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await createDriver();
    });

    after(async () => {
        await driver.quit();
    });

    it("should login", async () => {

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

        await driver.sleep(8000);

        const currentUrl =
            await driver.getCurrentUrl();

        assert.ok(
            currentUrl.includes("base44.app")
        );
    });

    it("should navigate to Map page", async () => {

        await driver.get(
            "https://auralis-sriram.base44.app/map"
        );

        await driver.sleep(5000);

        const url =
            await driver.getCurrentUrl();

        console.log("Map:", url);

        assert.ok(url.includes("/map"));
    });

    it("should navigate to Chat page", async () => {

        await driver.get(
            "https://auralis-sriram.base44.app/chat"
        );

        await driver.sleep(5000);

        const url =
            await driver.getCurrentUrl();

        console.log("Chat:", url);

        assert.ok(url.includes("/chat"));
    });

    it("should navigate to Notifications page", async () => {

        await driver.get(
            "https://auralis-sriram.base44.app/notifications"
        );

        await driver.sleep(5000);

        const url =
            await driver.getCurrentUrl();

        console.log("Notifications:", url);

        assert.ok(
            url.includes("/notifications")
        );
    });

    it("should navigate to Profile page", async () => {

        await driver.get(
            "https://auralis-sriram.base44.app/profile"
        );

        await driver.sleep(5000);

        const url =
            await driver.getCurrentUrl();

        console.log("Profile:", url);

        assert.ok(
            url.includes("/profile")
        );
    });

});