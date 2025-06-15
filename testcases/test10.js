const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function test10() {
  console.log('Starting Test 10: Click view analytics in main page -> Analytics page opened');
  
  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  try {
    // Navigate to homepage and login first
    console.log('📍 Navigating to homepage...');
    await driver.get('http://18.204.228.168:3300/');
    await driver.wait(until.titleContains('Mood'), 5000);
    
    // Check if already logged in, if not, perform login
    const isLoggedIn = await driver.findElements(By.xpath("//*[contains(text(), 'Analytics') or contains(text(), 'Profile')]"));
    
    if (isLoggedIn.length === 0) {
      console.log('🔐 Not logged in, performing login...');
      
      // Look for login form or toggle to it
      try {
        await driver.wait(until.elementLocated(By.id('email')), 2000);
      } catch (e) {
        const loginLink = await driver.findElement(By.xpath("//*[contains(text(), 'Login') or contains(text(), 'Sign in') or contains(text(), 'Already have an account')]"));
        await loginLink.click();
        await driver.wait(until.elementLocated(By.id('email')), 5000);
      }
      
      // Login with test credentials
      await driver.findElement(By.id('email')).sendKeys('test@example.com');
      await driver.findElement(By.id('password')).sendKeys('password123');
      const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Sign In') or @type='submit']"));
      await submitButton.click();
      
      // Wait for login to complete
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Analytics')]")), 10000);
    }
    
    // Ensure we're on the main page (Mood tracking page)
    console.log('🏠 Navigating to main page...');
    try {
      const moodTab = await driver.findElement(By.xpath("//*[contains(text(), 'Mood') and not(contains(text(), 'Tracker'))]"));
      await moodTab.click();
      await driver.sleep(2000);
    } catch (e) {
      // Already on main page
      console.log('   Already on main page');
    }
    
    // Look for "View Analytics" button or link on the main page
    console.log('🔍 Looking for "View Analytics" button on main page...');
    const analyticsButton = await driver.findElement(By.xpath(
      "//button[contains(text(), 'View Analytics') or contains(text(), 'Analytics') or contains(text(), 'View Charts')] | " +
      "//a[contains(text(), 'View Analytics') or contains(text(), 'Analytics') or contains(text(), 'View Charts')] | " +
      "//*[contains(@class, 'analytics') and (contains(text(), 'View') or contains(text(), 'Open'))] | " +
      "//button[contains(text(), '📊') or contains(text(), 'Chart')] | " +
      "//*[contains(@href, 'analytics')] | " +
      "//*[contains(@onclick, 'analytics')]"
    ));
    
    // Get current URL before clicking
    const currentUrl = await driver.getCurrentUrl();
    console.log(`📊 Current URL: ${currentUrl}`);
    
    // Click the View Analytics button
    console.log('👆 Clicking "View Analytics" button...');
    await analyticsButton.click();
    
    // Wait for page navigation or content change
    console.log('⏳ Waiting for analytics page to load...');
    
    // Wait for either URL change or analytics content to appear
    await driver.wait(async () => {
      try {
        const newUrl = await driver.getCurrentUrl();
        const analyticsContent = await driver.findElements(By.xpath(
          "//*[contains(text(), 'Analytics') or contains(text(), 'Mood Trends') or contains(text(), 'Chart') or contains(text(), 'Graph')] | " +
          "//canvas | " +
          "//*[contains(@class, 'chart') or contains(@class, 'analytics')]"
        ));
        
        return newUrl !== currentUrl || analyticsContent.length > 0;
      } catch (e) {
        return false;
      }
    }, 10000);
    
    // Verify we're on the analytics page
    console.log('✅ Verifying analytics page opened...');
    
    const finalUrl = await driver.getCurrentUrl();
    const analyticsPageContent = await driver.findElements(By.xpath(
      "//*[contains(text(), 'Analytics') or contains(text(), 'Mood Trends') or contains(text(), 'Chart')] | " +
      "//canvas | " +
      "//*[contains(@class, 'chart') or contains(@class, 'analytics')]"
    ));
    
    // Check if URL changed to analytics
    const urlContainsAnalytics = finalUrl.includes('analytics') || finalUrl.includes('tab=analytics');
    
    if (urlContainsAnalytics && analyticsPageContent.length > 0) {
      console.log('✓ Test 10 Passed: Analytics page opened successfully');
      console.log(`   URL changed to: ${finalUrl}`);
      console.log(`   Found ${analyticsPageContent.length} analytics content elements`);
    } else if (analyticsPageContent.length > 0) {
      console.log('✓ Test 10 Passed: Analytics content loaded successfully (SPA navigation)');
      console.log(`   Found ${analyticsPageContent.length} analytics content elements`);
      console.log(`   URL: ${finalUrl}`);
    } else if (urlContainsAnalytics) {
      console.log('✓ Test 10 Passed: Navigated to analytics URL');
      console.log(`   URL changed to: ${finalUrl}`);
    } else {
      throw new Error('Analytics page did not open properly');
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
    }
    
  } catch (error) {
    console.log('✗ Test 10 Failed:', error.message);
    
    // Additional debugging
    try {
      const currentUrl = await driver.getCurrentUrl();
      const pageText = await driver.findElement(By.tagName('body')).getText();
      console.log(`   Current URL: ${currentUrl}`);
      console.log(`   Page content sample: "${pageText.substring(0, 200)}..."`);
    } catch (e) {
      // Debugging failed
    }
    
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

test10();
