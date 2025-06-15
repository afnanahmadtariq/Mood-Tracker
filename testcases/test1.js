const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function test1() {
  console.log('Starting Test 1: Homepage Load Test');
  
  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  try {
    await driver.get('http://18.204.228.168:3300/');
    await driver.wait(until.titleContains('Mood'), 5000);
    console.log('✓ Test 1 Passed: Homepage loaded successfully');
  } catch (error) {
    console.log('✗ Test 1 Failed:', error.message);
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

test1();
