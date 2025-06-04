const {remote} = require('webdriverio');
const { 
    takeScreenshot, 
    getCapabilities, 
    clickElementByText,
    enterTextInField,
    findElementByResourceId 
} = require('./utils/services');

const appPackage = 'com.whereismytrain.android';
const appActivity = 'com.whereismytrain.view.activities.MainPagerActivity';
const capabilities = getCapabilities(
    appPackage,
    appActivity
);
const opts = {
    path: '/wd/hub',
    port: 4723,
    capabilities,
};

async function searchTrain(sourceStation = 'NDLS', destinationStation = 'PNBE') {
    console.log(`Starting train search automation for ${sourceStation} to ${destinationStation}...`);
    let driver;

    try {
        // Connect to Appium server
        console.log('Connecting to Appium server...');
        driver = await remote(opts);
        console.log('Connected to Where Is My Train successfully!');

        // Wait for app to load
        await driver.pause(2000);
        await takeScreenshot(driver, 'app_home_screen');

        // Click on the "Find trains" button
        console.log('Clicking on Find trains button...');
        const clicked = await clickElementByText(driver, 'Find trains');
        
        if (clicked) {
            console.log('Successfully clicked on Find trains');
            await driver.pause(2000);
            await takeScreenshot(driver, 'after_find_trains_click');
            
            // Enter source station (based on our inspection, it appears as ADI - Ahmedabad Junction)
            console.log('Entering source station...');
            // First try clicking on the source station element if it's already visible
            console.log('Looking for source field or station text...');
            
            try {
                // Try to find the source station element (currently showing "ADI")
                const sourceStationText = await driver.$('//android.widget.TextView[@text="ADI"]');
                if (await sourceStationText.isExisting() && await sourceStationText.isDisplayed()) {
                    await sourceStationText.click();
                    console.log('Clicked on source station text (ADI)');
                    await driver.pause(1500);
                    
                    // Now try to find input field
                    const sourceInputField = await driver.$('//android.widget.EditText');
                    if (await sourceInputField.isExisting()) {
                        await sourceInputField.clearValue();
                        await driver.pause(500);
                        await sourceInputField.setValue(sourceStation);
                        console.log(`Entered source: ${sourceStation}`);
                        await driver.pause(1500);
                        
                        // Try to select from suggestions
                        const sourceSelection = await driver.$(`//android.widget.TextView[contains(@text, "${sourceStation}")]`);
                        if (await sourceSelection.isExisting()) {
                            await sourceSelection.click();
                            console.log('Selected source from suggestions');
                            await driver.pause(1000);
                        }
                    }
                } else {
                    // Try alternative approaches if direct element not found
                    console.log('Source station text not found, trying alternative approach');
                    const sourceField = await driver.$('//android.widget.EditText[contains(@resource-id, "source") or contains(@content-desc, "source")]');
                    if (await sourceField.isExisting()) {
                        await sourceField.click();
                        await driver.pause(1000);
                        await sourceField.setValue(sourceStation);
                        console.log(`Entered source: ${sourceStation}`);
                        await driver.pause(1000);
                        
                        // Select from suggestions
                        const sourceSelection = await driver.$(`//android.widget.TextView[contains(@text, "${sourceStation}")]`);
                        if (await sourceSelection.isExisting()) {
                            await sourceSelection.click();
                            console.log('Selected source from suggestions');
                            await driver.pause(1000);
                        }
                    } else {
                        console.log('Could not find source input field directly, trying enterTextInField utility');                await enterTextInField(driver, 'From', sourceStation, false);
                await driver.pause(1000);
                
                // Try to select from suggestions
                await clickElementByText(driver, `${sourceStation}`);
                        await driver.pause(1000);
                    }
                }
            } catch (error) {
                console.error('Error while entering source station:', error.message);
                // Fallback method
                console.log('Using fallback method for source station entry');
                await enterTextInField(driver, 'From', sourceStation, false);
                await driver.pause(1000);
                await clickElementByText(driver, sourceStation);
            }
            
            await takeScreenshot(driver, 'after_source_input');
            
            // Enter destination station
            console.log('Entering destination station...');
            
            try {
                // Check if we need to click a "To" field first
                const toText = await driver.$('//android.widget.TextView[contains(@text, "To") or contains(@content-desc, "To")]');
                if (await toText.isExisting() && await toText.isDisplayed()) {
                    await toText.click();
                    console.log('Clicked on To field');
                    await driver.pause(1500);
                }
                
                // Try to find destination input field
                const destInputField = await driver.$('//android.widget.EditText');
                if (await destInputField.isExisting()) {
                    await destInputField.clearValue();
                    await driver.pause(500);
                    await destInputField.setValue(destinationStation);
                    console.log(`Entered destination: ${destinationStation}`);
                    await driver.pause(1500);
                    
                    // Try to select from suggestions
                    const destSelection = await driver.$(`//android.widget.TextView[contains(@text, "${destinationStation}")]`);
                    if (await destSelection.isExisting()) {
                        await destSelection.click();
                        console.log('Selected destination from suggestions');
                        await driver.pause(1000);
                    }
                } else {
                    // Try specific field locators if direct element not found
                    console.log('Destination input not found directly, trying alternative approaches');
                    const destField = await driver.$('//android.widget.EditText[contains(@resource-id, "destination") or contains(@content-desc, "destination")]');
                    if (await destField.isExisting()) {
                        await destField.click();
                        await driver.pause(1000);
                        await destField.setValue(destinationStation);
                        console.log(`Entered destination: ${destinationStation}`);
                        await driver.pause(1000);
                        
                        // Select from autocomplete suggestions
                        const destSelection = await driver.$(`//android.widget.TextView[contains(@text, "${destinationStation}")]`);
                        if (await destSelection.isExisting()) {
                            await destSelection.click();
                            console.log('Selected destination from suggestions');
                            await driver.pause(1000);
                        }
                    } else {
                        console.log('Could not find destination input field directly, trying enterTextInField utility');
                        await enterTextInField(driver, 'To', destinationStation, false);
                        await driver.pause(1000);
                        
                        // Try to select from suggestions
                        await clickElementByText(driver, destinationStation);
                        await driver.pause(1000);
                    }
                }
            } catch (error) {
                console.error('Error while entering destination station:', error.message);
                // Fallback method
                console.log('Using fallback method for destination station entry');
                await enterTextInField(driver, 'To', destinationStation, false);
                await driver.pause(1000);
                await clickElementByText(driver, destinationStation);
            }
            
            await takeScreenshot(driver, 'after_destination_input');
            
            // Click search/find button - based on inspection we know there's a "Find trains" button
            console.log('Clicking search/find button...');
            
            try {
                // First try the "Find trains" button which we've seen in the inspection
                const findTrainsButton = await driver.$('//android.widget.TextView[@text="Find trains"]');
                if (await findTrainsButton.isExisting() && await findTrainsButton.isDisplayed()) {
                    await findTrainsButton.click();
                    console.log('Clicked on "Find trains" button');
                    await driver.pause(2000);
                } else {
                    console.log('Find trains button not found, trying alternative methods');
                    
                    // Try different ways to locate the search button
                    const searchButton = await driver.$('//android.widget.Button[contains(@resource-id, "search") or contains(@text, "Search") or contains(@content-desc, "Search")]');
                    if (await searchButton.isExisting()) {
                        await searchButton.click();
                        console.log('Clicked on search button');
                    } else {
                        // Alternative: try clicking a text that might be the search button
                        const clicked = await clickElementByText(driver, 'SEARCH');
                        if (!clicked) {
                            // Try other text variations
                            await clickElementByText(driver, 'Search');
                            await clickElementByText(driver, 'FIND');
                            await clickElementByText(driver, 'Find');
                            await clickElementByText(driver, 'GO');
                        }
                    }
                }
                
                // Wait for results to load
                console.log('Waiting for search results...');
                await driver.pause(3000);
                await takeScreenshot(driver, 'search_results');
                
                // Check if search was successful by looking for indicators like train numbers or schedules
                const trainNumbers = await driver.$$('//android.widget.TextView[matches(@text, "[0-9]{5}")]');
                if (trainNumbers.length > 0) {
                    console.log(`Search completed successfully! Found ${trainNumbers.length} trains.`);
                } else {
                    console.log('Search completed, but no clear train numbers found in results. Taking additional screenshot.');
                    await driver.pause(2000); // Wait a bit more in case results are still loading
                    await takeScreenshot(driver, 'search_results_additional');
                }
            } catch (error) {
                console.error('Error while performing search:', error.message);
                await takeScreenshot(driver, 'search_error');
            }
            
        } else {
            console.log('Failed to click on Find trains button');
        }

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

// Get command line arguments if provided, otherwise use defaults
const args = process.argv.slice(2);
const sourceStation = args[0] || 'NDLS';  // Default: New Delhi
const destinationStation = args[1] || 'PNBE';  // Default: Patna

console.log(`Running search with source: ${sourceStation}, destination: ${destinationStation}`);
searchTrain(sourceStation, destinationStation);
