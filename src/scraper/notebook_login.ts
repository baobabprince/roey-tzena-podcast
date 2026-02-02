import { Page } from 'playwright';
import { GhostCursor } from 'ghost-cursor';
import { randomDelay } from './browser';

export async function loginToGoogle(page: Page, cursor: GhostCursor) {
    const email = process.env.GOOGLE_EMAIL;
    const password = process.env.GOOGLE_PASSWORD; // Note: NOT APP PASSWORD, but real password for web login

    if (!email || !password) {
        throw new Error('GOOGLE_EMAIL and GOOGLE_PASSWORD environment variables are required.');
    }

    console.log('Navigating to Google Sign In...');
    await page.goto('https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn&flowEntry=ServiceLogin', { waitUntil: 'networkidle' });
    
    // Email
    try {
        console.log('Entering email...');
        await page.waitForSelector('input[type="email"]', { state: 'visible', timeout: 10000 });
        await cursor.move('input[type="email"]');
        await cursor.click('input[type="email"]');
        await randomDelay(500, 1000);
        await page.keyboard.type(email, { delay: Math.floor(Math.random() * 100) + 50 }); // Random typing speed
        await randomDelay(500, 1000);
        
        await cursor.move('#identifierNext');
        await cursor.click('#identifierNext');
        
        // Wait for password field or error
        await Promise.race([
            page.waitForSelector('input[type="password"]', { state: 'visible' }),
            page.waitForSelector('#passwordNext', { state: 'visible' }) // Sometimes password field is already there but hidden?
        ]);
        
        await randomDelay(1500, 2500); // Pause like a human reading/thinking

        // Password
        console.log('Entering password...');
        await page.waitForSelector('input[type="password"]', { state: 'visible', timeout: 10000 });
        await cursor.move('input[type="password"]');
        await cursor.click('input[type="password"]');
        await randomDelay(500, 1000);
        await page.keyboard.type(password, { delay: Math.floor(Math.random() * 100) + 50 });
        await randomDelay(500, 1000);
        
        await cursor.move('#passwordNext');
        await cursor.click('#passwordNext');
        
        await page.waitForNavigation({ waitUntil: 'networkidle' });
        console.log('Login attempt submitted. Current URL:', page.url());
        
        // Check for common post-login hurdles
        if (page.url().includes('challenge')) {
            console.warn('Google is asking for a challenge/2FA. Manual intervention or advanced handling required.');
            // Here we would implement the MFA handling from research.md (e.g. checking email for code)
        }

    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
}
