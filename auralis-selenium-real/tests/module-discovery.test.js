const createDriver = require("../helpers/driver");
const { By } = require("selenium-webdriver");

describe("Module Discovery", function () {

    this.timeout(60000);

    let driver;

    before(async () => {
        driver = await createDriver();
    });

    after(async () => {
        await driver.quit();
    });

    it("should discover all buttons", async () => {

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

        const buttons =
            await driver.findElements(
                By.css("button")
            );

        console.log(
            "\n===== BUTTONS ====="
        );

        for(let i=0;i<buttons.length;i++){

            try{

                const text =
                    await buttons[i].getText();

                console.log(
                    i + " => " + text
                );

            }catch(err){}
        }

    });

});