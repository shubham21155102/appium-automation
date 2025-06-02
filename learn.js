// WhatsApp Automation with Appium - Educational Purpose Only
// WARNING: This violates WhatsApp's Terms of Service - Use only for learning

const { remote } = require('webdriverio');
const fs = require('fs');

// Desired Capabilities for WhatsApp
const capabilities = {
    platformName: 'Android',
    platformVersion: '13', // Change to YOUR Android version
    deviceName: 'Android Device', // Change to YOUR device name
    appPackage: 'com.whatsapp',
    appActivity: 'com.whatsapp.HomeActivity',
    automationName: 'UiAutomator2',
    noReset: true,
    fullReset: false,
    newCommandTimeout: 300,
    autoGrantPermissions: true,
    unicodeKeyboard: true,
    resetKeyboard: true,
    systemPort: 8200,
    skipUnlock: true
};

const opts = {
    path: '/wd/hub',
    port: 4723,
    capabilities,
};

// async function automateWhatsApp() {
//     console.log('Starting WhatsApp automation...');
//     let driver;
    
//     try {
//         // Connect to Appium server
//         console.log('Connecting to Appium server...');
//         driver = await remote(opts);
//         console.log('Connected to WhatsApp successfully!');

//         // Wait for app to load completely
//         await driver.pause(5000);
        
//         // Take initial screenshot
//         await takeScreenshot(driver, 'whatsapp_opened');
        
//         // print all elements on the screen
//         const elements = await driver.$$('android.widget.TextView');
//         console.log('Elements on the screen:');
//         for (const element of elements) {
//             const text = await element.getText();
//             console.log(text);
//         }
        
//         console.log('Automation completed successfully!');
        
//     } catch (error) {
//         console.error('Automation failed:', error.message);
//         if (driver) {
//             await takeScreenshot(driver, 'error_screenshot');
//         }
//     } finally {
//         // Always close the session
//         if (driver) {
//             await driver.deleteSession();
//             console.log('Session closed');
//         }
//     }
// }
async function automateWhatsApp() {
    console.log('Starting WhatsApp automation...');
    let driver;
    
    try {
        // Connect to Appium server
        console.log('Connecting to Appium server...');
        driver = await remote(opts);
        console.log('Connected to WhatsApp successfully!');

        // Wait for app to load completely
        await driver.pause(5000);
        
        // Take initial screenshot
        await takeScreenshot(driver, 'whatsapp_opened');
        
        // Method 1: Get complete page source (XML structure)
        console.log('\n=== Getting Complete Page Structure ===');
        await getCompletePageStructure(driver);
        
        // Method 2: Get detailed element information
        console.log('\n=== Getting Detailed Element Information ===');
        await getAllElementsWithDetails(driver);
        
        // Method 3: Print formatted element tree
        console.log('\n=== Element Tree Structure ===');
        await printElementTree(driver);
        
        console.log('Automation completed successfully!');
        
    } catch (error) {
        console.error('Automation failed:', error.message);
        if (driver) {
            await takeScreenshot(driver, 'error_screenshot');
        }
    } finally {
        // Always close the session
        if (driver) {
            await driver.deleteSession();
            console.log('Session closed');
        }
    }
}

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

// Export functions for use in tests
module.exports = {
    automateWhatsApp,
    takeScreenshot,
    capabilities,
    opts
};
automateWhatsApp();