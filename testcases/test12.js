const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function test12() {
  console.log('Starting Test 12: Signout -> Redirects to login page');
  
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
    await driver.get('http://mood-tracker-web:3000/');
    await driver.wait(until.titleContains('Mood'), 5000);
    
    // Check if already logged in, if not, perform login
    const isLoggedIn = await driver.findElements(By.xpath("//*[contains(text(), 'Profile') or contains(text(), 'Analytics')]"));
    
    if (isLoggedIn.length === 0) {
      console.log('🔐 Not logged in, performing login first...');
      
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
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Profile')]")), 10000);
      console.log('   ✓ Login completed');
    } else {
      console.log('   ✓ Already logged in');
    }
    
    // Get current URL to verify we're in authenticated state
    const authenticatedUrl = await driver.getCurrentUrl();
    console.log(`📊 Authenticated URL: ${authenticatedUrl}`);    // Look for profile dropdown button to open user menu
    console.log('🔍 Looking for user profile dropdown...');
    
    // Find the profile dropdown button (has data-dropdown attribute)
    const profileDropdown = await driver.findElement(By.css('[data-dropdown] button'));
    console.log('   Found profile dropdown button, clicking to open menu...');
    await driver.executeScript("arguments[0].click();", profileDropdown);
    await driver.sleep(1000);
    
    // Now look for the "Sign out" button using the specific XPath
    console.log('🔍 Looking for "Sign out" button using specific XPath...');
    const signOutButton = await driver.findElement(By.xpath('/html/body/div/header/div/div[1]/div[2]/div/button[2]'));
      // Click the sign out button
    console.log('👆 Clicking "Sign out" button...');
    await driver.executeScript("arguments[0].click();", signOutButton);
      // Wait for logout and redirect to login page
    console.log('⏳ Waiting for logout and redirect...');
    
    // Wait for the page to show the AuthWrapper (login form)
    await driver.wait(async () => {
      try {
        // Look for the distinctive elements of the AuthWrapper/login page
        const authElements = await driver.findElements(By.xpath(
          "//*[contains(text(), 'Mood Tracker')] | " +
          "//*[contains(text(), 'Your personal companion for emotional wellness')] | " +
          "//input[@id='email'] | " +
          "//input[@id='password'] | " +
          "//*[contains(text(), 'Sign In') or contains(text(), 'Sign Up')] | " +
          "//*[text()='💭']"
        ));
        
        // Also check that authenticated content is gone
        const authenticatedElements = await driver.findElements(By.xpath(
          "//button[contains(text(), 'My Moods')] | " +
          "//button[contains(text(), 'Analytics')] | " +
          "//button[contains(text(), 'Profile')] | " +
          "//*[@data-dropdown]"
        ));
        
        return authElements.length > 0 && authenticatedElements.length === 0;
      } catch (e) {
        return false;
      }
    }, 15000);
      // Verify we're on the login page
    console.log('✅ Verifying redirect to login page...');
    
    const finalUrl = await driver.getCurrentUrl();
    
    // Look for AuthWrapper elements (the login/register interface)
    const authWrapperElements = await driver.findElements(By.xpath(
      "//*[contains(text(), 'Mood Tracker')] | " +
      "//*[contains(text(), 'Your personal companion for emotional wellness')] | " +
      "//input[@id='email'] | " +
      "//input[@id='password'] | " +
      "//*[text()='💭']"
    ));
    
    // Check for absence of authenticated content
    const authenticatedContent = await driver.findElements(By.xpath(
      "//button[contains(text(), 'My Moods')] | " +
      "//button[contains(text(), 'Analytics')] | " +
      "//button[contains(text(), 'Profile')] | " +
      "//*[@data-dropdown]"
    ));
    
    if (authWrapperElements.length > 0 && authenticatedContent.length === 0) {
      console.log('✓ Test 12 Passed: Successfully signed out and redirected to login page');
      console.log(`   URL after logout: ${finalUrl}`);
      console.log(`   Found ${authWrapperElements.length} login page elements`);
      console.log(`   Authenticated content elements: ${authenticatedContent.length} (should be 0)`);
    } else {
      throw new Error(`Sign out did not redirect to login page properly. Auth elements: ${authWrapperElements.length}, Authenticated elements: ${authenticatedContent.length}`);
    }
      // Additional verification - try to access protected content to confirm logout
    console.log('🔒 Additional verification: Checking if actually logged out...');
    try {
      // Refresh the page to ensure we're not accessing cached content
      await driver.get('http://mood-tracker-web:3000/');
      await driver.sleep(2000);
      
      // Check if we still see the AuthWrapper (login page)
      const authCheck = await driver.findElements(By.xpath(
        "//*[contains(text(), 'Your personal companion for emotional wellness')] | " +
        "//input[@id='email']"
      ));
      const protectedCheck = await driver.findElements(By.xpath(
        "//button[contains(text(), 'My Moods')] | " +
        "//*[@data-dropdown]"
      ));
      
      if (authCheck.length > 0 && protectedCheck.length === 0) {
        console.log('   ✓ Confirmed: Cannot access protected content after logout');
      } else {
        console.log('   ⚠️  Warning: Still seems to have access to protected content');
      }
    } catch (e) {
      console.log('   ⚠️  Additional verification failed, but that\'s okay');
    }
    
    // Check for login form fields specifically
    try {
      const emailField = await driver.findElement(By.id('email'));
      const passwordField = await driver.findElement(By.id('password'));
      
      if (emailField && passwordField) {
        console.log('   ✓ Login form fields (email & password) are present and accessible');
      }
    } catch (e) {
      console.log('   ⚠️  Could not verify login form fields');
    }
    
  } catch (error) {
    console.log('✗ Test 12 Failed:', error.message);
    
    // Additional debugging
    try {
      const currentUrl = await driver.getCurrentUrl();
      const pageText = await driver.findElement(By.tagName('body')).getText();
      console.log(`   Current URL: ${currentUrl}`);
      console.log(`   Page content sample: "${pageText.substring(0, 200)}..."`);
      
      // Check what authentication-related elements are present
      const authElements = await driver.findElements(By.xpath("//*[contains(text(), 'Login') or contains(text(), 'Logout') or contains(text(), 'Profile')]"));
      console.log(`   Authentication-related elements found: ${authElements.length}`);
      
    } catch (e) {
      // Debugging failed
    }
    
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

test12();
