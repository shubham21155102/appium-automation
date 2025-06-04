const {remote} = require('webdriverio');
const { takeScreenshot, getCapabilities, printAllTextContent, getTextElementsWithDetails } = require('./utils/services');
const appPackage = 'com.whereismytrain.android';
const appActivity = 'com.whereismytrain.view.activities.MainPagerActivity'; // ✅ Updated here
const capabilities=getCapabilities(
    appPackage,
    appActivity
);
const opts = {
    path: '/wd/hub',
    port: 4723,
    capabilities,
};
async function automateWhereIsMyTrain() {
    console.log('Starting Where Is My Train automation...');
    let driver;

    try {
        // Connect to Appium server
        console.log('Connecting to Appium server...');
        driver = await remote(opts);
        console.log('Connected to Where Is My Train successfully!');

        // Wait for app to load completely
        // await driver.pause(5000);

        // Take initial screenshot
        // await takeScreenshot(driver, 'where_is_my_train_opened');
        await takeScreenshot(driver, 'where_is_my_train_opened_full');

        // Print all elements on the screen
        console.log('Getting text elements from the screen:');
        await printAllTextContent(driver);
        
        // Get more detailed information about text elements
        console.log('\nCollecting detailed information about text elements:');
        const textElements = await getTextElementsWithDetails(driver);
        console.log(`Collected details for ${textElements.length} text elements`);

        console.log('Automation completed successfully!');

    } catch (error) {
        console.error('Automation failed:', error.message);
        if (driver) {
            await takeScreenshot(driver, 'error_screenshot');
        }
    } finally {
        if (driver) {
            await driver.deleteSession();
            console.log('Session deleted.');
        }
    }
}
automateWhereIsMyTrain()
