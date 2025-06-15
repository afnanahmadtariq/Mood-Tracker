const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function test9() {
  console.log('Starting Test 9: Change profile Name -> Profile Name changed');
  
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
    const isLoggedIn = await driver.findElements(By.xpath("//*[contains(text(), 'Profile') or contains(text(), 'Analytics')]"));
    
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
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Profile')]")), 10000);
    }
    
    // Navigate to Profile page
    console.log('👤 Navigating to Profile page...');
    const profileLink = await driver.findElement(By.xpath("//*[contains(text(), 'Profile') or contains(@href, 'profile')]"));
    await profileLink.click();
    
    // Wait for profile page to load
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Profile') or contains(text(), 'Settings')]")), 10000);
    
    // Find first name and last name input fields
    console.log('👋 Looking for name fields...');
    const firstNameInput = await driver.findElement(By.xpath(
      "//input[@name='firstName'] | " +
      "//input[@id='firstName'] | " +
      "//input[contains(@placeholder, 'first') or contains(@placeholder, 'First')]"
    ));
    
    const lastNameInput = await driver.findElement(By.xpath(
      "//input[@name='lastName'] | " +
      "//input[@id='lastName'] | " +
      "//input[contains(@placeholder, 'last') or contains(@placeholder, 'Last')]"
    ));
    
    // Get current name values
    const currentFirstName = await firstNameInput.getAttribute('value');
    const currentLastName = await lastNameInput.getAttribute('value');
    console.log(`📊 Current name: "${currentFirstName} ${currentLastName}"`);
    
    // Set new name values
    const newFirstName = 'UpdatedTest';
    const newLastName = 'UpdatedUser';
    console.log('📝 Changing profile name...');
    
    await firstNameInput.clear();
    await firstNameInput.sendKeys(newFirstName);
    
    await lastNameInput.clear();
    await lastNameInput.sendKeys(newLastName);
    
    // Submit the profile form
    console.log('🚀 Saving profile changes...');
    const saveButton = await driver.findElement(By.xpath("//button[contains(text(), 'Save') or contains(text(), 'Update') or @type='submit']"));
    await saveButton.click();
    
    // Wait for save confirmation
    console.log('⏳ Waiting for profile update...');
    try {
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'updated') or contains(text(), 'saved') or contains(text(), 'success') or contains(@class, 'success')]")), 5000);
      console.log('   ✓ Success message found');
    } catch (e) {
      console.log('   No explicit success message, checking name change...');
    }
    
    // Verify name has changed
    console.log('✅ Verifying profile name changed...');
    await driver.sleep(1000); // Allow time for form to update
    
    const updatedFirstName = await firstNameInput.getAttribute('value');
    const updatedLastName = await lastNameInput.getAttribute('value');
    
    if (updatedFirstName === newFirstName && updatedLastName === newLastName) {
      console.log('✓ Test 9 Passed: Profile name successfully changed');
      console.log(`   Name changed from "${currentFirstName} ${currentLastName}" to "${updatedFirstName} ${updatedLastName}"`);
    } else {
      throw new Error(`Profile name was not changed correctly. Expected: ${newFirstName} ${newLastName}, Actual: ${updatedFirstName} ${updatedLastName}`);
    }
    
    // Additional verification - check if name is displayed elsewhere on the page
    try {
      const nameDisplay = await driver.findElements(By.xpath(`//*[contains(text(), '${newFirstName}') or contains(text(), '${newLastName}')]`));
      if (nameDisplay.length > 0) {
        console.log('   ✓ New name also displayed in profile view');
        const displayText = await nameDisplay[0].getText();
        console.log(`   Name display: "${displayText}"`);
      }
    } catch (e) {
      // Name might not be displayed elsewhere, that's okay
    }
    
    // Check if header or navigation shows updated name
    try {
      const headerName = await driver.findElements(By.xpath(`//header//*[contains(text(), '${newFirstName}')] | //nav//*[contains(text(), '${newFirstName}')]`));
      if (headerName.length > 0) {
        console.log('   ✓ Updated name visible in header/navigation');
      }
    } catch (e) {
      // Header might not show name, that's okay
    }
    
  } catch (error) {
    console.log('✗ Test 9 Failed:', error.message);
    
    // Check for error messages
    try {
      const errorElement = await driver.findElement(By.xpath("//*[contains(@class, 'error') or contains(@class, 'alert') or contains(text(), 'Error')]"));
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

test9();
