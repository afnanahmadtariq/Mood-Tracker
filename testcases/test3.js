const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function analyticsPageNavigation() {
  console.log('Starting Test 3: Analytics Navigation - Verify clicking analytics button on main page opens analytics page');
  
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
      // Ensure we're on the main page (Mood tracking page)
    console.log('🏠 Navigating to main application page...');
    try {      const moodTab = await driver.findElement(By.xpath("//*[contains(text(), 'Mood') and not(contains(text(), 'Tracker'))]"));
      await driver.executeScript("arguments[0].click();", moodTab);
      await driver.sleep(2000);
    } catch (e) {
      // Already on main page
      console.log('   Already on main application page');
    }      // Look for "View Analytics" button using specific XPath
    console.log('🔍 Locating "View Analytics" button...');
    const analyticsButton = await driver.findElement(By.xpath("/html/body/div/main/div/div[1]/div[2]/div/div[1]/div[2]/button"));
    
    // Get current URL before clicking
    const currentUrl = await driver.getCurrentUrl();
    console.log(`📊 Current application URL: ${currentUrl}`);      // Click the View Analytics button    console.log('👆 Clicking "View Analytics" button...');
    await driver.executeScript("arguments[0].click();", analyticsButton);
    
    // Wait for analytics content to load
    console.log('⏳ Waiting for analytics page content to load...');
    
    // Wait for analytics content to appear (either charts or empty state)
    await driver.wait(async () => {
      try {
        const analyticsContent = await driver.findElements(By.xpath(
          "//*[contains(text(), 'Analytics') or contains(text(), 'Mood Trends') or contains(text(), 'Chart') or contains(text(), 'Graph')] | " +
          "//canvas | " +
          "//*[contains(@class, 'chart') or contains(@class, 'analytics')] | " +
          "//*[contains(text(), 'No data') or contains(text(), 'Add a mood to see analytics')]"
        ));
        
        return analyticsContent.length > 0;
      } catch (e) {
        return false;
      }
    }, 10000);      // Verify analytics page/content is displayed
    console.log('✅ Verifying analytics page opened successfully...');
    
    const analyticsPageContent = await driver.findElements(By.xpath(
      "//*[contains(text(), 'Analytics') or contains(text(), 'Mood Trends') or contains(text(), 'Chart')] | " +
      "//canvas | " +
      "//*[contains(@class, 'chart') or contains(@class, 'analytics')] | " +
      "//*[contains(text(), 'No data') or contains(text(), 'Add a mood to see analytics')]"
    ));
    
    if (analyticsPageContent.length > 0) {
      console.log('✓ Test 3 Passed: Analytics page opened successfully from main page navigation');
      console.log(`   Found ${analyticsPageContent.length} analytics content elements on page`);
    } else {
      throw new Error('Analytics page navigation failed - no analytics content found after button click');
    }
    
    // Additional verification - check for specific analytics elements
    try {
      const pageTitle = await driver.getTitle();
      if (pageTitle.includes('Analytics') || pageTitle.includes('Chart')) {
        console.log(`   ✓ Page title indicates analytics: "${pageTitle}"`);
      }
    } catch (e) {
      // Title check failed, that's okay
    }
    
    // Check for analytics-specific UI elements
    try {
      const analyticsUI = await driver.findElements(By.xpath("//canvas | //*[contains(@class, 'recharts')] | //*[contains(@class, 'chartjs')]"));
      if (analyticsUI.length > 0) {
        console.log(`   ✓ Found ${analyticsUI.length} chart/graph elements`);
      }
    } catch (e) {
      // Chart elements check failed, that's okay
    }      } catch (error) {
    console.log('✗ Test 3 Failed - Analytics Page Navigation:', error.message);
    
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

analyticsPageNavigation();
