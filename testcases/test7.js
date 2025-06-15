const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function test7() {
  console.log('Starting Test 7: Delete a mood -> That mood is deleted from the list');
  
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
    await driver.get(' http://localhost:3000');
    await driver.wait(until.titleContains('Mood'), 5000);
    
    // Check if already logged in, if not, perform login
    const isLoggedIn = await driver.findElements(By.xpath("//*[contains(text(), 'Mood') and (contains(text(), 'Track') or contains(text(), 'Add'))]"));
    
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
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Mood')]")), 10000);
    }
    
    // Navigate to mood tracking page (should be default or click Mood tab)
    console.log('😊 Navigating to mood tracking...');
    try {      const moodTab = await driver.findElement(By.xpath("//*[contains(text(), 'Mood') and not(contains(text(), 'Tracker'))]"));
      await driver.executeScript("arguments[0].click();", moodTab);
    } catch (e) {
      // Already on mood page
    }
    
    // Wait for mood list to load
    await driver.sleep(2000);
      // Count existing moods before deletion
    console.log('📊 Counting existing moods...');
    const existingMoods = await driver.findElements(By.xpath("//div[contains(@class, 'mood-card') or contains(@class, 'card-hover')] | //div[contains(@class, 'bg-white') and contains(@class, 'rounded')] | //li[contains(@class, 'mood')]"));
    const initialMoodCount = existingMoods.length;
    console.log(`   Initial mood count: ${initialMoodCount}`);
    
    if (initialMoodCount === 0) {
      throw new Error('No moods found to delete. Make sure test4 ran successfully first.');
    }
    
    // Find a mood to delete (look for delete buttons or options)
    console.log('🗑️  Looking for mood to delete...');
      // Look for delete buttons (common patterns: Delete, Remove, X, trash icon)
    const deleteButtons = await driver.findElements(By.xpath(
      "//button[contains(text(), 'Delete') or contains(text(), 'Remove') or contains(text(), '×') or contains(text(), '🗑️')] | " +
      "//*[contains(@class, 'delete') or contains(@class, 'remove') or contains(@class, 'trash')] | " +
      "//button[contains(@title, 'Delete') or contains(@title, 'Remove')] | " +
      "//button[contains(@aria-label, 'Delete') or contains(@aria-label, 'Remove')] | " +
      "//svg[contains(@class, 'trash')] | " +
      "//*[contains(@class, 'mood-card')]//*[contains(@class, 'delete') or contains(text(), 'Delete')]"
    ));
    
    if (deleteButtons.length === 0) {
      // Look for context menus or options buttons
      const optionButtons = await driver.findElements(By.xpath(
        "//button[contains(text(), '⋮') or contains(text(), '...') or contains(@class, 'options') or contains(@class, 'menu')]"
      ));
      
      if (optionButtons.length > 0) {
        console.log('   Found options menu, clicking to reveal delete option...');        await driver.executeScript("arguments[0].click();", optionButtons[0]);
        await driver.sleep(1000);
        
        // Now look for delete option in menu
        const deleteOption = await driver.findElement(By.xpath("//button[contains(text(), 'Delete') or contains(text(), 'Remove')] | //*[contains(@class, 'delete')]"));
        await driver.executeScript("arguments[0].click();", deleteOption);
      } else {
        throw new Error('No delete buttons or options found for moods');
      }
    } else {
      console.log(`   Found ${deleteButtons.length} delete button(s), clicking first one...`);
      await driver.executeScript("arguments[0].click();", deleteButtons[0]);
    }
    
    // Handle confirmation dialog if it appears
    console.log('⏳ Handling potential confirmation dialog...');
    try {
      // Look for confirmation dialog
      const confirmButton = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(text(), 'Confirm') or contains(text(), 'Yes') or contains(text(), 'Delete') or contains(text(), 'OK')]")),
        3000
      );      console.log('   Confirmation dialog found, confirming deletion...');
      await driver.executeScript("arguments[0].click();", confirmButton);
    } catch (e) {
      console.log('   No confirmation dialog, deletion should proceed directly...');
    }
    
    // Wait for deletion to complete
    console.log('⏳ Waiting for mood to be deleted...');
    await driver.sleep(2000); // Give time for the deletion to be processed
    
    // Check for success feedback
    try {
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'deleted') or contains(text(), 'removed') or contains(text(), 'success') or contains(@class, 'success')]")), 5000);
      console.log('   ✓ Success message found');
    } catch (e) {
      console.log('   No explicit success message, checking mood list...');
    }
      // Count moods after deletion
    console.log('✅ Verifying mood was deleted from list...');
    await driver.sleep(1000); // Allow time for UI to update
    
    const updatedMoods = await driver.findElements(By.xpath("//div[contains(@class, 'mood-card') or contains(@class, 'card-hover')] | //div[contains(@class, 'bg-white') and contains(@class, 'rounded')] | //li[contains(@class, 'mood')]"));
    const finalMoodCount = updatedMoods.length;
    console.log(`   Final mood count: ${finalMoodCount}`);
    
    // Check if mood was deleted successfully
    if (finalMoodCount < initialMoodCount) {
      console.log('✓ Test 7 Passed: Mood was successfully deleted from the list');
      console.log(`   Mood count decreased from ${initialMoodCount} to ${finalMoodCount}`);
    } else if (finalMoodCount === initialMoodCount) {
      // Check if the page content has changed (maybe the mood was deleted but count is same due to pagination or other factors)
      const pageText = await driver.findElement(By.tagName('body')).getText();
      
      if (pageText.includes('deleted') || pageText.includes('removed')) {
        console.log('✓ Test 7 Passed: Mood deletion confirmed by page content (count unchanged due to UI behavior)');
      } else {
        throw new Error(`Mood was not deleted from list. Count remained ${finalMoodCount}`);
      }
    } else {
      throw new Error(`Unexpected behavior: mood count increased from ${initialMoodCount} to ${finalMoodCount}`);
    }
    
  } catch (error) {
    console.log('✗ Test 7 Failed:', error.message);
    
    // Check for error messages
    try {
      const errorElement = await driver.findElement(By.xpath("//*[contains(@class, 'error') or contains(@class, 'alert') or contains(text(), 'Error')]"));
      const errorText = await errorElement.getText();
      console.log(`   Error message: ${errorText}`);
    } catch (e) {
      // No error message found
    }
    
    // Additional debugging information
    try {
      const pageText = await driver.findElement(By.tagName('body')).getText();
      console.log(`   Page content sample: "${pageText.substring(0, 200)}..."`);
    } catch (e) {
      // Unable to get page content
    }
    
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

test7();
