const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function test5() {
  console.log('Starting Test 5: Save a mood -> Mood is added to list');
  
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
    
    // Check if already logged in, if not, perform login
    const isLoggedIn = await driver.findElements(By.xpath("//*[contains(text(), 'Mood') and (contains(text(), 'Track') or contains(text(), 'Add'))]"));
      if (isLoggedIn.length === 0) {
      console.log('🔐 Not logged in, performing login...');
        // Look for login form or toggle to it
      try {
        await driver.wait(until.elementLocated(By.id('email')), 2000);
      } catch (e) {
        console.log('🔄 Looking for login toggle...');
        const loginLink = await driver.wait(until.elementLocated(
          By.xpath("//*[contains(text(), 'Login') or contains(text(), 'Sign in') or contains(text(), 'Already have an account')]")
        ), 5000);
        await driver.wait(until.elementIsEnabled(loginLink), 3000);
        await driver.executeScript("arguments[0].scrollIntoView(true);", loginLink);
        await driver.sleep(500); // Small delay after scroll
        await driver.wait(until.elementIsVisible(loginLink), 3000);
        await loginLink.click();
        await driver.wait(until.elementLocated(By.id('email')), 5000);
      }
        // Login with test credentials
      console.log('📝 Filling login form...');
      const emailField = await driver.wait(until.elementLocated(By.id('email')), 5000);
      await driver.wait(until.elementIsVisible(emailField), 3000);
      await emailField.clear();
      await emailField.sendKeys('test@example.com');
      
      const passwordField = await driver.findElement(By.id('password'));
      await driver.wait(until.elementIsVisible(passwordField), 3000);
      await passwordField.clear();
      await passwordField.sendKeys('password123');
      
      const submitButton = await driver.wait(until.elementLocated(
        By.xpath("//button[contains(text(), 'Sign In') or @type='submit']")
      ), 5000);
      await driver.wait(until.elementIsEnabled(submitButton), 3000);
      await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
      await driver.sleep(500);      await submitButton.click();
      
      // Wait for login to complete - look for page refresh or redirect
      console.log('⏳ Waiting for login to complete...');
      await driver.sleep(3000); // Give more time for any redirects
      
      // Wait for either Analytics link or any sign of successful login
      try {
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Analytics') or contains(text(), 'Profile') or contains(text(), 'Log Mood') or contains(text(), 'Dashboard')]")), 15000);
        console.log('✓ Login completed successfully');
      } catch (waitError) {
        console.log('⚠️ Login completion timeout, checking current state...');
        const currentUrl = await driver.getCurrentUrl();
        const pageSource = await driver.getPageSource();
        console.log('Current URL after login attempt:', currentUrl);
        console.log('Page contains Analytics:', pageSource.includes('Analytics'));
        console.log('Page contains Profile:', pageSource.includes('Profile'));
        console.log('Page contains any navigation:', pageSource.includes('nav') || pageSource.includes('menu'));
        
        // Try to refresh the page and wait again
        console.log('🔄 Refreshing page and trying again...');
        await driver.navigate().refresh();
        await driver.sleep(2000);
      }
    }
        // Count existing moods before adding new one
    console.log('📊 Counting existing moods...');
    const existingMoods = await driver.findElements(By.xpath("//div[contains(@class, 'mood-card') or contains(@class, 'card-hover')] | //div[contains(., 'mood')] | //li[contains(@class, 'mood')]"));
    const initialMoodCount = existingMoods.length;
    console.log(`   Initial mood count: ${initialMoodCount}`);
      // Add a new mood
    console.log('📝 Adding a new mood...');
      // First ensure we're on the mood tab (My Moods)
    try {
      console.log('   Ensuring we are on the Mood tab...');
      const moodTab = await driver.findElements(By.xpath("//button[contains(., 'My Moods') or contains(., 'Mood')]"));
      if (moodTab.length > 0) {
        console.log('   Clicking on Mood tab...');
        await moodTab[0].click();
        // Wait a moment for the tab content to load
        await driver.sleep(1000);
      }
    } catch (e) {
      console.log('   Already on mood tab or tab not found');
    }

    // Wait for the mood form to be visible
    console.log('   Waiting for mood form to load...');
    await driver.wait(until.elementLocated(By.xpath("//label[contains(text(), 'How are you feeling today?')]")), 10000);
    console.log('   Mood form heading found');

    // Find mood option buttons (using the class from MoodForm.tsx)
    console.log('   Looking for mood option buttons...');
    const moodButtons = await driver.wait(until.elementsLocated(By.className('mood-option')), 10000);
    console.log(`   Found ${moodButtons.length} mood buttons`);

    if (moodButtons.length === 0) {
      throw new Error('No mood buttons found on the page');
    }

    // Click the second button (Happy) if available, otherwise the first one
    const selectedMoodIndex = moodButtons.length > 1 ? 1 : 0;
    await moodButtons[selectedMoodIndex].click();
    console.log('   Selected mood');
    
    // Wait briefly for any UI updates after selection
    await driver.sleep(1000);    // Fill the note field (optional in MoodForm)
    try {
      const noteField = await driver.findElement(By.id('note'));
      await noteField.sendKeys('Test mood entry from automated test');
      console.log('   Added note');
    } catch (e) {
      console.log('   Note field not found or not required, continuing...');
    }
      // Submit the form
    try {
      // Try to find by data-testid first (Next.js best practice)
      console.log('   Looking for submit button by data-testid...');
      const submitButton = await driver.findElement(By.css('[data-testid="save-mood-button"]'));
      await submitButton.click();
      console.log('   Submitted mood form using data-testid');
    } catch (e) {
      console.log('   Could not find submit button by data-testid, trying type attribute...');
      try {
        const submitButton = await driver.findElement(By.css('button[type="submit"]'));
        await submitButton.click();
        console.log('   Submitted mood form using type attribute');
      } catch (innerError) {
        console.log('   Could not find submit button by type, trying alternative selectors...');
        try {
          // Try to find by text content
          const submitButton = await driver.findElement(
            By.xpath("//button[contains(text(), 'Save') or contains(text(), 'Submit') or contains(text(), 'Add')]")
          );
          await submitButton.click();
          console.log('   Submitted mood form using text content');
        } catch (innerError2) {
          // Final attempt - try any button that might be a submit button
          const buttons = await driver.findElements(By.css('button'));
          let submitted = false;
          
          for (const button of buttons) {
            try {              const text = await button.getText();
              if (text.includes('Save') || text.includes('Submit') || text.includes('Add')) {
                await button.click();
                console.log('   Submitted form using button with text:', text);
                submitted = true;
                break;
              }
            } catch (btnError) {
              // Continue to next button
            }
          }
          
          if (!submitted) {
            throw new Error('Could not find any button to submit the form');
          }
        }
      }
    }    // Wait for success message or for a new mood to appear in the list
    console.log('⏳ Waiting for mood to be saved...');
    try {
      // Try to find success message by data-testid first (Next.js best practice)
      console.log('   Looking for success message by data-testid...');
      await driver.wait(
        until.elementLocated(By.css('[data-testid="mood-saved-success"]')), 
        5000
      );
      console.log('   ✅ Success message found by data-testid!');
    } catch (e) {
      console.log('   No data-testid success message found, trying by text content...');
      try {
        // Try to find success message by text content
        await driver.wait(
          until.elementLocated(
            By.xpath("//span[contains(text(), 'Mood saved') or contains(text(), 'saved successfully')]")
          ), 
          5000
        );
        console.log('   ✅ Success message found by text content!');
      } catch (innerError) {
        console.log('   No explicit success message found, checking if mood was added to list...');
        
        // Alternative: check if the mood list has one more entry
        const updatedMoods = await driver.findElements(By.xpath("//div[contains(@class, 'card-hover') and contains(@class, 'border')]"));
        
        if (updatedMoods.length > initialMoodCount) {
          console.log(`   ✅ Mood count increased: ${initialMoodCount} -> ${updatedMoods.length}`);
        } else {
          // Take screenshot for debugging
          const screenshot = await driver.takeScreenshot();
          require('fs').writeFileSync('submit-result.png', screenshot, 'base64');
          
          // Check if there's any error message on the page by data-testid
          try {
            const errorMsg = await driver.findElement(By.css('[data-testid="mood-error-message"]'));
            const errorText = await errorMsg.getText();
            console.log(`   ⚠️ Error message found by data-testid: ${errorText}`);
          } catch (dataTestIdError) {
            // Try to find error by class or text
            try {
              const errorMsg = await driver.findElement(By.xpath("//*[contains(@class, 'text-red') or contains(@class, 'error')]"));
              const errorText = await errorMsg.getText();
              console.log(`   ⚠️ Error message found by class: ${errorText}`);
            } catch (errorFindError) {
              // No error message found
              console.log('   No error message found on the page');
            }
          }
          
          throw new Error('Mood was not saved: no success message and mood count did not increase');
        }
      }
    }
    console.log('   Success message found');
    
    // Wait a bit more for UI to update
    await driver.sleep(2000);    // Count moods after adding new one
    console.log('✅ Verifying mood was added to list...');
    const updatedMoods = await driver.findElements(By.xpath("//div[contains(@class, 'mood-card') or contains(@class, 'card-hover')] | //div[contains(., 'mood')] | //li[contains(@class, 'mood')]"));
    const finalMoodCount = updatedMoods.length;
    console.log(`   Final mood count: ${finalMoodCount}`);
    
    // Check if mood was added successfully
    if (finalMoodCount > initialMoodCount) {
      console.log('✓ Test 5 Passed: Mood was successfully added to the list');
      console.log(`   Mood count increased from ${initialMoodCount} to ${finalMoodCount}`);
      
      // Try to find the specific mood we just added
      try {
        const newMoodElement = await driver.findElement(By.xpath("//p[contains(@class, 'text-lg') and contains(@class, 'font-bold') and contains(text(), 'Happy')] | //p[contains(text(), 'Test mood entry')]"));
        const moodText = await newMoodElement.getText();
        console.log(`   New mood found: "${moodText}"`);
      } catch (e) {
        console.log('   Mood added but specific text not found in list');
      }
    } else {
      throw new Error(`Mood was not added to list. Count remained ${finalMoodCount}`);
    }
    
  } catch (error) {
    console.log('✗ Test 5 Failed:', error.message);
    
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

test5();
