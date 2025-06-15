const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function test5() {
  console.log('Starting Test 5: Navigate to analytics -> Now showing charts and graphs');
  
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
    
    // Navigate to Analytics page
    console.log('📊 Navigating to Analytics page...');
    const analyticsLink = await driver.findElement(By.xpath("//*[contains(text(), 'Analytics') or contains(@href, 'analytics')]"));
    await analyticsLink.click();
    
    // Wait for analytics page to load
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Analytics') or contains(text(), 'Mood Trends')]")), 10000);
    
    // Check for charts and graphs (now that we have mood data from test4)
    console.log('🔍 Checking for charts and graphs...');
    
    // Look for chart elements (canvas elements used by Chart.js)
    const chartElements = await driver.findElements(By.tagName('canvas'));
    console.log(`   Found ${chartElements.length} canvas elements (charts)`);
    
    // Look for chart containers and related elements
    const chartContainers = await driver.findElements(By.xpath("//*[contains(@class, 'chart') or contains(@class, 'graph')]"));
    console.log(`   Found ${chartContainers.length} chart container elements`);
    
    // Look for analytics-specific content
    const analyticsContent = await driver.findElements(By.xpath(
      "//*[contains(text(), 'Mood Trends') or " +
      "contains(text(), 'Analytics') or " +
      "contains(text(), 'Chart') or " +
      "contains(text(), 'Graph') or " +
      "contains(text(), 'Distribution') or " +
      "contains(text(), 'Frequency')]"
    ));
    console.log(`   Found ${analyticsContent.length} analytics content elements`);
    
    // Check for data visualization indicators
    const dataVizElements = await driver.findElements(By.xpath(
      "//*[contains(@class, 'recharts') or " +
      "contains(@class, 'chartjs') or " +
      "contains(@class, 'viz') or " +
      "contains(@class, 'data')]"
    ));
    console.log(`   Found ${dataVizElements.length} data visualization elements`);
    
    // Get page text to check for analytics-related content
    const pageText = await driver.findElement(By.tagName('body')).getText();
    const hasAnalyticsTerms = pageText.includes('trend') || 
                             pageText.includes('chart') || 
                             pageText.includes('graph') || 
                             pageText.includes('analytics') ||
                             pageText.includes('distribution');
    
    // Verify that charts and graphs are now showing
    if (chartElements.length > 0 || chartContainers.length > 0 || (analyticsContent.length > 0 && hasAnalyticsTerms)) {
      console.log('✓ Test 5 Passed: Analytics page now shows charts and graphs');
      
      if (chartElements.length > 0) {
        console.log(`   ✓ Found ${chartElements.length} chart canvas element(s)`);
      }
      
      if (analyticsContent.length > 0) {
        console.log(`   ✓ Found analytics content sections`);
        // Try to get text from first analytics element
        try {
          const firstAnalyticsText = await analyticsContent[0].getText();
          console.log(`   Sample analytics content: "${firstAnalyticsText.substring(0, 100)}..."`);
        } catch (e) {
          // Content might be in canvas or other element
        }
      }
      
      // Check if the page indicates data is available
      if (pageText.includes('No data') || pageText.includes('empty')) {
        console.log('   ⚠️  Note: Page still shows some "no data" indicators, but chart elements are present');
      }
      
    } else {
      // Check if it's an empty state with helpful message
      const emptyStateElements = await driver.findElements(By.xpath(
        "//*[contains(text(), 'No data') or " +
        "contains(text(), 'Add some moods') or " +
        "contains(text(), 'Start tracking')]"
      ));
      
      if (emptyStateElements.length > 0) {
        const emptyMessage = await emptyStateElements[0].getText();
        throw new Error(`Analytics still shows empty state: "${emptyMessage}". Mood data may not have been saved properly.`);
      } else {
        throw new Error('Analytics page does not show charts, graphs, or expected content');
      }
    }
    
  } catch (error) {
    console.log('✗ Test 5 Failed:', error.message);
    
    // Additional debugging - check what's actually on the page
    try {
      const pageText = await driver.findElement(By.tagName('body')).getText();
      console.log(`   Page content sample: "${pageText.substring(0, 200)}..."`);
    } catch (e) {
      // Unable to get page content
    }
    
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

test5();
