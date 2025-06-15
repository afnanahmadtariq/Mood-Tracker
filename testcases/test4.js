const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function test4() {
  console.log('Starting Test 4: Save a mood -> Mood is added to list');
  
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
    const isLoggedIn = await driver.findElements(By.xpath("//*[contains(text(), 'Mood') and (contains(text(), 'Track') or contains(text(), 'Add'))]"));
    
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
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Mood')]")), 10000);
    }
    
    // Navigate to mood tracking page (should be default or click Mood tab)
    console.log('😊 Navigating to mood tracking...');
    try {
      const moodTab = await driver.findElement(By.xpath("//*[contains(text(), 'Mood') and not(contains(text(), 'Tracker'))]"));
      await moodTab.click();
    } catch (e) {
      // Already on mood page
    }
    
    // Count existing moods before adding new one
    console.log('📊 Counting existing moods...');
    const existingMoods = await driver.findElements(By.xpath("//*[contains(@class, 'mood') or contains(text(), '😊') or contains(text(), '😢') or contains(text(), '😡') or contains(text(), '😴')]"));
    const initialMoodCount = existingMoods.length;
    console.log(`   Initial mood count: ${initialMoodCount}`);
    
    // Fill out mood form
    console.log('📝 Adding a new mood...');
    
    // Select a mood (look for mood buttons/selectors)
    const moodSelector = await driver.findElement(By.xpath("//button[contains(text(), 'Happy') or contains(text(), '😊') or contains(@class, 'mood')] | //select[@name='mood'] | //input[@name='mood']"));
    await moodSelector.click();
    
    // If it's a dropdown, select an option
    try {
      const happyOption = await driver.findElement(By.xpath("//option[contains(text(), 'Happy')] | //button[contains(text(), 'Happy')]"));
      await happyOption.click();
    } catch (e) {
      // Already selected or different UI pattern
    }
    
    // Add a note if there's a note field
    try {
      const noteField = await driver.findElement(By.xpath("//textarea[@name='note'] | //input[@name='note'] | //textarea[contains(@placeholder, 'note')]"));
      await noteField.sendKeys('Test mood entry from automated test');
    } catch (e) {
      console.log('   No note field found, continuing...');
    }
    
    // Submit the mood
    console.log('🚀 Submitting mood entry...');
    const submitMoodButton = await driver.findElement(By.xpath("//button[contains(text(), 'Save') or contains(text(), 'Add') or contains(text(), 'Track') or @type='submit']"));
    await submitMoodButton.click();
    
    // Wait for mood to be saved and page to update
    console.log('⏳ Waiting for mood to be saved...');
    await driver.sleep(2000); // Give time for the mood to be processed
    
    // Check for success feedback
    try {
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'saved') or contains(text(), 'added') or contains(text(), 'success') or contains(@class, 'success')]")), 5000);
      console.log('   ✓ Success message found');
    } catch (e) {
      console.log('   No explicit success message, checking mood list...');
    }
    
    // Count moods after adding new one
    console.log('✅ Verifying mood was added to list...');
    await driver.sleep(1000); // Allow time for UI to update
    
    const updatedMoods = await driver.findElements(By.xpath("//*[contains(@class, 'mood') or contains(text(), 'Happy') or contains(text(), 'Test mood entry')]"));
    const finalMoodCount = updatedMoods.length;
    console.log(`   Final mood count: ${finalMoodCount}`);
    
    // Check if mood was added successfully
    if (finalMoodCount > initialMoodCount) {
      console.log('✓ Test 4 Passed: Mood was successfully added to the list');
      console.log(`   Mood count increased from ${initialMoodCount} to ${finalMoodCount}`);
      
      // Try to find the specific mood we just added
      try {
        const newMoodElement = await driver.findElement(By.xpath("//*[contains(text(), 'Test mood entry') or contains(text(), 'Happy')]"));
        const moodText = await newMoodElement.getText();
        console.log(`   New mood found: "${moodText}"`);
      } catch (e) {
        console.log('   Mood added but specific text not found in list');
      }
    } else {
      throw new Error(`Mood was not added to list. Count remained ${finalMoodCount}`);
    }
    
  } catch (error) {
    console.log('✗ Test 4 Failed:', error.message);
    
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

test4();
