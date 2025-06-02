# Appium Mobile Testing Framework

A comprehensive mobile application testing framework built with Appium and WebdriverIO for automating testing of Android applications.

## Overview

This project provides automated testing solutions for mobile applications, with specific implementations for WhatsApp and Disney+ Hotstar. The framework demonstrates mobile UI automation capabilities, element interaction, and test scenarios for educational purposes.

## Features

- **WhatsApp Automation**: Extract UI elements, interact with chats, search functionality
- **Hotstar Automation**: Navigate through the streaming app, handle login flows, and content browsing
- **Screenshots Capture**: Automated screenshots during test execution
- **Element Extraction**: Structured data extraction of UI elements
- **Cross-App Testing**: Framework design for testing multiple applications

## Prerequisites

- Node.js (v14 or higher)
- Appium Server (v2.x)
- Android SDK with platform-tools
- A connected Android device or emulator
- JDK 8 or higher

## Installation

1. Clone the repository:

   ```
   git clone [repository-url]
   cd appium-testing
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start Appium server (in a separate terminal):
   ```
   appium
   ```

## Usage

### Running WhatsApp Tests

```
node whatsapp.js
```

### Running Hotstar Tests

```
node hotstar.js
```

### Learning Mode

```
node learn.js
```

## Project Structure

- `whatsapp.js` - WhatsApp application test scenarios
- `hotstar.js` - Disney+ Hotstar application test scenarios
- `learn.js` - Educational examples for learning Appium
- `element_details.json` & `element_summary.json` - Extracted UI element data
- `screenshots/` - Directory containing test execution screenshots

## Configuration

Update the device capabilities in the script files to match your Android device:

```javascript
const capabilities = {
  platformName: "Android",
  platformVersion: "13", // Change to YOUR Android version
  deviceName: "Android Device", // Change to YOUR device name
  // Other capabilities...
};
```

## Legal Notice

This project is for educational purposes only. Using automation scripts with applications may violate their Terms of Service. Use responsibly and at your own risk.

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
