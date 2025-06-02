const { remote } = require('webdriverio');
const fs = require('fs');
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
async function extractWhatsAppElements(driver) {
    try {
        console.log('=== Extracting WhatsApp UI Elements ===');
        
        // 1. Get Search Bar
        const searchBar = await driver.$('//android.widget.TextView[@resource-id="com.whatsapp:id/search_text"]');
        if (await searchBar.isDisplayed()) {
            const searchText = await searchBar.getText();
            console.log(`Search Bar Text: "${searchText}"`);
        }
        
        // 2. Get Filter Buttons
        const filterButtons = await driver.$$('//android.widget.RadioButton');
        console.log(`\nFilter Buttons (${filterButtons.length} found):`);
        for (let i = 0; i < filterButtons.length; i++) {
            const button = filterButtons[i];
            const contentDesc = await button.getAttribute('content-desc');
            console.log(`  ${i + 1}. ${contentDesc}`);
        }
        
        // 3. Get Archive Section
        const archiveButton = await driver.$('//android.widget.Button[@resource-id="com.whatsapp:id/conversations_archive_header"]');
        if (await archiveButton.isDisplayed()) {
            const archiveText = await archiveButton.$('//android.widget.TextView[@resource-id="com.whatsapp:id/archived_row"]').getText();
            const archiveCount = await archiveButton.$('//android.widget.TextView[@resource-id="com.whatsapp:id/archive_row_counter"]').getText();
            console.log(`\nArchive: ${archiveText} (${archiveCount} chats)`);
        }
        
        // 4. Get All Chat Conversations
        const chatRows = await driver.$$('//android.widget.LinearLayout[@resource-id="com.whatsapp:id/contact_row_container"]');
        console.log(`\nChat Conversations (${chatRows.length} found):`);
        
        for (let i = 0; i < chatRows.length; i++) {
            const chatRow = chatRows[i];
            try {
                // Get contact name
                const contactName = await chatRow.$('//android.widget.TextView[@resource-id="com.whatsapp:id/conversations_row_contact_name"]').getText();
                
                // Get last message
                const lastMessage = await chatRow.$('//android.widget.TextView[@resource-id="com.whatsapp:id/single_msg_tv"]').getText();
                
                // Get date
                const date = await chatRow.$('//android.widget.TextView[@resource-id="com.whatsapp:id/conversations_row_date"]').getText();
                
                console.log(`  ${i + 1}. ${contactName}`);
                console.log(`     Last: ${lastMessage}`);
                console.log(`     Date: ${date}`);
                console.log('');
                
            } catch (error) {
                console.log(`     Error reading chat ${i + 1}: ${error.message}`);
            }
        }
        
        return {
            searchBar: searchText,
            filterButtons: filterButtons.length,
            archiveCount: archiveCount,
            chatCount: chatRows.length
        };
        
    } catch (error) {
        console.error('Error extracting elements:', error);
    }
}
async function interactWithWhatsAppElements(driver) {
    try {
        // Click on search bar
        console.log('Clicking search bar...');
        const searchBar = await driver.$('//android.widget.FrameLayout[@resource-id="com.whatsapp:id/my_search_bar"]');
        await searchBar.click();
        await driver.pause(2000);
        
        // Click on a specific filter (e.g., Unread)
        console.log('Clicking Unread filter...');
        const unreadFilter = await driver.$('//android.widget.RadioButton[@content-desc*="Unread"]');
        await unreadFilter.click();
        await driver.pause(2000);
        
        // Click on first chat
        console.log('Clicking first chat...');
        const firstChat = await driver.$('(//android.widget.LinearLayout[@resource-id="com.whatsapp:id/contact_row_container"])[1]');
        await firstChat.click();
        await driver.pause(3000);
        
        // Go back
        await driver.back();
        await driver.pause(2000);
        
    } catch (error) {
        console.error('Error interacting with elements:', error);
    }
}
async function automateWhatsApp() {
    console.log('Starting WhatsApp automation...');
    let driver;
    
    try {
        driver = await remote(opts);
        console.log('Connected to WhatsApp successfully!');
        await driver.pause(5000);
        
        // Take screenshot
        await takeScreenshot(driver, 'whatsapp_opened');
        
        // Extract all elements
        const elementData = await extractWhatsAppElements(driver);
        
        // Save element data
        fs.writeFileSync('./whatsapp_elements.json', JSON.stringify(elementData, null, 2), 'utf8');
        console.log('Element data saved to whatsapp_elements.json');
        
        // Optional: Interact with elements
        // await interactWithWhatsAppElements(driver);
        
        console.log('Automation completed successfully!');
        
    } catch (error) {
        console.error('Automation failed:', error.message);
        if (driver) {
            await takeScreenshot(driver, 'error_screenshot');
        }
    } finally {
        if (driver) {
            await driver.deleteSession();
            console.log('Session closed');
        }
    }
}

async function takeScreenshot(driver, filename) {
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(`./${filename}.png`, screenshot, 'base64');
    console.log(`Screenshot saved as ${filename}.png`);
}

automateWhatsApp();