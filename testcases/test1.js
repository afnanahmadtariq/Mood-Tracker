const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function test1() {
  console.log('Starting Test 1: Signup -> Redirects into app with same details as signed up');
  
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
    await driver.get('http://18.204.228.168:3300/');
    await driver.wait(until.titleContains('Mood'), 5000);
    
    // Look for register form or signup link
    console.log('🔍 Looking for signup form...');
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Join Mood Tracker') or contains(text(), 'Sign up') or contains(text(), 'Register')]")), 10000);
    
    // Generate unique test user data
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    const testFirstName = 'TestUser';
    const testLastName = 'Selenium';
    const testPassword = 'password123';
    
    // Fill out registration form
    console.log('📝 Filling out registration form...');
    await driver.findElement(By.id('firstName')).sendKeys(testFirstName);
    await driver.findElement(By.id('lastName')).sendKeys(testLastName);
    await driver.findElement(By.id('email')).sendKeys(testEmail);
    await driver.findElement(By.id('password')).sendKeys(testPassword);
    
    // Submit the form
    console.log('🚀 Submitting registration form...');
    const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Sign Up') or contains(text(), 'Register') or @type='submit']"));
    await submitButton.click();
    
    // Wait for redirect and check if we're logged in with the same details
    console.log('⏳ Waiting for redirect after signup...');
    await driver.wait(async () => {
      try {
        // Look for authenticated user interface elements
        const userElements = await driver.findElements(By.xpath(`//*[contains(text(), '${testFirstName}') or contains(text(), 'Welcome') or contains(text(), 'Dashboard') or contains(text(), 'Mood')]`));
        return userElements.length > 0;
      } catch (e) {
        return false;
      }
    }, 15000);
    
    // Verify user details are displayed correctly
    console.log('✅ Checking if user details match signup...');
    const userNameElement = await driver.findElement(By.xpath(`//*[contains(text(), '${testFirstName}')]`));
    const userNameText = await userNameElement.getText();
    
    if (userNameText.includes(testFirstName)) {
      console.log('✓ Test 1 Passed: Signup successful and redirected to app with correct user details');
      console.log(`   User displayed: ${userNameText}`);
    } else {
      throw new Error('User details do not match signup information');
    }
    
  } catch (error) {
    console.log('✗ Test 1 Failed:', error.message);
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

test1();
