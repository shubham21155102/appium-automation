const { remote } = require('webdriverio');

class HotstarAutomation {
    constructor() {
        this.driver = null;
        this.config = {
            capabilities: {
                platformName: 'Android',
                platformVersion: '13', // Adjust to your device version
                deviceName: 'Android Device',
                appPackage: 'in.startv.hotstar', // Hotstar package name
                appActivity: 'in.startv.hotstar.gui.init.StartTVInitActivity',
                automationName: 'UiAutomator2',
                noReset: true,
                fullReset: false,
                newCommandTimeout: 300,
                autoGrantPermissions: true,
                unicodeKeyboard: true,
                resetKeyboard: true,
                systemPort: 8201, // Different port from WhatsApp
                skipUnlock: true,
                autoAcceptAlerts: true
            },
            logLevel: 'info',
            hostname: 'localhost',
            port: 4723,
            path: '/wd/hub'
        };
    }

    async initializeDriver() {
        try {
            console.log('🚀 Starting Hotstar automation...');
            console.log('📱 Connecting to Appium server...');
            
            this.driver = await remote(this.config);
            console.log('✅ Successfully connected to device');
            
            // Wait for app to load
            await this.driver.pause(5000);
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize driver:', error.message);
            return false;
        }
    }

    async handleInitialSetup() {
        try {
            console.log('🔧 Handling initial app setup...');
            
            // Handle permission dialogs
            await this.handlePermissions();
            
            // Skip onboarding if present
            await this.skipOnboarding();
            
            // Handle location permission
            await this.handleLocationPermission();
            
            return true;
        } catch (error) {
            console.log('⚠️ Initial setup handling completed with some issues:', error.message);
            return true; // Continue even if some steps fail
        }
    }

    async handlePermissions() {
        try {
            // Common permission dialog buttons
            const permissionButtons = [
                'Allow',
                'ALLOW',
                'Allow all the time',
                'While using the app',
                'com.android.permissioncontroller:id/permission_allow_button',
                'android:id/button1'
            ];

            for (let i = 0; i < 3; i++) {
                for (const buttonText of permissionButtons) {
                    try {
                        const element = await this.driver.$(
                            buttonText.includes(':id/') 
                                ? `id:${buttonText}`
                                : `//android.widget.Button[@text="${buttonText}"]`
                        );
                        
                        if (await element.isExisting()) {
                            await element.click();
                            console.log(`✅ Clicked permission: ${buttonText}`);
                            await this.driver.pause(1000);
                        }
                    } catch (e) {
                        // Continue to next button
                    }
                }
                await this.driver.pause(1000);
            }
        } catch (error) {
            console.log('⚠️ Permission handling completed');
        }
    }

    async skipOnboarding() {
        try {
            const skipButtons = [
                'Skip',
                'SKIP',
                'Get Started',
                'Continue',
                'Next'
            ];

            for (const buttonText of skipButtons) {
                try {
                    const element = await this.driver.$(`//android.widget.Button[@text="${buttonText}"]`);
                    if (await element.isExisting()) {
                        await element.click();
                        console.log(`✅ Clicked: ${buttonText}`);
                        await this.driver.pause(2000);
                    }
                } catch (e) {
                    // Continue to next button
                }
            }
        } catch (error) {
            console.log('⚠️ Onboarding skip completed');
        }
    }

    async handleLocationPermission() {
        try {
            // Look for "Not now" or "Maybe later" for location
            const locationButtons = [
                'Not now',
                'NOT NOW',
                'Maybe later',
                'Skip'
            ];

            for (const buttonText of locationButtons) {
                try {
                    const element = await this.driver.$(`//android.widget.Button[@text="${buttonText}"]`);
                    if (await element.isExisting()) {
                        await element.click();
                        console.log(`✅ Clicked location option: ${buttonText}`);
                        await this.driver.pause(1000);
                        break;
                    }
                } catch (e) {
                    // Continue
                }
            }
        } catch (error) {
            console.log('⚠️ Location permission handled');
        }
    }

    async searchContent(query) {
        try {
            console.log(`🔍 Searching for: ${query}`);
            
            // Look for search icon/button
            const searchSelectors = [
                '//android.widget.ImageView[@content-desc="Search"]',
                '//android.widget.TextView[@text="Search"]',
                'id:in.startv.hotstar:id/search',
                '//android.widget.ImageButton[contains(@content-desc, "search")]'
            ];

            let searchClicked = false;
            for (const selector of searchSelectors) {
                try {
                    const searchElement = await this.driver.$(selector);
                    if (await searchElement.isExisting()) {
                        await searchElement.click();
                        console.log('✅ Clicked search button');
                        searchClicked = true;
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!searchClicked) {
                console.log('❌ Could not find search button');
                return false;
            }

            await this.driver.pause(2000);

            // Type in search box
            const searchBoxSelectors = [
                '//android.widget.EditText',
                'id:in.startv.hotstar:id/search_edit_text',
                '//android.widget.EditText[@hint="Search"]'
            ];

            for (const selector of searchBoxSelectors) {
                try {
                    const searchBox = await this.driver.$(selector);
                    if (await searchBox.isExisting()) {
                        await searchBox.setValue(query);
                        console.log(`✅ Entered search query: ${query}`);
                        
                        // Press enter or search
                        await this.driver.pressKeyCode(66); // Enter key
                        await this.driver.pause(3000);
                        return true;
                    }
                } catch (e) {
                    continue;
                }
            }

            console.log('❌ Could not find search input field');
            return false;
        } catch (error) {
            console.error('❌ Search failed:', error.message);
            return false;
        }
    }

    async selectFirstResult() {
        try {
            console.log('🎯 Selecting first search result...');
            
            // Wait for search results to load
            await this.driver.pause(3000);

            // Look for first result (various possible selectors)
            const resultSelectors = [
                '(//android.widget.ImageView)[1]',
                '(//androidx.recyclerview.widget.RecyclerView//android.widget.ImageView)[1]',
                '//android.widget.FrameLayout[1]//android.widget.ImageView',
                '(//android.view.ViewGroup[contains(@clickable, "true")])[1]'
            ];

            for (const selector of resultSelectors) {
                try {
                    const firstResult = await this.driver.$(selector);
                    if (await firstResult.isExisting()) {
                        await firstResult.click();
                        console.log('✅ Clicked first search result');
                        await this.driver.pause(4000);
                        return true;
                    }
                } catch (e) {
                    continue;
                }
            }

            console.log('❌ Could not find search results');
            return false;
        } catch (error) {
            console.error('❌ Failed to select result:', error.message);
            return false;
        }
    }

    async playContent() {
        try {
            console.log('▶️ Attempting to play content...');
            
            // Look for play button
            const playSelectors = [
                '//android.widget.ImageView[@content-desc="Play"]',
                '//android.widget.Button[@text="Play"]',
                '//android.widget.TextView[@text="Play"]',
                'id:in.startv.hotstar:id/play_button',
                '//android.widget.ImageButton[contains(@content-desc, "play")]'
            ];

            for (const selector of playSelectors) {
                try {
                    const playButton = await this.driver.$(selector);
                    if (await playButton.isExisting()) {
                        await playButton.click();
                        console.log('✅ Clicked play button');
                        await this.driver.pause(5000);
                        return true;
                    }
                } catch (e) {
                    continue;
                }
            }

            // If no explicit play button, try tapping center of screen
            console.log('🎯 No play button found, tapping center of screen...');
            const { width, height } = await this.driver.getWindowSize();
            await this.driver.touchAction({
                action: 'tap',
                x: width / 2,
                y: height / 2
            });
            
            await this.driver.pause(3000);
            return true;
        } catch (error) {
            console.error('❌ Play failed:', error.message);
            return false;
        }
    }

    async navigateToHome() {
        try {
            console.log('🏠 Navigating to home...');
            
            const homeSelectors = [
                '//android.widget.TextView[@text="Home"]',
                'id:in.startv.hotstar:id/home',
                '//android.widget.FrameLayout[@content-desc="Home"]'
            ];

            for (const selector of homeSelectors) {
                try {
                    const homeButton = await this.driver.$(selector);
                    if (await homeButton.isExisting()) {
                        await homeButton.click();
                        console.log('✅ Navigated to home');
                        await this.driver.pause(3000);
                        return true;
                    }
                } catch (e) {
                    continue;
                }
            }

            return false;
        } catch (error) {
            console.error('❌ Navigation to home failed:', error.message);
            return false;
        }
    }

    async scrollAndExplore() {
        try {
            console.log('📱 Scrolling through content...');
            
            // Scroll down to see more content
            for (let i = 0; i < 3; i++) {
                await this.driver.execute('mobile: scroll', {
                    direction: 'down'
                });
                await this.driver.pause(2000);
                console.log(`✅ Scrolled ${i + 1} times`);
            }

            return true;
        } catch (error) {
            console.error('❌ Scrolling failed:', error.message);
            return false;
        }
    }

    async takeScreenshot(filename = 'hotstar_screenshot.png') {
        try {
            const screenshot = await this.driver.takeScreenshot();
            require('fs').writeFileSync(filename, screenshot, 'base64');
            console.log(`📸 Screenshot saved as ${filename}`);
            return true;
        } catch (error) {
            console.error('❌ Screenshot failed:', error.message);
            return false;
        }
    }

    async cleanup() {
        try {
            if (this.driver) {
                await this.driver.deleteSession();
                console.log('🧹 Session cleaned up successfully');
            }
        } catch (error) {
            console.error('❌ Cleanup failed:', error.message);
        }
    }

    // Main automation flow
    async runAutomation() {
        try {
            // Initialize
            if (!(await this.initializeDriver())) {
                return false;
            }

            // Handle initial setup
            await this.handleInitialSetup();

            // Take initial screenshot
            await this.takeScreenshot('hotstar_initial.png');

            // Navigate to home
            await this.navigateToHome();

            // Scroll and explore
            await this.scrollAndExplore();

            // Search for content
            await this.searchContent('Avengers');

            // Select first result
            await this.selectFirstResult();

            // Take screenshot of selected content
            await this.takeScreenshot('hotstar_content.png');

            // Attempt to play
            await this.playContent();

            // Take final screenshot
            await this.takeScreenshot('hotstar_final.png');

            console.log('🎉 Hotstar automation completed successfully!');
            return true;

        } catch (error) {
            console.error('❌ Automation failed:', error.message);
            await this.takeScreenshot('hotstar_error.png');
            return false;
        } finally {
            // Clean up
            setTimeout(() => this.cleanup(), 5000);
        }
    }
}

// Usage
async function startHotstarAutomation() {
    const automation = new HotstarAutomation();
    await automation.runAutomation();
}

// Export for use
module.exports = { HotstarAutomation, startHotstarAutomation };

// Run if called directly
if (require.main === module) {
    startHotstarAutomation().catch(console.error);
}