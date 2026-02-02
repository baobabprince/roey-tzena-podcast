import { StealthBrowser, randomDelay } from './browser';
import { loginToGoogle } from './notebook_login';

async function main() {
  const browser = new StealthBrowser({ headless: false }); // Headless false to see it in action (optional)
  
  try {
    console.log('Launching Stealth Browser...');
    await browser.launch();
    const context = await browser.createContext();
    const { page, cursor } = await browser.createPage(context);

    await loginToGoogle(page, cursor);

    console.log('Login sequence finished. Navigating to NotebookLM...');
    await randomDelay(2000, 5000);
    
    await page.goto('https://notebooklm.google.com/', { waitUntil: 'networkidle' });
    console.log('NotebookLM Page Title:', await page.title());

    // Further scraping logic would go here
    
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

main();
