const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function emptyAnalyticsPageVerification() {
  console.log('Starting Test 4: Empty Analytics Verification - Verify analytics page displays empty state when no data available');

  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {    // Navigate to homepage and login first
    console.log('🏠 Navigating to application homepage...');
    await driver.get('http://mood-tracker-web:3000/');
    await driver.wait(until.titleContains('Mood'), 5000);

    // Check if already logged in, if not, perform login
    const isLoggedIn = await driver.findElements(By.xpath("//*[contains(text(), 'Analytics') or contains(text(), 'Profile')]"));
    if (isLoggedIn.length === 0) {
      console.log('🔐 User not authenticated, performing login...');
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
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Analytics')]")), 10000);    }    // Navigate to Analytics page
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

    // Check for empty state (no moods added yet)    console.log('🔍 Verifying analytics page displays empty state...');
    const emptyState = await driver.findElements(By.xpath(
      "//*[contains(text(), 'No data') or contains(text(), 'no moods') or contains(text(), 'not enough data') or contains(text(), 'Add a mood') or contains(text(), 'Track your first mood') or contains(text(), 'Start tracking')] | " +
      "//*[contains(@class, 'empty') or contains(@class, 'no-data')]"
    ));
    
    // Also check if there are no charts/graphs displayed
    const charts = await driver.findElements(By.xpath("//canvas | //*[contains(@class, 'chart')]"));
    
    if (emptyState.length > 0 || charts.length === 0) {
      console.log('✓ Test 4 Passed: Analytics page correctly displays empty state with no data available');
      if (emptyState.length > 0) {
        console.log(`   Found ${emptyState.length} empty state indicator element(s)`);
      }
      if (charts.length === 0) {
        console.log('   No charts or graphs displayed (expected behavior for empty state)');
      }
    } else {
      throw new Error('Analytics page did not display expected empty state - unexpected content found');
    }
  } catch (error) {
    console.log('✗ Test 4 Failed - Empty Analytics Page Verification:', error.message);
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

emptyAnalyticsPageVerification();
