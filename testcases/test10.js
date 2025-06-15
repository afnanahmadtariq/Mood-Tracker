const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function test10() {
  console.log('Starting Test 10: Change profile Name -> Profile Name changed');
  
  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  try {    // Navigate to homepage and login first
    console.log('📍 Navigating to homepage...');
    await driver.get('http://localhost:3000');
    await driver.wait(until.titleContains('Mood'), 5000);
    
    // Check if already logged in by looking for authenticated content
    const isLoggedIn = await driver.findElements(By.xpath("//*[contains(text(), 'My Moods') or contains(text(), 'Analytics') or contains(text(), 'Profile')]"));
    
    if (isLoggedIn.length === 0) {
      console.log('🔐 Not logged in, performing login...');
      
      // Look for login form or toggle to it
      try {
        await driver.wait(until.elementLocated(By.id('email')), 2000);
        console.log('   Login form found directly');
      } catch (e) {
        console.log('   Login form not visible, looking for login link...');
        const loginLink = await driver.findElement(By.xpath("//*[contains(text(), 'Login') or contains(text(), 'Sign in') or contains(text(), 'Already have an account')]"));
        await driver.executeScript("arguments[0].click();", loginLink);
        await driver.wait(until.elementLocated(By.id('email')), 5000);
        console.log('   Login form found after clicking login link');
      }
      
      // Login with test credentials
      console.log('   Filling login credentials...');
      await driver.findElement(By.id('email')).sendKeys('test@example.com');
      await driver.findElement(By.id('password')).sendKeys('password123');
      
      console.log('   Submitting login form...');
      const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Sign In') or @type='submit']"));
      await driver.executeScript("arguments[0].click();", submitButton);
      
      // Wait for login to complete - look for authenticated elements
      console.log('⏳ Waiting for login to complete...');
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'My Moods') or contains(text(), 'Profile') or contains(text(), 'Analytics')]")), 10000);
      console.log('✓ Login completed');
    } else {
      console.log('✓ Already logged in');
    }    // Navigate to Profile page
    console.log('👤 Navigating to Profile page...');
    const profileButton = await driver.findElement(By.xpath(
      "//button[contains(., 'Profile')] | " +
      "//button[.//span[contains(text(), 'Profile')]] | " +
      "//button[contains(text(), '👤')]"
    ));
    await driver.executeScript("arguments[0].click();", profileButton);
    
    // Wait for profile page to load
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Profile') or contains(text(), 'Settings')] | //input[@name='firstName'] | //input[@name='lastName']")), 10000);
    console.log('✓ Profile page loaded');
    
    // Find first name and last name input fields using IDs
    console.log('👋 Looking for name fields...');
    
    // Wait for and locate first name input
    await driver.wait(until.elementLocated(By.id('firstName')), 10000);
    const firstNameInput = await driver.findElement(By.id('firstName'));
    
    // Wait for and locate last name input
    await driver.wait(until.elementLocated(By.id('lastName')), 10000);
    const lastNameInput = await driver.findElement(By.id('lastName'));
    
    // Scroll to ensure fields are visible
    await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", firstNameInput);
    await driver.sleep(1000);
    
    // Wait for fields to be interactable
    await driver.wait(until.elementIsEnabled(firstNameInput), 5000);
    await driver.wait(until.elementIsEnabled(lastNameInput), 5000);
    
    console.log('✓ Name fields found and ready for interaction');
      // Get current name values
    const currentFirstName = await firstNameInput.getAttribute('value');
    const currentLastName = await lastNameInput.getAttribute('value');
    console.log(`📊 Current name: "${currentFirstName} ${currentLastName}"`);
    
    // Set new name values
    const newFirstName = 'UpdatedTest';
    const newLastName = 'UpdatedUser';
    console.log('📝 Changing profile name...');
    
    // Update first name field
    try {
      // Method 1: Standard clear and sendKeys
      await firstNameInput.clear();
      await firstNameInput.sendKeys(newFirstName);
    } catch (e) {
      console.log('   Standard method failed for firstName, trying JavaScript approach...');
      // Method 2: Use JavaScript to set value
      await driver.executeScript("arguments[0].value = '';", firstNameInput);
      await driver.executeScript("arguments[0].value = arguments[1];", firstNameInput, newFirstName);
      
      // Trigger React events
      await driver.executeScript("arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", firstNameInput);
      await driver.executeScript("arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", firstNameInput);
    }
    
    // Update last name field
    try {
      // Method 1: Standard clear and sendKeys
      await lastNameInput.clear();
      await lastNameInput.sendKeys(newLastName);
    } catch (e) {
      console.log('   Standard method failed for lastName, trying JavaScript approach...');
      // Method 2: Use JavaScript to set value
      await driver.executeScript("arguments[0].value = '';", lastNameInput);
      await driver.executeScript("arguments[0].value = arguments[1];", lastNameInput, newLastName);
      
      // Trigger React events
      await driver.executeScript("arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", lastNameInput);
      await driver.executeScript("arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", lastNameInput);
    }
    
    console.log('✓ Name values entered successfully');
      // Submit the profile form
    console.log('🚀 Saving profile changes...');
    
    // Find and click the save button
    try {
      const saveButton = await driver.findElement(By.xpath("//button[contains(text(), 'Save') or contains(text(), 'Update') or @type='submit']"));
      
      // Scroll to save button and ensure it's visible
      await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", saveButton);
      await driver.sleep(500);
      
      // Wait for button to be clickable
      await driver.wait(until.elementIsEnabled(saveButton), 5000);
      
      // Click the save button
      await driver.executeScript("arguments[0].click();", saveButton);
      console.log('✓ Save button clicked successfully');
    } catch (e) {
      console.log('   Save button not found with primary selector, trying form submission...');
      // Alternative: try submitting the form directly
      const form = await driver.findElement(By.xpath("//form"));
      await driver.executeScript("arguments[0].submit();", form);
    }
    
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
      console.log('✓ Test 10 Passed: Profile name successfully changed');
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
    console.log('✗ Test 10 Failed:', error.message);
    
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

test10();
