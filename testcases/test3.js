const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function test3() {
  console.log('Starting Test 3: Page Response Test');
  
  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  try {
    const startTime = Date.now();
    await driver.get('http://18.204.228.168:3300/');
    
    // Wait for body element to ensure page is loaded
    await driver.wait(until.elementLocated(By.tagName('body')), 10000);
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    console.log(`Page load time: ${loadTime}ms`);
    
    if (loadTime < 10000) {
      console.log('✓ Test 3 Passed: Page loaded within acceptable time');
    } else {
      console.log('✗ Test 3 Failed: Page load time too slow');
      process.exit(1);
    }
  } catch (error) {
    console.log('✗ Test 3 Failed:', error.message);
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

test3();
