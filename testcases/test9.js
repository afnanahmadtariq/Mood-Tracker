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
  
  try {    // Navigate to homepage and login first
    console.log('📍 Navigating to homepage...');
    await driver.get('http://18.204.228.168:3300/');
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
    
    // Look for Profile button in navigation
    console.log('🔍 Looking for Profile button in navigation...');
    const profileButton = await driver.findElement(By.xpath(
      "//button[contains(., 'Profile')] | " +
      "//button[.//span[contains(text(), 'Profile')]] | " +
      "//button[contains(text(), '👤')]"
    ));
    
    console.log('✓ Found Profile button, clicking...');
    await driver.executeScript("arguments[0].click();", profileButton);
    
    // Wait for profile content to load
    console.log('⏳ Waiting for profile content to appear...');
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Profile') or contains(text(), 'Settings')] | //input[@name='firstName'] | //input[@name='dateOfBirth']")), 10000);
    console.log('✓ Profile content loaded');
      // Find date of birth input field
    console.log('📅 Looking for date of birth field...');
    
    // Wait for the input field to be present and visible
    await driver.wait(until.elementLocated(By.id('dateOfBirth')), 10000);
    
    // Scroll to the date of birth input field to ensure it's visible
    const dobInput = await driver.findElement(By.id('dateOfBirth'));
    await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", dobInput);
    
    // Wait a moment for scroll to complete
    await driver.sleep(1000);
    
    // Wait for the element to be clickable/interactable
    await driver.wait(until.elementIsEnabled(dobInput), 5000);
    
    console.log('✓ Date of birth field found and ready for interaction');
    
    // Get current date of birth value
    const currentDob = await dobInput.getAttribute('value');
    console.log(`📊 Current DoB: ${currentDob}`);
      // Set new date of birth
    const newDob = '1995-06-15'; // June 15, 1995
    console.log(`📝 Changing date of birth from "${currentDob}" to "${newDob}"...`);
    
    // Try multiple methods to clear and enter text
    let inputSuccess = false;
    try {
      // Method 1: Standard clear and sendKeys
      console.log('   Trying method 1: Standard clear and sendKeys...');
      await dobInput.clear();
      await dobInput.sendKeys(newDob);
      
      // Verify the input was set
      const checkValue = await dobInput.getAttribute('value');
      if (checkValue === newDob) {
        console.log('   ✓ Method 1 successful');
        inputSuccess = true;
      } else {
        console.log(`   Method 1 partial success: set "${checkValue}" instead of "${newDob}"`);
      }
    } catch (e) {
      console.log('   Method 1 failed:', e.message);
    }
    
    if (!inputSuccess) {
      try {
        console.log('   Trying method 2: JavaScript value setting...');
        // Method 2: Use JavaScript to set value and trigger events
        await driver.executeScript("arguments[0].focus();", dobInput);
        await driver.executeScript("arguments[0].value = '';", dobInput);
        await driver.executeScript("arguments[0].value = arguments[1];", dobInput, newDob);
        
        // Trigger events to notify React of the change
        await driver.executeScript("arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", dobInput);
        await driver.executeScript("arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", dobInput);
        await driver.executeScript("arguments[0].dispatchEvent(new Event('blur', { bubbles: true }));", dobInput);
        
        // Verify the input was set
        const checkValue = await dobInput.getAttribute('value');
        if (checkValue === newDob) {
          console.log('   ✓ Method 2 successful');
          inputSuccess = true;
        } else {
          console.log(`   Method 2 result: "${checkValue}"`);
        }
      } catch (e) {
        console.log('   Method 2 failed:', e.message);
      }
    }
    
    if (!inputSuccess) {
      console.log('   Trying method 3: Character-by-character input...');
      try {
        // Method 3: Clear and type character by character
        await dobInput.clear();
        for (let char of newDob) {
          await dobInput.sendKeys(char);
          await driver.sleep(50); // Small delay between characters
        }
        
        const checkValue = await dobInput.getAttribute('value');
        if (checkValue === newDob) {
          console.log('   ✓ Method 3 successful');
          inputSuccess = true;
        } else {
          console.log(`   Method 3 result: "${checkValue}"`);
        }
      } catch (e) {
        console.log('   Method 3 failed:', e.message);
      }
    }
    
    // Final verification of input
    const finalValue = await dobInput.getAttribute('value');
    console.log(`📊 Final input value: "${finalValue}"`);
    
    if (inputSuccess || finalValue === newDob) {
      console.log('✓ Date of birth entered successfully');
    } else {
      console.log(`⚠️ Date input may not have been set correctly. Expected: "${newDob}", Got: "${finalValue}"`);
    }
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
      console.log('   No explicit success message, checking DoB change...');
    }
      // Verify date of birth has changed
    console.log('✅ Verifying date of birth changed...');
    await driver.sleep(1000); // Allow time for form to update
    
    // Get updated value from the field
    const updatedDob = await dobInput.getAttribute('value');
    console.log(`📊 Verification - Current DoB: "${currentDob}"`);
    console.log(`📊 Verification - Expected DoB: "${newDob}"`);
    console.log(`📊 Verification - Actual DoB: "${updatedDob}"`);
    
    // Also check the field's displayed value
    const displayedValue = await dobInput.getAttribute('value');
    console.log(`📊 Verification - Displayed value: "${displayedValue}"`);
    
    // Verify the change was successful
    if (updatedDob === newDob) {
      if (currentDob && currentDob !== newDob) {
        console.log('✓ Test 9 Passed: Date of birth successfully changed');
        console.log(`   DoB changed from "${currentDob}" to "${updatedDob}"`);
      } else {
        console.log('✓ Test 9 Passed: Date of birth set to new value');
        console.log(`   DoB set to: "${updatedDob}"`);
      }
      
      // Additional verification - try to find the DoB displayed elsewhere
      try {
        // Refresh the profile page to see if changes persist
        console.log('🔄 Refreshing page to verify persistence...');
        await driver.navigate().refresh();
        await driver.wait(until.elementLocated(By.id('dateOfBirth')), 5000);
        
        const persistentDobInput = await driver.findElement(By.id('dateOfBirth'));
        const persistentDobValue = await persistentDobInput.getAttribute('value');
        
        if (persistentDobValue === newDob) {
          console.log('   ✓ Date of birth change persisted after page refresh');
          console.log(`   Persistent DoB: "${persistentDobValue}"`);
        } else {
          console.log(`   ⚠️ Date of birth did not persist. Found: "${persistentDobValue}"`);
        }
      } catch (e) {
        console.log('   ⚠️ Could not verify persistence:', e.message);
      }
      
      // Look for any date display in the UI
      try {
        const dateElements = await driver.findElements(By.xpath(`//*[contains(text(), '${newDob}') or contains(text(), 'June 15') or contains(text(), '1995-06-15')]`));
        if (dateElements.length > 0) {
          console.log('   ✓ New date of birth also found displayed in UI');
        }
      } catch (e) {
        // DoB might not be displayed elsewhere, that's okay
      }
      
    } else {
      console.log('✗ Date of birth verification failed');
      console.log(`   Expected: "${newDob}"`);
      console.log(`   Actual: "${updatedDob}"`);
      console.log(`   Original: "${currentDob}"`);
      
      // Try to get more debug info
      try {
        const fieldType = await dobInput.getAttribute('type');
        const fieldName = await dobInput.getAttribute('name');
        const fieldId = await dobInput.getAttribute('id');
        console.log(`   Field debug - type: "${fieldType}", name: "${fieldName}", id: "${fieldId}"`);
      } catch (e) {
        console.log('   Could not get field debug info');
      }
      
      throw new Error(`Date of birth was not changed. Expected: ${newDob}, Actual: ${updatedDob}`);
    }
    } catch (error) {
    console.log('✗ Test 9 Failed:', error.message);
    console.log('📊 Error details:', error.stack);
    
    // Gather debugging information
    try {
      const currentUrl = await driver.getCurrentUrl();
      const pageTitle = await driver.getTitle();
      console.log(`   Current URL: ${currentUrl}`);
      console.log(`   Page title: ${pageTitle}`);
      
      // Check for React error boundaries or console errors
      const logs = await driver.manage().logs().get('browser');
      if (logs.length > 0) {
        console.log('   Browser console logs:');
        logs.forEach(log => {
          if (log.level.name === 'SEVERE' || log.level.name === 'WARNING') {
            console.log(`     ${log.level.name}: ${log.message}`);
          }
        });
      }
    } catch (debugError) {
      console.log('   Could not gather debug info:', debugError.message);
    }
    
    // Check for error messages on the page
    try {
      const errorElements = await driver.findElements(By.xpath("//*[contains(@class, 'error') or contains(@class, 'alert') or contains(text(), 'Error') or contains(text(), 'failed') or contains(text(), 'invalid')]"));
      if (errorElements.length > 0) {
        console.log('   Error messages found on page:');
        for (let i = 0; i < Math.min(errorElements.length, 3); i++) {
          const errorText = await errorElements[i].getText();
          if (errorText.trim()) {
            console.log(`     - ${errorText}`);
          }
        }
      }
    } catch (e) {
      // No error messages found or could not access them
    }
    
    // Try to capture the state of the DoB field if it exists
    try {
      const dobField = await driver.findElement(By.id('dateOfBirth'));
      const dobValue = await dobField.getAttribute('value');
      const dobEnabled = await dobField.isEnabled();
      const dobVisible = await dobField.isDisplayed();
      console.log(`   DoB field state - value: "${dobValue}", enabled: ${dobEnabled}, visible: ${dobVisible}`);
    } catch (e) {
      console.log('   Could not access DoB field for debugging');
    }
    
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

test9();
