const createDriver = require("../helpers/driver");
const { By } = require("selenium-webdriver");

describe("Route Discovery", function () {

    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await createDriver();
    });

    after(async () => {
        await driver.quit();
    });

    it("should discover links", async () => {

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

        const links = await driver.findElements(
            By.css("a")
        );

        console.log("\n===== LINKS =====");

        for(let i=0;i<links.length;i++){

            try{

                const href =
                    await links[i].getAttribute(
                        "href"
                    );

                const text =
                    await links[i].getText();

                console.log(
                    i,
                    text,
                    href
                );

            }catch(err){}

        }

    });

});