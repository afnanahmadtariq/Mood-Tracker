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
    await driver.get(' http://localhost:3000');
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
    console.log(`📊 Authenticated URL: ${authenticatedUrl}`);
    
    // Look for sign out button or menu
    console.log('🔍 Looking for sign out option...');
    let signOutButton;
    
    try {
      // First try to find direct sign out button
      signOutButton = await driver.findElement(By.xpath(
        "//button[contains(text(), 'Sign Out') or contains(text(), 'Logout') or contains(text(), 'Log Out')] | " +
        "//a[contains(text(), 'Sign Out') or contains(text(), 'Logout') or contains(text(), 'Log Out')] | " +
        "//*[contains(@class, 'logout') or contains(@class, 'signout')] | " +
        "//button[contains(text(), '🚪') or contains(text(), 'Exit')]"
      ));
    } catch (e) {
      // If no direct sign out button, look for profile dropdown or menu
      console.log('   No direct sign out button, looking for profile menu...');
      
      try {
        const profileDropdown = await driver.findElement(By.xpath(
          "//button[contains(@class, 'profile') or contains(@class, 'avatar') or contains(@class, 'user')] | " +
          "//div[contains(@class, 'profile') or contains(@class, 'avatar') or contains(@class, 'user-menu')] | " +
          "//*[contains(@class, 'dropdown')] | " +
          "//button[contains(text(), '⚙️') or contains(text(), '👤')] | " +
          "//*[contains(@class, 'header')]//*[contains(@class, 'user')]"
        ));
          console.log('   Found profile menu, clicking to open...');
        await driver.executeScript("arguments[0].click();", profileDropdown);
        await driver.sleep(1000);
        
        // Now look for sign out option in the dropdown
        signOutButton = await driver.findElement(By.xpath(
          "//a[contains(text(), 'Sign Out') or contains(text(), 'Logout') or contains(text(), 'Log Out')] | " +
          "//button[contains(text(), 'Sign Out') or contains(text(), 'Logout') or contains(text(), 'Log Out')] | " +
          "//*[contains(@class, 'dropdown')]//*[contains(text(), 'Sign Out') or contains(text(), 'Logout')] | " +
          "//*[contains(@class, 'menu')]//*[contains(text(), 'Sign Out') or contains(text(), 'Logout')]"
        ));
        
      } catch (e2) {
        throw new Error('Could not find sign out option in profile menu or direct button');
      }
    }
    
    // Click the sign out button    console.log('👆 Clicking sign out...');
    await driver.executeScript("arguments[0].click();", signOutButton);
    
    // Wait for logout and redirect to login page
    console.log('⏳ Waiting for logout and redirect...');
    
    // Wait for either URL change or login form to appear
    await driver.wait(async () => {
      try {
        const currentUrl = await driver.getCurrentUrl();
        const loginElements = await driver.findElements(By.xpath(
          "//*[contains(text(), 'Sign in') or contains(text(), 'Login') or contains(text(), 'Welcome Back')] | " +
          "//input[@name='email'] | " +
          "//input[@type='email'] | " +
          "//*[contains(@class, 'login') or contains(@class, 'signin')] | " +
          "//*[contains(text(), 'Email') and contains(text(), 'Password')]"
        ));
        
        // Check if we're no longer authenticated (URL changed or login form appeared)
        return currentUrl !== authenticatedUrl || loginElements.length > 0;
      } catch (e) {
        return false;
      }
    }, 15000);
    
    // Verify we're on the login page
    console.log('✅ Verifying redirect to login page...');
    
    const finalUrl = await driver.getCurrentUrl();
    const loginPageContent = await driver.findElements(By.xpath(
      "//*[contains(text(), 'Sign in') or contains(text(), 'Login') or contains(text(), 'Welcome Back')] | " +
      "//input[@name='email'] | " +
      "//input[@type='email'] | " +
      "//input[@name='password'] | " +
      "//*[contains(@class, 'login') or contains(@class, 'signin')]"
    ));
    
    // Check for absence of authenticated content
    const authenticatedContent = await driver.findElements(By.xpath(
      "//*[contains(text(), 'Profile') or contains(text(), 'Analytics') or contains(text(), 'Dashboard')] | " +
      "//*[contains(@class, 'authenticated') or contains(@class, 'dashboard')]"
    ));
    
    if (loginPageContent.length > 0 && authenticatedContent.length === 0) {
      console.log('✓ Test 12 Passed: Successfully signed out and redirected to login page');
      console.log(`   URL after logout: ${finalUrl}`);
      console.log(`   Found ${loginPageContent.length} login page elements`);
      console.log(`   Authenticated content elements: ${authenticatedContent.length} (should be 0)`);
    } else if (loginPageContent.length > 0) {
      console.log('✓ Test 12 Passed: Login form visible after sign out');
      console.log(`   Found ${loginPageContent.length} login page elements`);
      console.log(`   URL: ${finalUrl}`);
    } else {
      throw new Error('Sign out did not redirect to login page properly');
    }
    
    // Additional verification - try to access protected content to confirm logout
    console.log('🔒 Additional verification: Checking if actually logged out...');
    try {
      // Try to navigate to a protected page (if current URL doesn't indicate logout)
      if (!finalUrl.includes('login') && !finalUrl.includes('signin')) {
        await driver.get(' http://localhost:3000');
        await driver.sleep(2000);
        
        const protectedCheck = await driver.findElements(By.xpath("//*[contains(text(), 'Profile') or contains(text(), 'Analytics')]"));
        if (protectedCheck.length === 0) {
          console.log('   ✓ Confirmed: Cannot access protected content after logout');
        } else {
          console.log('   ⚠️  Warning: Still seems to have access to protected content');
        }
      }
    } catch (e) {
      // Additional verification failed, that's okay
    }
    
    // Check for login form fields specifically
    try {
      const emailField = await driver.findElement(By.xpath("//input[@name='email'] | //input[@type='email']"));
      const passwordField = await driver.findElement(By.xpath("//input[@name='password'] | //input[@type='password']"));
      
      if (emailField && passwordField) {
        console.log('   ✓ Login form fields (email & password) are present and accessible');
      }
    } catch (e) {
      // Login form fields check failed
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
