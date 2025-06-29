const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function userSignupAndRedirection() {
  console.log('Starting Test 1: User Registration - Verify successful signup redirects to application with correct user details');
    const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1920,1080');
  options.addArguments('--disable-web-security');
  options.addArguments('--disable-features=VizDisplayCompositor');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  try {    // Navigate to homepage
    console.log('🏠 Navigating to application homepage...');
    await driver.get('http://mood-tracker-web:3000/');
    
    // Wait for page to load with more specific checks
    console.log('⏳ Waiting for page to load completely...');
    try {
      await driver.wait(until.titleContains('Mood'), 10000);
      console.log('✓ Page title loaded successfully');
    } catch (e) {
      console.log('⚠️ Page title check failed, continuing with test execution:', e.message);
    }
    
    // Check if page loaded by looking for any content
    await driver.wait(async () => {
      const body = await driver.findElement(By.tagName('body'));
      const text = await body.getText();
      return text.length > 0;
    }, 10000);    console.log('✓ Page content loaded successfully');
      // First, verify we're on the login page
    console.log('🔍 Verifying current page is the login interface...');
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Welcome Back')]")), 10000);
    console.log('✓ Confirmed user is on the login page');
    
    // Look for and click the "Create your account" button to navigate to signup
    console.log('🔍 Locating user registration navigation button...');
    const signupButton = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Create your account')]")), 
      10000
    );
    console.log('✓ Found "Create your account" button');
    
    await signupButton.click();
    console.log('🔄 Successfully clicked signup button, navigating to registration form...');
      // Wait for the registration form to load
    console.log('⏳ Waiting for user registration form to load...');
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Join Mood Tracker')]")), 10000);
    console.log('✓ User registration form loaded successfully');
    

    const testEmail = `test@example.com`;
    const testFirstName = 'TestUser';
    const testLastName = 'Selenium';
    const testPassword = 'password123';      // Fill out registration form
    console.log('📝 Completing user registration form with test data...');
    try {
      console.log(`   Entering first name: ${testFirstName}`);
      await driver.wait(until.elementLocated(By.id('firstName')), 5000);
      await driver.findElement(By.id('firstName')).sendKeys(testFirstName);
      
      console.log(`   Entering last name: ${testLastName}`);
      await driver.wait(until.elementLocated(By.id('lastName')), 5000);
      await driver.findElement(By.id('lastName')).sendKeys(testLastName);
      
      console.log(`   Entering email address: ${testEmail}`);
      await driver.wait(until.elementLocated(By.id('email')), 5000);
      await driver.findElement(By.id('email')).sendKeys(testEmail);
        console.log(`   Entering password: ${'*'.repeat(testPassword.length)}`);
      await driver.wait(until.elementLocated(By.id('password')), 5000);
      await driver.findElement(By.id('password')).sendKeys(testPassword);
      
      console.log('✓ All registration form fields completed successfully');    } catch (e) {
      console.log('✗ Error completing registration form fields:', e.message);
      throw new Error(`Failed to complete registration form: ${e.message}`);
    }
    
    // Submit the form
    console.log('🚀 Submitting user registration form...');
    try {
      const submitSelectors = [
        "//button[contains(text(), 'Create Account')]",
        "//button[contains(text(), 'Sign Up')]",
        "//button[contains(text(), 'Register')]",
        "//button[@type='submit']"
      ];
      
      let submitButton = null;
      for (const selector of submitSelectors) {
        try {
          submitButton = await driver.findElement(By.xpath(selector));
          console.log(`✓ Found submit button with selector: ${selector}`);
          break;
        } catch (e) {
          continue;
        }
      }
        if (!submitButton) {
        throw new Error('Could not locate submit button for registration form');
      }
      
      await submitButton.click();
      console.log('✓ Registration form submit button clicked successfully');
      
      // Wait a moment for the form submission to process
      await driver.sleep(2000);
      
    } catch (e) {
      console.log('✗ Error submitting registration form:', e.message);
      throw new Error(`Failed to submit registration form: ${e.message}`);
    }
      // Wait for redirect and check if we're logged in with the same details
    console.log('⏳ Waiting for post-registration redirect...');
      // First, wait for the URL to change (indicating successful auth)
    await driver.wait(async () => {
      const currentUrl = await driver.getCurrentUrl();
      console.log(`   Current URL: ${currentUrl}`);
      // URL should still be the same since it's a SPA, but we should see auth state change
      return true;
    }, 2000);
    
    // Wait for loading state to complete and auth components to disappear
    console.log('⏳ Waiting for authentication to complete...');
    await driver.wait(async () => {
      try {
        // Check if login/register forms are gone (indicating successful auth)
        const authForms = await driver.findElements(By.xpath("//*[contains(text(), 'Join Mood Tracker') or contains(text(), 'Sign Up') or contains(text(), 'Login')]"));
        return authForms.length === 0;
      } catch (e) {
        return false;
      }
    }, 20000);
      // Wait for the main app interface to load
    console.log('⏳ Waiting for main application interface to load...');
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Mood Tracker') and not(contains(text(), 'Join'))]")), 15000);
    
    // Wait specifically for the header with user information
    console.log('⏳ Waiting for authenticated user header to appear...');
    await driver.wait(async () => {
      try {
        // Look for header elements that indicate authenticated state
        const headerElements = await driver.findElements(By.xpath("//header | //*[contains(@class, 'header')] | //*[contains(text(), 'My Moods') or contains(text(), 'Profile') or contains(text(), 'Analytics')]"));
        return headerElements.length > 0;
      } catch (e) {
        return false;
      }
    }, 15000);
    
    // Now try to find the user's name in the interface
    console.log('✅ Verifying user details match registration information...');
    
    // Try multiple selectors to find the user's name
    let userNameElement = null;
    let userNameText = '';
    
    try {
      // Try to find user name in various possible locations
      const selectors = [
        `//header//*[contains(text(), '${testFirstName}')]`,
        `//*[@class='hidden lg:block text-left']//*[contains(text(), '${testFirstName}')]`,
        `//*[contains(text(), '${testFirstName} ${testLastName}')]`,
        `//*[contains(text(), '${testFirstName}')]`
      ];
      
      for (const selector of selectors) {
        try {
          await driver.wait(until.elementLocated(By.xpath(selector)), 5000);
          userNameElement = await driver.findElement(By.xpath(selector));
          userNameText = await userNameElement.getText();          console.log(`   Found user name using selector: ${selector}`);
          console.log(`   User text found: ${userNameText}`);
          break;
        } catch (e) {
          console.log(`   Selector failed: ${selector} - ${e.message}`);
          continue;
        }
      }
        if (!userNameElement) {
        // As a fallback, let's check if we can access the profile section
        console.log('🔍 Attempting to access profile section to verify user details...');
        const profileButtons = await driver.findElements(By.xpath("//*[contains(text(), 'Profile') or contains(text(), 'profile')]"));
        if (profileButtons.length > 0) {
          await profileButtons[0].click();
          await driver.sleep(2000);
          
          // Try to find user details in profile section
          const profileSelectors = [
            `//input[@value='${testFirstName}']`,
            `//*[contains(text(), '${testFirstName}')]`,
            `//input[@id='firstName']`
          ];
          
          for (const selector of profileSelectors) {
            try {
              const element = await driver.findElement(By.xpath(selector));
              const value = await element.getAttribute('value') || await element.getText();
              if (value.includes(testFirstName)) {
                userNameText = value;
                console.log(`Found user details in profile: ${value}`);
                break;
              }
            } catch (e) {
              continue;
            }
          }
        }
      }
    } catch (e) {
      console.log(`Error finding user details: ${e.message}`);
    }
    
    if (userNameText && userNameText.includes(testFirstName)) {
      console.log('✓ Test 1 Passed: Signup successful and redirected to app with correct user details');
      console.log(`   User displayed: ${userNameText}`);
    } else {
      // Take a screenshot for debugging
      try {
        const screenshot = await driver.takeScreenshot();
        console.log('📸 Screenshot taken for debugging');
      } catch (e) {
        console.log('Could not take screenshot');
      }
      
      // Get page source for debugging
      try {
        const pageSource = await driver.getPageSource();
        console.log('Page source length:', pageSource.length);
        // Check if we can find the first name anywhere in the page
        if (pageSource.includes(testFirstName)) {
          console.log('✓ Test 1 Passed: User name found in page source, authentication successful');
          console.log(`   First name "${testFirstName}" found in page content`);
        } else {
          throw new Error(`User details not found. Expected to find "${testFirstName}" but it was not present in the page.`);
        }
      } catch (e) {
        throw new Error(`User details not found and could not verify through page source: ${e.message}`);
      }
    }
      } catch (error) {
    console.log('✗ Test 1 Failed - User Registration and Redirection:', error.message);
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

userSignupAndRedirection();
