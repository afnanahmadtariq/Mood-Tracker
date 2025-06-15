const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function test4() {
  console.log('Starting Test 4: Navigate to analytics -> Nothing showing');

  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {    // Navigate to homepage and login first
    console.log('📍 Navigating to homepage...');
    await driver.get(' http://18.204.228.168:3300/');
    await driver.wait(until.titleContains('Mood'), 5000);

    // Check if already logged in, if not, perform login
    const isLoggedIn = await driver.findElements(By.xpath("//*[contains(text(), 'Analytics') or contains(text(), 'Profile')]"));
    if (isLoggedIn.length === 0) {
      console.log('🔐 Not logged in, performing login...');
      try {
        await driver.wait(until.elementLocated(By.id('email')), 2000);
      } catch (e) {
        const loginLink = await driver.findElement(By.xpath("//*[contains(text(), 'Login') or contains(text(), 'Sign in') or contains(text(), 'Already have an account')]"));
        await loginLink.click();
        await driver.wait(until.elementLocated(By.id('email')), 5000);
      }
      await driver.findElement(By.id('email')).sendKeys('test@example.com');
      await driver.findElement(By.id('password')).sendKeys('password123');
      const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Sign In') or @type='submit']"));
      await submitButton.click();
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Analytics')]")), 10000);    }

    // Navigate to Analytics page
    console.log('📊 Navigating to Analytics page...');
    const analyticsButton = await driver.findElement(By.xpath(
      "//button[contains(., 'Analytics')] | " +
      "//button[.//span[contains(text(), 'Analytics')]] | " +
      "//button[contains(text(), '📊')] | " +
      "//*[contains(@class, 'md:flex')]//*[contains(text(), 'Analytics')]"
    ));
    await driver.executeScript("arguments[0].click();", analyticsButton);
    console.log('⏳ Waiting for analytics page to load...');
    await driver.sleep(2000);

    // Check for empty state (no moods added yet)
    console.log('🔍 Checking for empty analytics state...');
    const emptyState = await driver.findElements(By.xpath(
      "//*[contains(text(), 'No data') or contains(text(), 'no moods') or contains(text(), 'not enough data') or contains(text(), 'Add a mood') or contains(text(), 'Track your first mood') or contains(text(), 'Start tracking')] | " +
      "//*[contains(@class, 'empty') or contains(@class, 'no-data')]"
    ));
    
    // Also check if there are no charts/graphs displayed
    const charts = await driver.findElements(By.xpath("//canvas | //*[contains(@class, 'chart')]"));
    
    if (emptyState.length > 0 || charts.length === 0) {
      console.log('✓ Test 4 Passed: Analytics page shows empty state (no data)');
      if (emptyState.length > 0) {
        console.log(`   Found ${emptyState.length} empty state element(s)`);
      }
      if (charts.length === 0) {
        console.log('   No charts/graphs displayed (expected for empty state)');
      }
    } else {
      throw new Error('Analytics page did not show empty state as expected');
    }
  } catch (error) {
    console.log('✗ Test 4 Failed:', error.message);
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

test4();
