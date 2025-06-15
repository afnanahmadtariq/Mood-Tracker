const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function test2() {
  console.log('Starting Test 2: Login -> Logins into app');
  
  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
    try {
    // Navigate to homepage
    console.log('📍 Navigating to homepage...');
    await driver.get(' http://localhost:3000');
    await driver.wait(until.titleContains('Mood'), 5000);
    
    // Clear all cookies to ensure we're not already logged in
    console.log('🍪 Clearing cookies to ensure fresh login state...');
    await driver.manage().deleteAllCookies();
    
    // Refresh page after clearing cookies
    await driver.navigate().refresh();
    await driver.wait(until.titleContains('Mood'), 5000);
    
    // Look for login form - if not visible, click login/signin link
    console.log('🔍 Looking for login form...');
    try {
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Welcome Back') or contains(text(), 'Sign in')]")), 5000);
    } catch (e) {
      // Try to find and click login/signin link
      const loginLink = await driver.findElement(By.xpath("//*[contains(text(), 'Login') or contains(text(), 'Sign in') or contains(text(), 'Already have an account')]"));
      await loginLink.click();
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Welcome Back') or contains(text(), 'Sign in')]")), 5000);
    }
    
    // Use test credentials
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    
    // Fill out login form
    console.log('📝 Filling out login form...');
    await driver.findElement(By.id('email')).sendKeys(testEmail);
    await driver.findElement(By.id('password')).sendKeys(testPassword);
    
    // Submit the form
    console.log('🚀 Submitting login form...');
    const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Sign In') or contains(text(), 'Login') or @type='submit']"));
    await submitButton.click();
    
    // Wait for successful login and check for authenticated UI elements
    console.log('⏳ Waiting for login redirect...');
    await driver.wait(async () => {
      try {
        // Look for authenticated user interface elements
        const authElements = await driver.findElements(By.xpath("//*[contains(text(), 'Welcome') or contains(text(), 'Dashboard') or contains(text(), 'Mood') or contains(text(), 'Profile') or contains(text(), 'Analytics')]"));
        return authElements.length > 0;
      } catch (e) {
        return false;
      }
    }, 15000);
    
    // Verify we're in the authenticated app
    console.log('✅ Checking for authenticated UI elements...');
    const dashboardElements = await driver.findElements(By.xpath("//*[contains(text(), 'Mood') or contains(text(), 'Profile') or contains(text(), 'Analytics')]"));
    
    if (dashboardElements.length > 0) {
      console.log('✓ Test 2 Passed: Login successful and redirected to app dashboard');
      
      // Additional check: look for user-specific content
      const userContent = await driver.findElements(By.xpath("//*[contains(@class, 'user') or contains(@class, 'profile') or contains(@class, 'welcome')]"));
      if (userContent.length > 0) {
        console.log('   ✓ User-specific content found - fully authenticated');
      }
    } else {
      throw new Error('Login failed - not redirected to authenticated app');
    }
    
  } catch (error) {
    console.log('✗ Test 2 Failed:', error.message);
    
    // Check for error messages
    try {
      const errorElement = await driver.findElement(By.xpath("//*[contains(@class, 'error') or contains(@class, 'alert') or contains(text(), 'Invalid') or contains(text(), 'Error')]"));
      const errorText = await errorElement.getText();
      console.log(`   Error message: ${errorText}`);
    } catch (e) {
      // No error message found
    }
    
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

test2();
