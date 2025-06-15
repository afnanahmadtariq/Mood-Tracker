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
  
  try {    // Navigate to homepage and login first
    console.log('📍 Navigating to homepage...');
    await driver.get('http://mood-tracker-web:3000/');
    await driver.wait(until.titleContains('Mood'), 5000);
    
    // Wait for initial page load
    await driver.sleep(2000);    // Check if already logged in by looking for authenticated content (My Moods button in header)
    const isLoggedIn = await driver.findElements(By.css('nav button[class*="bg-blue-600"]'));
    
    if (isLoggedIn.length === 0) {
      console.log('🔐 Not logged in, performing login...');
      
      // Look for login form or toggle to it
      try {
        await driver.wait(until.elementLocated(By.id('email')), 2000);
        console.log('   Login form found directly');
      } catch (e) {
        console.log('   Login form not visible, looking for login link...');        try {
          // Look for toggle form button - check if we're on login form by looking for email field
          await driver.wait(until.elementLocated(By.id('email')), 2000);
          console.log('   Found login form');
        } catch (e2) {
          // Look for register toggle button and switch to login
          try {
            const toggleButtons = await driver.findElements(By.css('button'));
            for (let button of toggleButtons) {
              const buttonText = await button.getText();
              if (buttonText.includes('Already have an account')) {
                await driver.executeScript("arguments[0].click();", button);
                await driver.wait(until.elementLocated(By.id('email')), 5000);
                console.log('   Switched from register to login form');
                break;
              }
            }
          } catch (e3) {
            console.log('   Could not find form toggle');
            throw new Error('Unable to locate login form');
          }
        }
      }
      
      // Login with test credentials
      console.log('   Filling login credentials...');
      await driver.findElement(By.id('email')).sendKeys('test@example.com');
      await driver.findElement(By.id('password')).sendKeys('password123');      console.log('   Submitting login form...');
      const submitButton = await driver.findElement(By.css('button[type="submit"]'));
      await driver.executeScript("arguments[0].click();", submitButton);
      
      // Wait for login to complete - look for authenticated elements
      console.log('⏳ Waiting for login to complete...');
      await driver.wait(until.elementLocated(By.css('nav button[class*="bg-blue-600"]')), 10000);
      console.log('✓ Login completed');
        // Additional verification - check page content
      try {
        const pageText = await driver.findElement(By.tagName('body')).getText();
        console.log(`   Page contains authenticated content: ${pageText.includes('My Moods') || pageText.includes('Profile') || pageText.includes('Analytics')}`);
      } catch (e) {
        console.log('   Could not verify page content');
      }
    } else {
      console.log('✓ Already logged in');
    }
      // Ensure we're on the mood tab (should be default)
    console.log('😊 Ensuring we are on mood tracking tab...');
    try {
      // Look for "My Moods" button and click it to ensure we're on the right tab
      const navButtons = await driver.findElements(By.css('nav button'));
      for (let button of navButtons) {
        const buttonText = await button.getText();
        if (buttonText.includes('My Moods')) {
          await driver.executeScript("arguments[0].click();", button);
          console.log('   Clicked My Moods tab');
          break;
        }
      }
    } catch (e) {
      // Already on mood page or tab doesn't exist
      console.log('   Already on mood page or navigation not needed');
    }

    // Wait for mood list to load and check which layout is active
    await driver.sleep(2000);
    
    // Debug: Check which layout is being used
    try {
      const desktopLayout = await driver.findElements(By.css('.lg\\:block .lg\\:flex'));
      const mobileLayout = await driver.findElements(By.css('.lg\\:hidden'));
      console.log(`   Desktop layout elements: ${desktopLayout.length}, Mobile layout elements: ${mobileLayout.length}`);
      
      // Check viewport size
      const windowSize = await driver.manage().window().getSize();
      console.log(`   Window size: ${windowSize.width}x${windowSize.height}`);
    } catch (e) {
      console.log('   Layout detection failed, continuing...');
    }    // Count existing moods in the journey list before adding new one
    console.log('📊 Counting existing moods in journey list...');
      // Wait for the page to fully load - look for mood form or existing entries
    await driver.wait(until.elementLocated(By.css('form, h2')), 10000);
    
    // Wait for any loading states to complete
    const loadingElements = await driver.findElements(By.css('.animate-spin, [class*="loading"]'));
    if (loadingElements.length > 0) {
      console.log('   Waiting for loading to complete...');
      await driver.sleep(3000); // Give time for loading to finish
    }
    
    // Count existing moods using data-testid first, then fallback
    const existingMoods = await driver.findElements(By.css('[data-testid^="mood-entry-"], [data-testid^="mood-entry-mobile-"]'));
    let initialMoodCount = existingMoods.length;
    
    if (initialMoodCount === 0) {
      // Try fallback selectors if data-testid doesn't work
      const fallbackMoods = await driver.findElements(By.css('.card-hover'));
      initialMoodCount = fallbackMoods.length;
      console.log(`   Using fallback mood count: ${initialMoodCount}`);
    } else {
      console.log(`   Initial mood count: ${initialMoodCount}`);
    }    // Select a mood using robust selectors
    console.log('😊 Selecting mood...');
      // Wait for the mood section to be fully loaded - look for mood option buttons
    await driver.wait(until.elementLocated(By.css('button.mood-option, form button')), 10000);
    
    // Try multiple selectors for the mood button (Amazing = first button)
    let moodButton = null;
    try {
      // Try to find the "Amazing" mood button specifically using JavaScript
      moodButton = await driver.executeScript(`
        const buttons = Array.from(document.querySelectorAll('button.mood-option'));
        return buttons.find(btn => btn.textContent.includes('Amazing'));
      `);
      if (moodButton) {
        console.log('   Found Amazing mood button with JavaScript search');
      } else {
        throw new Error('Amazing button not found');
      }
    } catch (e) {
      try {
        // Try to find first mood option button
        moodButton = await driver.findElement(By.css('button.mood-option'));
        console.log('   Found first mood-option button');
      } catch (e2) {
        try {
          // Try to find first button in form (excluding submit button)
          moodButton = await driver.executeScript(`
            const form = document.querySelector('form');
            if (form) {
              const buttons = Array.from(form.querySelectorAll('button'));
              return buttons.find(btn => btn.type !== 'submit');
            }
            return null;
          `);
          if (moodButton) {
            console.log('   Found first non-submit button in form');
          } else {
            throw new Error('No mood buttons found');
          }
        } catch (e3) {
          throw new Error('Could not find any mood button');
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
          // Try to find the button again using JavaScript
        moodButton = await driver.executeScript(`
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(btn => btn.textContent.includes('Amazing'));
        `);
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
      if (buttonClass.includes('selected') || buttonClass.includes('bg-blue-50') || buttonClass.includes('border-blue-500')) {
        console.log('   ✓ Mood button shows selected state');
      }
    } catch (e) {
      // Selection state check failed, that's okay
    }

    // Add optional note
    console.log('📝 Adding note to mood entry...');
    let noteAdded = false;
    try {
      // Try to find note field by ID first
      let noteField = null;
      try {
        noteField = await driver.findElement(By.id('note'));
        console.log('   Found note field by id');
      } catch (e) {
        try {
          // Try to find textarea (note field is a textarea in the component)
          noteField = await driver.findElement(By.css('textarea'));
          console.log('   Found note field by textarea selector');
        } catch (e2) {
          console.log('   Note field not found with any selector');
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
    }    // Submit the mood form
    console.log('💾 Saving mood...');
    
    // Try to find the save button (should be submit type button in form)
    let saveButton = null;
    try {
      // Try to find submit button in the form
      saveButton = await driver.findElement(By.css('form button[type="submit"]'));
      console.log('   Found save button with submit type');
    } catch (e) {
      try {
        // Try to find any button in the form that might be the submit button
        saveButton = await driver.executeScript(`
          const form = document.querySelector('form');
          if (form) {
            const buttons = form.querySelectorAll('button');
            return buttons[buttons.length - 1]; // Usually submit button is last
          }
          return null;
        `);
        if (saveButton) {
          console.log('   Found save button with JavaScript search');
        } else {
          throw new Error('Button not found');
        }
      } catch (e2) {
        // Try form submission directly
        console.log('   Save button not found, trying form submission...');
        const form = await driver.findElement(By.css('form'));
        await driver.executeScript("arguments[0].submit();", form);
        console.log('   Form submitted directly');
        saveButton = null; // Mark as handled
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
          const form = await driver.findElement(By.css('form'));
          await driver.executeScript("arguments[0].submit();", form);
          console.log('   ✓ Form submitted directly');
        } catch (e2) {
          // Alternative 2: Try triggering submit event
          try {
            await driver.executeScript(`
              const form = document.querySelector('form');
              if (form) {
                form.dispatchEvent(new Event('submit', { bubbles: true }));
              }
            `);
            console.log('   ✓ Submit event triggered');
          } catch (e3) {
            console.log('   All save attempts failed:', e3.message);
          }
        }
      }
    }    // Wait for success message or mood to be saved
    console.log('⏳ Waiting for mood to be saved...');
    try {
      // Look for success message in the MoodForm component using JavaScript
      await driver.wait(until.elementLocated(By.css('.bg-green-50')), 5000);
      console.log('   ✓ Success message found');
    } catch (e) {
      // Try using JavaScript to find success message
      try {
        const successFound = await driver.executeScript(`
          const elements = Array.from(document.querySelectorAll('*'));
          return elements.some(el => 
            el.textContent.includes('Mood saved successfully') ||
            el.textContent.includes('saved successfully') ||
            el.classList.contains('bg-green-50')
          );
        `);
        if (successFound) {
          console.log('   ✓ Success message found with JavaScript search');
        } else {
          console.log('   No explicit success message, checking mood list...');
        }
      } catch (e2) {
        console.log('   No explicit success message, checking mood list...');
      }
    }
    
    // Wait for UI to update
    await driver.sleep(2000);    // Verify mood was added to the journey list
    console.log('✅ Verifying mood was added to journey list...');
    
    // Try data-testid first, then fallback selectors
    let updatedMoods = [];
    try {
      // Try data-testid for mood entries first (both desktop and mobile)
      updatedMoods = await driver.findElements(By.css('[data-testid^="mood-entry-"], [data-testid^="mood-entry-mobile-"]'));
      console.log(`   Found ${updatedMoods.length} moods with data-testid selector`);
    } catch (e) {
      try {
        // Try the original selector as fallback
        updatedMoods = await driver.findElements(By.css('.card-hover'));
        console.log(`   Found ${updatedMoods.length} moods with fallback selector`);
      } catch (e2) {
        console.log('   Could not find mood entries with any selector');
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
      }      // Additional verification - check for any success indicators
      try {
        const successFound = await driver.executeScript(`
          const elements = Array.from(document.querySelectorAll('*'));
          return elements.some(el => 
            el.textContent.includes('saved') ||
            el.textContent.includes('added') ||
            el.textContent.includes('success') ||
            el.classList.contains('bg-green-50')
          );
        `);
        if (successFound) {
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
    }    // Check for error messages on the page
    try {
      const errorFound = await driver.executeScript(`
        const elements = Array.from(document.querySelectorAll('*'));
        const errorElements = elements.filter(el => 
          el.textContent.includes('Error') ||
          el.textContent.includes('failed') ||
          el.textContent.includes('invalid') ||
          el.classList.contains('bg-red-50')
        );
        return errorElements.map(el => el.textContent.trim()).filter(text => text.length > 0);
      `);
      if (errorFound.length > 0) {
        console.log('   Error messages found on page:');
        errorFound.slice(0, 3).forEach(error => {
          console.log(`     - ${error}`);
        });
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
