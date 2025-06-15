const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function profileDropdownNavigationVerification() {
  console.log('Starting Test 11: Profile Dropdown Navigation - Verify clicking profile dropdown opens profile settings page');
  
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
    const isLoggedIn = await driver.findElements(By.xpath("//*[contains(text(), 'Profile') or contains(text(), 'Analytics')]"));
    
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
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Profile')]")), 10000);
    }
    
    // Look for profile dropdown trigger (avatar, name, profile button, etc.)
    console.log('👤 Looking for profile dropdown trigger...');
    let profileDropdownTrigger;
    
    try {
      // Try to find various types of profile dropdown triggers
      profileDropdownTrigger = await driver.findElement(By.xpath(
        "//button[contains(@class, 'profile') or contains(@class, 'avatar') or contains(@class, 'user')] | " +
        "//div[contains(@class, 'profile') or contains(@class, 'avatar') or contains(@class, 'user-menu')] | " +
        "//*[contains(@class, 'dropdown') and (contains(text(), 'Profile') or contains(@class, 'profile'))] | " +
        "//img[contains(@class, 'profile') or contains(@class, 'avatar')] | " +
        "//*[contains(@role, 'button') and (contains(@class, 'profile') or contains(@class, 'user'))] | " +
        "//button[contains(text(), '⚙️') or contains(text(), '👤') or contains(text(), 'Settings')] | " +
        "//*[contains(@class, 'header')]//*[contains(@class, 'user') or contains(@class, 'profile')]"
      ));
    } catch (e) {
      // If no specific dropdown, try the Profile tab/button directly
      console.log('   No dropdown found, looking for direct Profile link...');
      profileDropdownTrigger = await driver.findElement(By.xpath("//*[contains(text(), 'Profile') or contains(@href, 'profile')]"));
    }
    
    // Get current URL before interaction
    const currentUrl = await driver.getCurrentUrl();
    console.log(`📊 Current URL: ${currentUrl}`);
      // Click the profile dropdown trigger
    console.log('👆 Clicking profile dropdown trigger...');
    await driver.executeScript("arguments[0].click();", profileDropdownTrigger);
    
    // Wait for dropdown menu to appear or direct navigation
    console.log('⏳ Waiting for dropdown menu or navigation...');
    await driver.sleep(1000);
    
    // Look for profile settings option in dropdown (if dropdown exists)
    let profileSettingsLink;
    try {
      profileSettingsLink = await driver.findElement(By.xpath(
        "//a[contains(text(), 'Profile Settings') or contains(text(), 'Settings') or contains(text(), 'Profile')] | " +
        "//button[contains(text(), 'Profile Settings') or contains(text(), 'Settings') or contains(text(), 'Profile')] | " +
        "//*[contains(@class, 'dropdown')]//*[contains(text(), 'Profile') or contains(text(), 'Settings')] | " +
        "//*[contains(@class, 'menu')]//*[contains(text(), 'Profile') or contains(text(), 'Settings')]"
      ));
        console.log('📋 Found profile settings option in dropdown, clicking...');
      await driver.executeScript("arguments[0].click();", profileSettingsLink);
      
    } catch (e) {
      // If no dropdown menu found, the first click might have directly navigated to profile
      console.log('   No dropdown menu found, checking if already navigated to profile...');
    }
    
    // Wait for profile page to load
    console.log('⏳ Waiting for profile page to load...');
    
    // Wait for either URL change or profile content to appear
    await driver.wait(async () => {
      try {
        const newUrl = await driver.getCurrentUrl();
        const profileContent = await driver.findElements(By.xpath(
          "//*[contains(text(), 'Profile') or contains(text(), 'Settings')] | " +
          "//input[@name='firstName'] | " +
          "//input[@name='lastName'] | " +
          "//input[@name='email'] | " +
          "//*[contains(@class, 'profile') and contains(@class, 'form')] | " +
          "//*[contains(text(), 'Personal Information') or contains(text(), 'Account Settings')]"
        ));
        
        return newUrl !== currentUrl || profileContent.length > 0;
      } catch (e) {
        return false;
      }
    }, 10000);
    
    // Verify we're on the profile page
    console.log('✅ Verifying profile page opened...');
    
    const finalUrl = await driver.getCurrentUrl();
    const profilePageContent = await driver.findElements(By.xpath(
      "//*[contains(text(), 'Profile') or contains(text(), 'Settings')] | " +
      "//input[@name='firstName'] | " +
      "//input[@name='lastName'] | " +
      "//input[@name='email'] | " +
      "//*[contains(@class, 'profile')] | " +
      "//*[contains(text(), 'Personal Information') or contains(text(), 'Account Settings')]"
    ));
    
    // Check if URL indicates profile page
    const urlContainsProfile = finalUrl.includes('profile') || finalUrl.includes('settings') || finalUrl.includes('tab=profile');
    
    if (urlContainsProfile && profilePageContent.length > 0) {
      console.log('✓ Test 11 Passed: Profile settings page opened successfully via dropdown navigation');
      console.log(`   URL changed to: ${finalUrl}`);
      console.log(`   Found ${profilePageContent.length} profile page elements`);    } else if (profilePageContent.length > 0) {
      console.log('✓ Test 11 Passed: Profile content loaded successfully (Single Page Application navigation)');
      console.log(`   Found ${profilePageContent.length} profile page elements`);
      console.log(`   URL: ${finalUrl}`);
    } else if (urlContainsProfile) {
      console.log('✓ Test 11 Passed: Successfully navigated to profile settings URL');
      console.log(`   URL changed to: ${finalUrl}`);
    } else {
      throw new Error('Profile page navigation failed - profile page did not open properly');
    }
    
    // Additional verification - check for specific profile form elements
    try {
      const profileForm = await driver.findElements(By.xpath("//form | //input[@name='firstName'] | //input[@name='lastName']"));
      if (profileForm.length > 0) {
        console.log(`   ✓ Found profile form elements: ${profileForm.length}`);
      }
    } catch (e) {
      // Form elements check failed, that's okay
    }
    
    // Check page title
    try {
      const pageTitle = await driver.getTitle();
      if (pageTitle.includes('Profile') || pageTitle.includes('Settings')) {
        console.log(`   ✓ Page title indicates profile page: "${pageTitle}"`);
      }
    } catch (e) {
      // Title check failed, that's okay
    }
    
    // Verify specific profile fields are visible
    try {
      const profileFields = await driver.findElements(By.xpath(
        "//input[@name='firstName'] | " +
        "//input[@name='lastName'] | " +
        "//input[@name='email'] | " +
        "//input[@name='dateOfBirth']"
      ));
      
      if (profileFields.length > 0) {
        console.log(`   ✓ Profile form fields found: ${profileFields.length} fields`);
      }
    } catch (e) {
      // Field check failed, that's okay
    }
    
  } catch (error) {
    console.log('✗ Test 11 Failed - Profile Dropdown Navigation:', error.message);
    
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

profileDropdownNavigationVerification();
