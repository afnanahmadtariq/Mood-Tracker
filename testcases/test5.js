const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function test5() {
  console.log('Starting Test 5: Save a mood -> Mood is added to your mood journey list');
  
  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  try {    // Navigate to homepage and login
    console.log('📍 Navigating to homepage...');
    await driver.get('http://localhost:3000');
    await driver.wait(until.titleContains('Mood'), 5000);
    
    // Wait for initial page load and API calls
    await driver.sleep(2000);
    
    // Check for any immediate API errors
    const initialLogs = await driver.manage().logs().get('browser');
    const apiErrors = initialLogs.filter(log => 
      log.message.includes('401') || 
      log.message.includes('Failed to fetch') ||
      log.message.includes('Unauthorized')
    );
    
    if (apiErrors.length > 0) {
      console.log('⚠️ API errors detected on initial load, continuing with fresh authentication...');
    }
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
      
      // Additional verification - wait for any API calls to complete
      await driver.sleep(2000);
      
      // Check for any auth errors
      const logs = await driver.manage().logs().get('browser');
      const authErrors = logs.filter(log => 
        log.message.includes('401') || 
        log.message.includes('Unauthorized') || 
        log.message.includes('Authentication')
      );
      
      if (authErrors.length > 0) {
        console.log('⚠️ Authentication errors detected, refreshing page...');
        await driver.navigate().refresh();
        await driver.sleep(3000);
      }
    } else {
      console.log('✓ Already logged in');
    }
    
    // Navigate to mood tab
    console.log('📝 Navigating to mood tab...');
    await driver.get('http://localhost:3000?tab=mood');
    
    // Wait longer for page to fully load and API calls to complete
    await driver.sleep(3000);
    
    // Verify we're still authenticated after navigation
    const stillLoggedIn = await driver.findElements(By.xpath("//*[contains(text(), 'My Moods') or contains(text(), 'Analytics') or contains(text(), 'Profile')]"));
    if (stillLoggedIn.length === 0) {
      console.log('⚠️ Lost authentication after navigation, attempting re-login...');
      throw new Error('Authentication was lost after navigation to mood tab');
    }
      // Count existing moods in the journey list before adding new one
    console.log('📊 Counting existing moods in journey list...');
    
    // Wait for the page to fully load - check for both the mood form and journey list
    await driver.wait(until.elementLocated(By.xpath("//form | //button[contains(text(), '🤩')]")), 10000);
    
    // Wait for any loading states to complete
    const loadingElements = await driver.findElements(By.xpath("//*[contains(text(), 'Loading') or contains(@class, 'loading') or contains(@class, 'spinner')]"));
    if (loadingElements.length > 0) {
      console.log('   Waiting for loading to complete...');
      await driver.wait(until.stalenessOf(loadingElements[0]), 10000);
    }
    
    const existingMoods = await driver.findElements(By.xpath("//div[contains(@class, 'card-hover') and contains(@class, 'border')]"));
    const initialMoodCount = existingMoods.length;
    console.log(`   Initial mood count: ${initialMoodCount}`);// Select a mood using robust selectors
    console.log('😊 Selecting mood...');
    
    // Wait for the mood section to be fully loaded
    await driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'mood') or contains(text(), '🤩') or contains(text(), '😊')]")), 10000);
    
    // Try multiple selectors for the mood button
    let moodButton = null;
    try {
      // Try the specific XPath first
      moodButton = await driver.wait(until.elementLocated(By.xpath('/html/body/div/main/div/div[2]/div[1]/div[2]/form/div[1]/div/button[1]')), 5000);
      console.log('   Found mood button with specific XPath');
    } catch (e) {
      try {
        // Try data-testid if available
        moodButton = await driver.findElement(By.css('[data-testid="mood-button-1"], [data-testid*="mood"]:first-child'));
        console.log('   Found mood button with data-testid');
      } catch (e2) {
        try {
          // Try general mood button selector - look for the first mood button
          moodButton = await driver.findElement(By.xpath("//button[contains(text(), '🤩') or contains(text(), 'Amazing')]"));
          console.log('   Found mood button with "Amazing" selector');
        } catch (e3) {
          try {
            // Try any mood button
            moodButton = await driver.findElement(By.xpath("//button[contains(@class, 'mood') or (contains(text(), '😊') or contains(text(), '�') or contains(text(), '🤩'))]"));
            console.log('   Found mood button with general emoji selector');
          } catch (e4) {
            // Try any button in the mood form
            moodButton = await driver.findElement(By.xpath("//form//button[1]"));
            console.log('   Found first button in form');
          }
        }
      }
    }
    
    // Check if button is enabled before clicking
    const isEnabled = await moodButton.isEnabled();
    console.log(`   Mood button enabled: ${isEnabled}`);
    
    if (!isEnabled) {
      console.log('   ⚠️ Mood button is disabled - checking authentication status...');
      
      // Check browser logs for auth errors
      const logs = await driver.manage().logs().get('browser');
      const recentErrors = logs.filter(log => 
        log.timestamp > Date.now() - 10000 && // Last 10 seconds
        (log.message.includes('401') || log.message.includes('fetch'))
      );
      
      if (recentErrors.length > 0) {
        console.log('   Authentication errors found, refreshing page...');
        await driver.navigate().refresh();
        await driver.sleep(3000);
        
        // Try to find the button again
        moodButton = await driver.findElement(By.xpath("//button[contains(text(), '🤩') or contains(text(), 'Amazing')]"));
      }
    }
    
    // Scroll to and click the mood button
    await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", moodButton);
    await driver.sleep(500); // Wait for scroll to complete
    
    // Wait for button to be clickable with longer timeout
    await driver.wait(until.elementIsEnabled(moodButton), 10000);
    
    // Click the mood button
    await driver.executeScript("arguments[0].click();", moodButton);
    console.log('   ✓ Mood selected');
    
    // Verify mood was selected
    try {
      // Check if button has active/selected state
      const buttonClass = await moodButton.getAttribute('class');
      if (buttonClass.includes('selected') || buttonClass.includes('active')) {
        console.log('   ✓ Mood button shows selected state');
      }
    } catch (e) {
      // Selection state check failed, that's okay
    }    // Add optional note
    console.log('📝 Adding note to mood entry...');
    let noteAdded = false;
    try {
      // Try multiple selectors for note field
      let noteField = null;
      try {
        noteField = await driver.findElement(By.id('note'));
        console.log('   Found note field by id');
      } catch (e) {
        try {
          noteField = await driver.findElement(By.name('note'));
          console.log('   Found note field by name');
        } catch (e2) {
          try {
            noteField = await driver.findElement(By.css('textarea, input[type="text"][placeholder*="note"], input[placeholder*="Note"]'));
            console.log('   Found note field by general selector');
          } catch (e3) {
            console.log('   Note field not found with any selector');
          }
        }
      }
      
      if (noteField) {
        // Scroll to note field and ensure it's visible
        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", noteField);
        await driver.sleep(500);
        
        // Check if field is required
        const isRequired = await noteField.getAttribute('required');
        console.log(`   Note field required: ${isRequired !== null}`);
        
        // Wait for field to be interactable
        await driver.wait(until.elementIsEnabled(noteField), 3000);
        
        // Clear and enter note
        const testNote = 'Test mood entry for journey list';
        await noteField.clear();
        await noteField.sendKeys(testNote);
        
        // Verify note was entered
        const enteredText = await noteField.getAttribute('value');
        if (enteredText === testNote) {
          console.log('   ✓ Note added successfully');
          noteAdded = true;
        } else {
          console.log(`   ⚠️ Note may not have been set correctly. Expected: "${testNote}", Got: "${enteredText}"`);
          // Try alternative method
          await driver.executeScript("arguments[0].value = arguments[1];", noteField, testNote);
          await driver.executeScript("arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", noteField);
          noteAdded = true;
        }
      }
    } catch (e) {
      console.log('   Note field not found or not interactable:', e.message);
      
      // Try to find any text input that might be for notes
      try {
        const textInputs = await driver.findElements(By.css('input[type="text"], textarea'));
        console.log(`   Found ${textInputs.length} text input(s), trying to use first one...`);
        
        if (textInputs.length > 0) {
          const firstInput = textInputs[0];
          await firstInput.sendKeys('Test note');
          console.log('   ✓ Added note to first text input found');
          noteAdded = true;
        }
      } catch (e2) {
        console.log('   Could not find any text inputs for note');
      }
    }
    
    if (!noteAdded) {
      console.log('   Continuing without note - form may still be valid');
    }// Submit the mood form
    console.log('💾 Saving mood...');
    
    // Try multiple selectors for the save button
    let saveButton = null;
    try {
      // Try the specific XPath first
      saveButton = await driver.findElement(By.xpath('/html/body/div/main/div/div[1]/div[1]/div/div[2]/form/button'));
      console.log('   Found save button with specific XPath');
    } catch (e) {
      try {
        // Try data-testid if available
        saveButton = await driver.findElement(By.css('[data-testid="save-mood"], [data-testid*="save"]'));
        console.log('   Found save button with data-testid');
      } catch (e2) {
        try {
          // Try general save button selector
          saveButton = await driver.findElement(By.xpath("//button[contains(text(), 'Save') or contains(text(), 'Submit') or @type='submit']"));
          console.log('   Found save button with general selector');
        } catch (e3) {
          // Try form submission
          console.log('   Save button not found, trying form submission...');
          const form = await driver.findElement(By.xpath("//form"));
          await driver.executeScript("arguments[0].submit();", form);
          console.log('   Form submitted directly');
          saveButton = null; // Mark as handled
        }
      }
    }
      if (saveButton) {
      // Scroll to save button and ensure it's visible
      await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", saveButton);
      await driver.sleep(500);
      
      // Check if button is enabled/disabled
      const isEnabled = await saveButton.isEnabled();
      const buttonText = await saveButton.getText();
      console.log(`   Save button state - enabled: ${isEnabled}, text: "${buttonText}"`);
      
      if (!isEnabled) {
        console.log('   Save button is disabled, checking form validation...');
        
        // Try to find and fill any required fields that might be missing
        try {
          // Look for any required fields that might be empty
          const requiredFields = await driver.findElements(By.css('input[required], textarea[required], select[required]'));
          console.log(`   Found ${requiredFields.length} required field(s)`);
          
          for (let field of requiredFields) {
            const fieldValue = await field.getAttribute('value');
            const fieldName = await field.getAttribute('name') || await field.getAttribute('id');
            console.log(`   Required field "${fieldName}": value="${fieldValue}"`);
            
            if (!fieldValue || fieldValue.trim() === '') {
              console.log(`   Filling empty required field: ${fieldName}`);
              await field.sendKeys('Test value');
            }
          }
        } catch (e) {
          console.log('   Could not check required fields:', e.message);
        }
        
        // Check if button is now enabled
        const isNowEnabled = await saveButton.isEnabled();
        console.log(`   Save button after validation check - enabled: ${isNowEnabled}`);
      }
      
      // Try to click the button regardless of enabled state
      try {
        console.log('   Attempting to click save button...');
        await driver.executeScript("arguments[0].click();", saveButton);
        console.log('   ✓ Save button clicked');
      } catch (e) {
        console.log('   Direct click failed, trying alternatives...');
        
        // Alternative 1: Try form submission
        try {
          const form = await driver.findElement(By.xpath("//form"));
          await driver.executeScript("arguments[0].submit();", form);
          console.log('   ✓ Form submitted directly');
        } catch (e2) {
          // Alternative 2: Try triggering submit event
          try {
            await driver.executeScript(`
              const button = arguments[0];
              const form = button.closest('form');
              if (form) {
                form.dispatchEvent(new Event('submit', { bubbles: true }));
              } else {
                button.click();
              }
            `, saveButton);
            console.log('   ✓ Submit event triggered');
          } catch (e3) {
            console.log('   All save attempts failed:', e3.message);
          }
        }
      }
    }
    
    // Wait for success message or mood to be saved
    console.log('⏳ Waiting for mood to be saved...');
    try {
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Mood saved') or contains(text(), 'saved successfully')]")), 5000);
      console.log('   ✓ Success message found');
    } catch (e) {
      console.log('   No explicit success message, checking mood list...');
    }
    
    // Wait for UI to update
    await driver.sleep(2000);
      // Verify mood was added to the journey list
    console.log('✅ Verifying mood was added to journey list...');
    
    // Try multiple selectors for mood entries
    let updatedMoods = [];
    try {
      // Try the specific selector first
      updatedMoods = await driver.findElements(By.xpath("//div[contains(@class, 'card-hover') and contains(@class, 'border')]"));
      console.log(`   Found ${updatedMoods.length} moods with card-hover selector`);
    } catch (e) {
      try {
        // Try data-testid if available
        updatedMoods = await driver.findElements(By.css('[data-testid*="mood-entry"], [data-testid*="mood-card"]'));
        console.log(`   Found ${updatedMoods.length} moods with data-testid selector`);
      } catch (e2) {
        try {
          // Try general mood entry selectors
          updatedMoods = await driver.findElements(By.xpath("//div[contains(@class, 'mood') or contains(@class, 'entry') or contains(@class, 'card')]"));
          console.log(`   Found ${updatedMoods.length} moods with general selector`);
        } catch (e3) {
          console.log('   Could not find mood entries with any selector');
        }
      }
    }
    
    const finalMoodCount = updatedMoods.length;
    console.log(`📊 Mood count verification:`);
    console.log(`   Initial mood count: ${initialMoodCount}`);
    console.log(`   Final mood count: ${finalMoodCount}`);
    console.log(`   Expected increase: ${finalMoodCount > initialMoodCount ? 'YES' : 'NO'}`);
    
    if (finalMoodCount > initialMoodCount) {
      console.log('✓ Test 5 Passed: Mood was successfully added to the mood journey list');
      console.log(`   Mood count increased from ${initialMoodCount} to ${finalMoodCount}`);
      
      // Try to find and verify the newly added mood entry
      try {
        if (updatedMoods.length > 0) {
          const latestMood = updatedMoods[0]; // First item should be the latest
          const moodText = await latestMood.getText();
          console.log(`   Latest mood entry preview: "${moodText.substring(0, 100)}${moodText.length > 100 ? '...' : ''}"`);
          
          // Check if our test note is in the mood entry
          if (moodText.includes('Test mood entry for journey list')) {
            console.log('   ✓ Test note found in mood entry');
          }
        }
      } catch (e) {
        console.log('   Mood added successfully but couldn\'t read details:', e.message);
      }
      
      // Additional verification - check for any success indicators
      try {
        const successElements = await driver.findElements(By.xpath("//*[contains(text(), 'saved') or contains(text(), 'added') or contains(@class, 'success')]"));
        if (successElements.length > 0) {
          console.log('   ✓ Success indicators found on page');
        }
      } catch (e) {
        // No success indicators found, that's okay
      }
      
    } else {
      console.log('✗ Mood verification failed');
      console.log(`   Expected mood count to increase from ${initialMoodCount}, but got ${finalMoodCount}`);
      
      // Try to get more debug info
      try {
        const pageSource = await driver.getPageSource();
        if (pageSource.includes('Test mood entry for journey list')) {
          console.log('   ⚠️ Test note found in page source, mood may have been saved but not in expected location');
        }
      } catch (e) {
        console.log('   Could not analyze page source for debugging');
      }
      
      throw new Error(`Mood was not added to journey list. Count remained ${finalMoodCount}`);
    }
      } catch (error) {
    console.log('✗ Test 5 Failed:', error.message);
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
    
    // Try to capture current page state
    try {
      const bodyText = await driver.findElement(By.tagName('body')).getText();
      console.log(`   Page content sample: "${bodyText.substring(0, 300)}${bodyText.length > 300 ? '...' : ''}"`);
    } catch (e) {
      console.log('   Could not capture page content for debugging');
    }
    
    // Try to check mood form state
    try {
      const forms = await driver.findElements(By.tagName('form'));
      console.log(`   Found ${forms.length} form(s) on page`);
      
      const buttons = await driver.findElements(By.tagName('button'));
      console.log(`   Found ${buttons.length} button(s) on page`);
    } catch (e) {
      console.log('   Could not analyze form elements');
    }
    
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

test5();
