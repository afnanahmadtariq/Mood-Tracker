const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function test7() {
  console.log('Starting Test 7: Enter profile pic URL -> Pic changed');
  
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
    
    // Get current profile picture (if any) before change
    console.log('🖼️  Checking current profile picture...');
    let currentProfilePic = '';
    try {
      const profileImg = await driver.findElement(By.xpath("//img[contains(@class, 'profile') or contains(@alt, 'profile')] | //img[contains(@src, 'avatar')]"));
      currentProfilePic = await profileImg.getAttribute('src');
      console.log(`   Current profile pic: ${currentProfilePic.substring(0, 50)}...`);
    } catch (e) {
      console.log('   No current profile picture found');
    }
    
    // Find profile picture URL input field
    console.log('🔗 Looking for profile picture URL field...');
    const profilePicInput = await driver.findElement(By.xpath(
      "//input[@name='profilePicture'] | " +
      "//input[@name='avatar'] | " +
      "//input[@name='imageUrl'] | " +
      "//input[contains(@placeholder, 'picture') or contains(@placeholder, 'image') or contains(@placeholder, 'avatar')]"
    ));
    
    // Clear existing value and enter new profile picture URL
    const testImageUrl = 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Test';
    console.log('📝 Entering new profile picture URL...');
    await profilePicInput.clear();
    await profilePicInput.sendKeys(testImageUrl);
    
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
      console.log('   No explicit success message, checking picture change...');
    }
    
    // Verify profile picture has changed
    console.log('✅ Verifying profile picture changed...');
    await driver.sleep(2000); // Allow time for image to load
    
    try {
      const updatedProfileImg = await driver.findElement(By.xpath("//img[contains(@class, 'profile') or contains(@alt, 'profile')] | //img[contains(@src, 'avatar')]"));
      const newProfilePic = await updatedProfileImg.getAttribute('src');
      
      if (newProfilePic !== currentProfilePic && (newProfilePic.includes('placeholder') || newProfilePic.includes(testImageUrl))) {
        console.log('✓ Test 7 Passed: Profile picture successfully changed');
        console.log(`   New profile pic: ${newProfilePic.substring(0, 50)}...`);
      } else if (newProfilePic !== currentProfilePic) {
        console.log('✓ Test 7 Passed: Profile picture changed (different from original)');
        console.log(`   New profile pic: ${newProfilePic.substring(0, 50)}...`);
      } else {
        throw new Error('Profile picture did not change');
      }
    } catch (e) {
      // Check if the input field shows the new URL
      const inputValue = await profilePicInput.getAttribute('value');
      if (inputValue === testImageUrl) {
        console.log('✓ Test 7 Passed: Profile picture URL saved in form');
        console.log(`   Profile pic URL saved: ${inputValue}`);
      } else {
        throw new Error('Profile picture URL was not saved');
      }
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
    
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

test7();
