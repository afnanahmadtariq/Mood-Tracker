const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function analyticsDataVisualizationVerification() {
  console.log('Starting Test 6: Analytics Data Visualization - Verify analytics page displays charts and graphs when data is available');
  
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
      
      // Look for login form or toggle to it
      try {
        await driver.wait(until.elementLocated(By.id('email')), 2000);
      } catch (e) {        const loginLink = await driver.findElement(By.xpath("//*[contains(text(), 'Login') or contains(text(), 'Sign in') or contains(text(), 'Already have an account')]"));
        await driver.executeScript("arguments[0].click();", loginLink);
        await driver.wait(until.elementLocated(By.id('email')), 5000);
      }
      
      // Login with test credentials
      await driver.findElement(By.id('email')).sendKeys('test@example.com');
      await driver.findElement(By.id('password')).sendKeys('password123');      const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Sign In') or @type='submit']"));
      await driver.executeScript("arguments[0].click();", submitButton);
      
      // Wait for login to complete
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Analytics')]")), 10000);
    }

    // Navigate to Analytics page    // Navigate to Analytics page
    console.log('📊 Navigating to Analytics page...');
    const analyticsButton = await driver.findElement(By.xpath(
      "//button[contains(text(), 'View Analytics') or contains(text(), 'Analytics') or contains(text(), 'View Charts')] | " +
      "//a[contains(text(), 'View Analytics') or contains(text(), 'Analytics') or contains(text(), 'View Charts')] | " +
      "//*[contains(@class, 'analytics') and (contains(text(), 'View') or contains(text(), 'Open'))] | " +
      "//button[contains(text(), '📊') or contains(text(), 'Chart')] | " +
      "//*[contains(@href, 'analytics')] | " +
      "//*[contains(@onclick, 'analytics')]"
    ));
      // Click the Analytics button
    await driver.executeScript("arguments[0].click();", analyticsButton);
    
    // Wait for analytics page to load
    console.log('⏳ Waiting for analytics page content to load...');
    await driver.sleep(2000);    // Check for charts/graphs (should exist if moods have been added in previous tests)
    console.log('📈 Verifying presence of charts and data visualizations...');
    const charts = await driver.findElements(By.xpath(
      "//canvas | " +
      "//*[contains(@class, 'chart') or contains(@class, 'analytics') or contains(@class, 'recharts') or contains(@class, 'chartjs')] | " +
      "//*[contains(text(), 'Chart') or contains(text(), 'Graph') or contains(text(), 'Mood Trends')]"
    ));
    
    if (charts.length > 0) {
      console.log('✓ Test 6 Passed: Analytics page successfully displays charts and data visualization elements');
      console.log(`   Found ${charts.length} chart and graph elements on the page`);
    } else {
      throw new Error('Analytics page visualization failed - no charts or graphs found. Ensure mood data exists from previous test execution.');
    }    
  } catch (error) {
    console.log('✗ Test 6 Failed - Analytics Data Visualization:', error.message);
    
    // Additional debugging information
    try {
      const currentUrl = await driver.getCurrentUrl();
      const pageText = await driver.findElement(By.tagName('body')).getText();
      console.log(`   Current application URL: ${currentUrl}`);
      console.log(`   Page content sample: "${pageText.substring(0, 200)}..."`);
    } catch (e) {
      // Debug information retrieval failed
    }
    
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

analyticsDataVisualizationVerification();
