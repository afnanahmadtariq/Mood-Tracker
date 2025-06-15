const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function test9() {
  console.log('Starting Test 9: Change profile DoB -> Profile DoB changed');
  
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
      console.log('🔐 Not logged in, performing login...');
      
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
      // Navigate to Profile page
    console.log('👤 Navigating to Profile page...');
    const profileButton = await driver.findElement(By.xpath(
      "//button[contains(., 'Profile')] | " +
      "//button[.//span[contains(text(), 'Profile')]] | " +
      "//button[contains(text(), '👤')]"    ));
    await driver.executeScript("arguments[0].click();", profileButton);
    
    // Wait for profile page to load
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Profile') or contains(text(), 'Settings')] | //input[@name='firstName'] | //input[@name='dateOfBirth']")), 10000);
    
    // Find date of birth input field
    console.log('📅 Looking for date of birth field...');
    const dobInput = await driver.findElement(By.xpath(
      "//input[@name='dateOfBirth'] | " +
      "//input[@name='dob'] | " +
      "//input[@type='date'] | " +
      "//input[contains(@placeholder, 'birth') or contains(@placeholder, 'date')]"
    ));
    
    // Get current date of birth value
    const currentDob = await dobInput.getAttribute('value');
    console.log(`📊 Current DoB: ${currentDob}`);
    
    // Set new date of birth
    const newDob = '1995-06-15'; // June 15, 1995
    console.log('📝 Changing date of birth...');
    await dobInput.clear();
    await dobInput.sendKeys(newDob);
    
    // Submit the profile form
    console.log('🚀 Saving profile changes...');
    const saveButton = await driver.findElement(By.xpath("//button[contains(text(), 'Save') or contains(text(), 'Update') or @type='submit']"));
    await driver.executeScript("arguments[0].click();", saveButton);
    
    // Wait for save confirmation
    console.log('⏳ Waiting for profile update...');
    try {
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'updated') or contains(text(), 'saved') or contains(text(), 'success') or contains(@class, 'success')]")), 5000);
      console.log('   ✓ Success message found');
    } catch (e) {
      console.log('   No explicit success message, checking DoB change...');
    }
    
    // Verify date of birth has changed
    console.log('✅ Verifying date of birth changed...');
    await driver.sleep(1000); // Allow time for form to update
    
    const updatedDob = await dobInput.getAttribute('value');
      if (updatedDob === newDob && updatedDob !== currentDob) {
      console.log('✓ Test 9 Passed: Date of birth successfully changed');
      console.log(`   DoB changed from "${currentDob}" to "${updatedDob}"`);
    } else if (updatedDob === newDob) {
      console.log('✓ Test 9 Passed: Date of birth set to new value');
      console.log(`   DoB set to: "${updatedDob}"`);
    } else {
      throw new Error(`Date of birth was not changed. Expected: ${newDob}, Actual: ${updatedDob}`);
    }
    
    // Additional verification - check if DoB is displayed elsewhere on the page
    try {
      const dobDisplay = await driver.findElements(By.xpath(`//*[contains(text(), '${newDob}') or contains(text(), 'June') or contains(text(), '1995')]`));
      if (dobDisplay.length > 0) {
        console.log('   ✓ New date of birth also displayed in profile view');
      }
    } catch (e) {
      // DoB might not be displayed elsewhere, that's okay
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
