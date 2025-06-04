const fs = require('fs');
const path = require('path');
async function takeScreenshot(driver, filename) {
    try {
        if (!fs.existsSync('./screenshots')) {
            fs.mkdirSync('./screenshots');
        }
        await driver.saveScreenshot(`./screenshots/${filename}.png`);
        console.log(`Screenshot saved: ${filename}.png`);
    } catch (error) {
        console.error('Error taking screenshot:', error);
    }
}
async function getCompletePageStructure(driver) {
    try {
        // Get full XML hierarchy
        const pageSource = await driver.getPageSource();
        
        // Save to file with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `./page_structure_${timestamp}.xml`;
        fs.writeFileSync(filename, pageSource, 'utf8');
        
        console.log(`Complete page structure saved to: ${filename}`);
        console.log('XML Preview:');
        console.log(pageSource.substring(0, 1000) + '...');
        
        return pageSource;
    } catch (error) {
        console.error('Error getting page source:', error);
    }
}

async function getAllElementsWithDetails(driver) {
    try {
        // Find all elements using UiAutomator
        const allElements = await driver.$$('*');
        console.log(`Found ${allElements.length} elements on screen`);
        
        const elementDetails = [];
        
        for (let i = 0; i < Math.min(allElements.length, 50); i++) { // Limit to first 50 elements
            const element = allElements[i];
            try {
                const details = {
                    index: i,
                    tagName: await element.getTagName(),
                    text: await element.getText() || '',
                    isDisplayed: await element.isDisplayed(),
                    isEnabled: await element.isEnabled(),
                    location: await element.getLocation(),
                    size: await element.getSize(),
                    attributes: {}
                };
                
                // Get common attributes
                const commonAttributes = ['resource-id', 'class', 'package', 'content-desc', 'checkable', 'clickable', 'enabled', 'focusable', 'scrollable'];
                
                for (const attr of commonAttributes) {
                    try {
                        details.attributes[attr] = await element.getAttribute(attr);
                    } catch (e) {
                        // Attribute might not exist
                    }
                }
                
                elementDetails.push(details);
                
            } catch (elementError) {
                console.log(`Error processing element ${i}:`, elementError.message);
            }
        }
        
        // Save detailed information
        fs.writeFileSync('./element_details.json', JSON.stringify(elementDetails, null, 2), 'utf8');
        console.log('Detailed element information saved to element_details.json');
        
        return elementDetails;
    } catch (error) {
        console.error('Error getting element details:', error);
    }
}
async function printElementTree(driver) {
    try {
        // Get elements by different selectors to show hierarchy
        const layouts = await driver.$$('android.widget.LinearLayout');
        const textViews = await driver.$$('android.widget.TextView');
        const imageViews = await driver.$$('android.widget.ImageView');
        const buttons = await driver.$$('android.widget.Button');
        
        console.log('Element Summary:');
        console.log(`- LinearLayouts: ${layouts.length}`);
        console.log(`- TextViews: ${textViews.length}`);
        console.log(`- ImageViews: ${imageViews.length}`);
        console.log(`- Buttons: ${buttons.length}`);
        
        // Create a summary object
        const summary = {
            timestamp: new Date().toISOString(),
            elementCounts: {
                LinearLayout: layouts.length,
                TextView: textViews.length,
                ImageView: imageViews.length,
                Button: buttons.length
            },
            screenInfo: {
                windowSize: await driver.getWindowSize()
            }
        };
        
        fs.writeFileSync('./element_summary.json', JSON.stringify(summary, null, 2), 'utf8');
        console.log('Element summary saved to element_summary.json');
        
    } catch (error) {
        console.error('Error creating element tree:', error);
    }
}
function getCapabilities(appPackage, appActivity) {
    console.log(`Getting capabilities for ${appPackage} and ${appActivity}`);
    const capabilities = {
    platformName: 'Android',
    platformVersion: '13',
    deviceName: 'iQOO Z5',
    appPackage:  appPackage || 'com.whereismytrain.android',
    appActivity: appActivity || 'com.whereismytrain.view.activities.MainPagerActivity',
    automationName: 'UiAutomator2',
    appWaitActivity: '*.*',
    noReset: true,
    fullReset: false,
    newCommandTimeout: 300,
    autoGrantPermissions: true,
    unicodeKeyboard: true,
    resetKeyboard: true,
    systemPort: 8200,
    skipUnlock: true
}
return capabilities;

}
async function printAllTextContent(driver) {
     const elements = await driver.$$('android.widget.TextView');
        console.log('Elements on the screen:');
        for (const element of elements) {
            const text = await element.getText();
            console.log(text);
        }
        return elements;
}

async function getTextElementsWithDetails(driver) {
    try {
        const elements = await driver.$$('android.widget.TextView');
        console.log(`Found ${elements.length} TextView elements`);
        
        const textElements = [];
        
        for (let i = 0; i < elements.length; i++) {
            try {
                const element = elements[i];
                const details = {
                    index: i,
                    elementId: element.elementId, // This is the ID from the output you shared
                    text: await element.getText() || '',
                    isDisplayed: await element.isDisplayed(),
                    location: await element.getLocation(),
                    size: await element.getSize(),
                    resourceId: await element.getAttribute('resource-id') || '',
                    contentDesc: await element.getAttribute('content-desc') || ''
                };
                
                textElements.push(details);
                console.log(`Element ${i}: ${details.text} (${details.resourceId || 'no ID'})`);
                
            } catch (elementError) {
                console.log(`Error processing text element ${i}:`, elementError.message);
            }
        }
        
        // Save to file
        fs.writeFileSync('./text_elements.json', JSON.stringify(textElements, null, 2), 'utf8');
        console.log('Text element details saved to text_elements.json');
        
        return textElements;
    } catch (error) {
        console.error('Error getting text element details:', error);
        return [];
    }
}

async function clickElementByText(driver, textToFind) {
    try {
        // Using XPath to find element by exact text match
        const xpath = `//*[@class="android.widget.TextView" and @text="${textToFind}"]`;
        console.log(`Looking for element with text: "${textToFind}"`);
        
        // Wait for element to be present and visible
        const element = await driver.$(xpath);
        const isDisplayed = await element.isDisplayed();
        
        if (isDisplayed) {
            console.log(`Found element with text "${textToFind}", clicking it...`);
            await element.click();
            console.log(`Clicked on element with text: "${textToFind}"`);
            return true;
        } else {
            console.log(`Element with text "${textToFind}" is not displayed`);
            return false;
        }
    } catch (error) {
        console.error(`Failed to click element with text "${textToFind}":`, error.message);
        return false;
    }
}

async function findElementByResourceId(driver, resourceId) {
    try {
        // Using resource-id to find element
        const selector = `android=resourceId("${resourceId}")`;
        console.log(`Looking for element with resource ID: "${resourceId}"`);
        
        const element = await driver.$(selector);
        const exists = await element.isExisting();
        
        if (exists) {
            console.log(`Found element with resource ID: "${resourceId}"`);
            return element;
        } else {
            console.log(`Element with resource ID "${resourceId}" not found`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to find element with resource ID "${resourceId}":`, error.message);
        return null;
    }
}

async function enterTextInField(driver, fieldIdentifier, text, isResourceId = false) {
    try {
        let element;
        if (isResourceId) {
            // Find by resource ID
            element = await findElementByResourceId(driver, fieldIdentifier);
        } else {
            // Find by accessibility ID or content-desc
            element = await driver.$(`~${fieldIdentifier}`);
        }

        if (!element) {
            // Try finding input field near a label
            console.log(`Trying to find input field with label: "${fieldIdentifier}"`);
            const xpath = `//*[@text="${fieldIdentifier}"]/following::android.widget.EditText[1]`;
            element = await driver.$(xpath);
        }

        if (await element.isExisting()) {
            await element.click();
            await element.clearValue();
            await element.setValue(text);
            console.log(`Entered text "${text}" into field "${fieldIdentifier}"`);
            return true;
        } else {
            console.log(`Could not find field "${fieldIdentifier}" to enter text`);
            return false;
        }
    } catch (error) {
        console.error(`Failed to enter text in field "${fieldIdentifier}":`, error.message);
        return false;
    }
}

async function handleStationSelection(driver, stationCode, isSource = true) {
    try {
        const stationType = isSource ? 'source' : 'destination';
        console.log(`Handling ${stationType} station selection: ${stationCode}`);
        
        // First check if there's already a selection screen showing
        const waitTime = 2000;
        await driver.pause(waitTime);
        
        // Look for a text input field
        const inputField = await driver.$('//android.widget.EditText');
        if (await inputField.isExisting()) {
            await inputField.clearValue();
            await driver.pause(500);
            await inputField.setValue(stationCode);
            console.log(`Entered ${stationCode} in ${stationType} field`);
            await driver.pause(1500); // Wait for suggestions to appear
        } else {
            console.log(`No input field found for ${stationType} station`);
            return false;
        }
        
        // Take a screenshot of the suggestions
        await takeScreenshot(driver, `${stationType}_suggestions`);
        
        // Try to find and click on a suggestion that contains the station code
        // First try exact match with station code
        const stationExact = await driver.$(`//android.widget.TextView[contains(@text, "${stationCode}") and not(contains(@text, "No stations"))]`);
        if (await stationExact.isExisting() && await stationExact.isDisplayed()) {
            await stationExact.click();
            console.log(`Selected station ${stationCode} from dropdown`);
            await driver.pause(1500); // Wait for navigation after selection
            
            // Check if we need to handle any popups
            await handlePopups(driver);
            return true;
        }
        
        // Try broader match if exact match fails
        const stationOptions = await driver.$$('//android.widget.TextView');
        for (const option of stationOptions) {
            const text = await option.getText();
            if (text && text.includes(stationCode)) {
                await option.click();
                console.log(`Selected station suggestion: ${text}`);
                await driver.pause(1500);
                
                // Check if we need to handle any popups
                await handlePopups(driver);
                return true;
            }
        }
        
        console.log(`No matching suggestion found for station ${stationCode}`);
        return false;
    } catch (error) {
        console.error(`Error in station selection for ${stationCode}:`, error.message);
        return false;
    }
}

async function handlePopups(driver) {
    try {
        // Check for warning/error popups
        const possiblePopupTexts = ['Warning', 'Error', 'Please select', 'Invalid', 'Not found', 'OK', 'RETRY', 'CANCEL'];
        
        for (const popupText of possiblePopupTexts) {
            const popupElement = await driver.$(`//android.widget.TextView[contains(@text, "${popupText}")]`);
            if (await popupElement.isExisting() && await popupElement.isDisplayed()) {
                console.log(`Found popup with text: ${popupText}`);
                await takeScreenshot(driver, 'popup_detected');
                
                // Find and click OK or dismiss button
                const okButton = await driver.$('//android.widget.Button[@text="OK" or @text="Ok" or @text="ok"]');
                if (await okButton.isExisting()) {
                    await okButton.click();
                    console.log('Clicked OK button on popup');
                    await driver.pause(1000);
                    return true;
                }
                
                // Try clicking on any button in the popup
                const buttons = await driver.$$('//android.widget.Button');
                if (buttons.length > 0) {
                    for (const button of buttons) {
                        const isDisplayed = await button.isDisplayed();
                        if (isDisplayed) {
                            await button.click();
                            console.log('Clicked button in popup');
                            await driver.pause(1000);
                            return true;
                        }
                    }
                }
                
                // If no buttons found but there is a popup, try tapping back
                await driver.back();
                console.log('Pressed back button to dismiss popup');
                await driver.pause(1000);
                return true;
            }
        }
        
        return false; // No popup found
    } catch (error) {
        console.error('Error handling popup:', error.message);
        return false;
    }
}

module.exports = {
    takeScreenshot,
    getCompletePageStructure,
    getAllElementsWithDetails,
    printElementTree,
    getCapabilities,
    printAllTextContent,
    getTextElementsWithDetails,
    clickElementByText,
    findElementByResourceId,
    enterTextInField,
    handleStationSelection,
    handlePopups
};