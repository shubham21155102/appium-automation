const {remote} = require('webdriverio');
const { 
    takeScreenshot, 
    getCapabilities, 
    clickElementByText,
    enterTextInField,
    findElementByResourceId,
    handleStationSelection,
    handlePopups 
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
            
            // Enter source station (using our new station selection handler)
            console.log('Entering source station...');
            let sourceSelected = false;
            
            try {
                // Take a screenshot before starting source selection
                await takeScreenshot(driver, 'before_source_selection');
                
                // First try to locate and click on the existing source station field (currently "ADI")
                const sourceFields = [
                    '//android.widget.TextView[@text="ADI"]',
                    '//android.widget.TextView[contains(@text, "From")]',
                    '//android.widget.TextView[contains(@content-desc, "From")]',
                    '//android.widget.TextView[contains(@text, "Source")]'
                ];
                
                for (const sourceXPath of sourceFields) {
                    const sourceElement = await driver.$(sourceXPath);
                    if (await sourceElement.isExisting() && await sourceElement.isDisplayed()) {
                        await sourceElement.click();
                        console.log(`Clicked on source field: ${sourceXPath}`);
                        await driver.pause(1500);
                        
                        // Use our new station selection handler
                        sourceSelected = await handleStationSelection(driver, sourceStation, true);
                        
                        if (sourceSelected) {
                            console.log('Source station selected successfully');
                            break;
                        }
                    }
                }
                
                // If no source field was found or selection failed, try alternative approaches
                if (!sourceSelected) {
                    console.log('Standard source selection failed, trying direct input approach');
                    
                    // Try to find any input field and enter text
                    const inputField = await driver.$('//android.widget.EditText');
                    if (await inputField.isExisting()) {
                        await inputField.click();
                        await driver.pause(1000);
                        await inputField.clearValue();
                        await driver.pause(500);
                        await inputField.setValue(sourceStation);
                        console.log(`Entered source directly: ${sourceStation}`);
                        await driver.pause(2000);
                        
                        // Look for suggestions and click on the first matching one
                        const suggestions = await driver.$$(`//android.widget.TextView[contains(@text, "${sourceStation}")]`);
                        if (suggestions.length > 0) {
                            for (const suggestion of suggestions) {
                                const isVisible = await suggestion.isDisplayed();
                                if (isVisible) {
                                    await suggestion.click();
                                    console.log('Selected source from suggestions list');
                                    sourceSelected = true;
                                    await driver.pause(1500);
                                    await handlePopups(driver);
                                    break;
                                }
                            }
                        }
                    }
                }
                
                // Final fallback: try using our utility function
                if (!sourceSelected) {
                    console.log('Using enterTextInField utility as fallback for source station');
                    await enterTextInField(driver, 'From', sourceStation, false);
                    await driver.pause(1500);
                    
                    // Try clicking on any suggestion
                    const allTextElements = await driver.$$('//android.widget.TextView');
                    for (const element of allTextElements) {
                        try {
                            const text = await element.getText();
                            if (text && text.includes(sourceStation)) {
                                await element.click();
                                console.log(`Selected suggestion: ${text}`);
                                sourceSelected = true;
                                await driver.pause(1500);
                                await handlePopups(driver);
                                break;
                            }
                        } catch (e) {
                            // Skip elements that cause errors
                        }
                    }
                }
            } catch (error) {
                console.error('Error during source station selection:', error.message);
                await takeScreenshot(driver, 'source_selection_error');
            }
            
            // Check for any popups that might appear after source selection
            await handlePopups(driver);
            await takeScreenshot(driver, 'after_source_input');
            
            // Enter destination station
            console.log('Entering destination station...');
            let destinationSelected = false;
            
            try {
                // Take a screenshot before starting destination selection
                await takeScreenshot(driver, 'before_destination_selection');
                
                // First try to locate and click on destination field
                const destFields = [
                    '//android.widget.TextView[contains(@text, "To")]',
                    '//android.widget.TextView[contains(@content-desc, "To")]',
                    '//android.widget.TextView[contains(@text, "Destination")]'
                ];
                
                for (const destXPath of destFields) {
                    const destElement = await driver.$(destXPath);
                    if (await destElement.isExisting() && await destElement.isDisplayed()) {
                        await destElement.click();
                        console.log(`Clicked on destination field: ${destXPath}`);
                        await driver.pause(1500);
                        
                        // Use our new station selection handler
                        destinationSelected = await handleStationSelection(driver, destinationStation, false);
                        
                        if (destinationSelected) {
                            console.log('Destination station selected successfully');
                            break;
                        }
                    }
                }
                
                // If no destination field was found or selection failed, try alternative approaches
                if (!destinationSelected) {
                    console.log('Standard destination selection failed, trying direct input approach');
                    
                    // Try to find any input field and enter text
                    const inputField = await driver.$('//android.widget.EditText');
                    if (await inputField.isExisting()) {
                        await inputField.click();
                        await driver.pause(1000);
                        await inputField.clearValue();
                        await driver.pause(500);
                        await inputField.setValue(destinationStation);
                        console.log(`Entered destination directly: ${destinationStation}`);
                        await driver.pause(2000);
                        
                        // Look for suggestions and click on the first matching one
                        const suggestions = await driver.$$(`//android.widget.TextView[contains(@text, "${destinationStation}")]`);
                        if (suggestions.length > 0) {
                            for (const suggestion of suggestions) {
                                const isVisible = await suggestion.isDisplayed();
                                if (isVisible) {
                                    await suggestion.click();
                                    console.log('Selected destination from suggestions list');
                                    destinationSelected = true;
                                    await driver.pause(1500);
                                    await handlePopups(driver);
                                    break;
                                }
                            }
                        }
                    }
                }
                
                // Final fallback: try using our utility function
                if (!destinationSelected) {
                    console.log('Using enterTextInField utility as fallback for destination station');
                    await enterTextInField(driver, 'To', destinationStation, false);
                    await driver.pause(1500);
                    
                    // Try clicking on any suggestion
                    const allTextElements = await driver.$$('//android.widget.TextView');
                    for (const element of allTextElements) {
                        try {
                            const text = await element.getText();
                            if (text && text.includes(destinationStation)) {
                                await element.click();
                                console.log(`Selected suggestion: ${text}`);
                                destinationSelected = true;
                                await driver.pause(1500);
                                await handlePopups(driver);
                                break;
                            }
                        } catch (e) {
                            // Skip elements that cause errors
                        }
                    }
                }
            } catch (error) {
                console.error('Error during destination station selection:', error.message);
                await takeScreenshot(driver, 'destination_selection_error');
            }
            
            // Check for any popups that might appear after destination selection
            await handlePopups(driver);
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
