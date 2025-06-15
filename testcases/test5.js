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
  
  try {
    // Navigate to homepage and login
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
      } catch (e) {
        const loginLink = await driver.findElement(By.xpath("//*[contains(text(), 'Login') or contains(text(), 'Sign in') or contains(text(), 'Already have an account')]"));
        await driver.executeScript("arguments[0].click();", loginLink);
        await driver.wait(until.elementLocated(By.id('email')), 5000);
      }
      
      // Login with test credentials
      await driver.findElement(By.id('email')).sendKeys('test@example.com');
      await driver.findElement(By.id('password')).sendKeys('password123');
      
      const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Sign In') or @type='submit']"));
      await driver.executeScript("arguments[0].click();", submitButton);
      
      // Wait for login to complete
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'My Moods') or contains(text(), 'Profile')]")), 10000);
      console.log('✓ Login completed');
    } else {
      console.log('✓ Already logged in');
    }
    
    // Navigate to mood tab
    console.log('📝 Navigating to mood tab...');
    await driver.get('http://localhost:3000?tab=mood');
    await driver.sleep(1000);
    
    // Count existing moods in the journey list before adding new one
    console.log('📊 Counting existing moods in journey list...');
    const existingMoods = await driver.findElements(By.xpath("//div[contains(@class, 'card-hover') and contains(@class, 'border')]"));
    const initialMoodCount = existingMoods.length;
    console.log(`   Initial mood count: ${initialMoodCount}`);
      // Select a mood using the provided XPath
    console.log('😊 Selecting mood...');
    const moodButton = await driver.wait(until.elementLocated(By.xpath('/html/body/div/main/div/div[2]/div[1]/div[2]/form/div[1]/div/button[1]')), 10000);
    await driver.executeScript("arguments[0].scrollIntoView(true);", moodButton);
    await driver.executeScript("arguments[0].click();", moodButton);
    console.log('   ✓ Mood selected');
    
    // Add optional note
    try {
      const noteField = await driver.findElement(By.id('note'));
      await noteField.sendKeys('Test mood entry for journey list');
      console.log('   ✓ Note added');
    } catch (e) {
      console.log('   Note field not found, continuing...');
    }    // Submit the mood form
    console.log('💾 Saving mood...');
    const saveButton = await driver.findElement(By.xpath('/html/body/div/main/div/div[1]/div[1]/div/div[2]/form/button'));
    await driver.executeScript("arguments[0].scrollIntoView(true);", saveButton);
    await driver.executeScript("arguments[0].click();", saveButton);
    
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
    const updatedMoods = await driver.findElements(By.xpath("//div[contains(@class, 'card-hover') and contains(@class, 'border')]"));
    const finalMoodCount = updatedMoods.length;
    console.log(`   Final mood count: ${finalMoodCount}`);
    
    if (finalMoodCount > initialMoodCount) {
      console.log('✓ Test 5 Passed: Mood was successfully added to the mood journey list');
      console.log(`   Mood count increased from ${initialMoodCount} to ${finalMoodCount}`);
      
      // Try to find the newly added mood entry
      try {
        const latestMood = updatedMoods[0]; // First item should be the latest
        const moodText = await latestMood.getText();
        console.log(`   Latest mood entry: "${moodText.substring(0, 100)}..."`);
      } catch (e) {
        console.log('   Mood added successfully but couldn\'t read details');
      }
    } else {
      throw new Error(`Mood was not added to journey list. Count remained ${finalMoodCount}`);
    }
    
  } catch (error) {
    console.log('✗ Test 5 Failed:', error.message);
    
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

test5();
