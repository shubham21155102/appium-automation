const {remote} = require('webdriverio');
const { 
    takeScreenshot, 
    getCapabilities, 
    clickElementByText,
    getAllElementsWithDetails,
    getCompletePageStructure 
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

async function inspectSearchScreen() {
    console.log('Starting screen inspection...');
    let driver;

    try {
        // Connect to Appium server
        console.log('Connecting to Appium server...');
        driver = await remote(opts);
        console.log('Connected to Where Is My Train successfully!');

        // Wait for app to load
        await driver.pause(2000);
        
        // First take a screenshot of the home screen
        await takeScreenshot(driver, 'home_screen_inspection');
        
        // Click on the "Find trains" button
        console.log('Clicking on Find trains button...');
        const clicked = await clickElementByText(driver, 'Find trains');
        
        if (clicked) {
            console.log('Successfully clicked on Find trains');
            await driver.pause(2000);
            await takeScreenshot(driver, 'search_screen_inspection');
            
            // Get detailed information about all elements on the screen
            console.log('Getting detailed information about all elements...');
            await getAllElementsWithDetails(driver);
            
            // Get the complete XML structure of the page
            console.log('Getting complete page structure...');
            await getCompletePageStructure(driver);
            
            // Let's also try to find all EditText fields
            console.log('Finding all EditText fields...');
            const editTexts = await driver.$$('android.widget.EditText');
            console.log(`Found ${editTexts.length} EditText fields`);
            
            // Get details of EditText fields
            for (let i = 0; i < editTexts.length; i++) {
                try {
                    const editText = editTexts[i];
                    const resourceId = await editText.getAttribute('resource-id');
                    const contentDesc = await editText.getAttribute('content-desc');
                    const text = await editText.getText();
                    const bounds = await editText.getRect();
                    
                    console.log(`EditText ${i}:`);
                    console.log(`  Resource ID: ${resourceId || 'none'}`);
                    console.log(`  Content Description: ${contentDesc || 'none'}`);
                    console.log(`  Text: ${text || 'none'}`);
                    console.log(`  Bounds: x=${bounds.x}, y=${bounds.y}, width=${bounds.width}, height=${bounds.height}`);
                    console.log('-------------------');
                } catch (error) {
                    console.log(`Error getting details for EditText ${i}:`, error.message);
                }
            }
            
            // Find all buttons
            console.log('Finding all buttons...');
            const buttons = await driver.$$('android.widget.Button');
            console.log(`Found ${buttons.length} buttons`);
            
            // Get details of buttons
            for (let i = 0; i < buttons.length; i++) {
                try {
                    const button = buttons[i];
                    const resourceId = await button.getAttribute('resource-id');
                    const contentDesc = await button.getAttribute('content-desc');
                    const text = await button.getText();
                    
                    console.log(`Button ${i}:`);
                    console.log(`  Resource ID: ${resourceId || 'none'}`);
                    console.log(`  Content Description: ${contentDesc || 'none'}`);
                    console.log(`  Text: ${text || 'none'}`);
                    console.log('-------------------');
                } catch (error) {
                    console.log(`Error getting details for Button ${i}:`, error.message);
                }
            }
            
            // Also check for TextViews that might be input labels
            console.log('Finding relevant TextViews...');
            const textViews = await driver.$$('android.widget.TextView');
            console.log(`Found ${textViews.length} TextViews`);
            
            for (let i = 0; i < textViews.length; i++) {
                try {
                    const textView = textViews[i];
                    const text = await textView.getText();
                    
                    // Only print those that might be related to search
                    if (text && (
                        text.includes('From') || 
                        text.includes('To') || 
                        text.includes('Source') || 
                        text.includes('Destination') ||
                        text.includes('Search') ||
                        text.includes('Station')
                    )) {
                        const resourceId = await textView.getAttribute('resource-id');
                        const contentDesc = await textView.getAttribute('content-desc');
                        
                        console.log(`TextView ${i}:`);
                        console.log(`  Text: ${text}`);
                        console.log(`  Resource ID: ${resourceId || 'none'}`);
                        console.log(`  Content Description: ${contentDesc || 'none'}`);
                        console.log('-------------------');
                    }
                } catch (error) {
                    console.log(`Error getting details for TextView ${i}:`, error.message);
                }
            }
            
        } else {
            console.log('Failed to click on Find trains button');
        }

        console.log('Inspection completed successfully!');

    } catch (error) {
        console.error('Inspection failed:', error.message);
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

inspectSearchScreen();
