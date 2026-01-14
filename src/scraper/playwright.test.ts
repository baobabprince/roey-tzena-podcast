import { chromium } from 'playwright';

describe('Playwright Configuration', () => {
  it('should be able to launch a browser', async () => {
    const browser = await chromium.launch({ headless: true });
    expect(browser).toBeDefined();
    await browser.close();
  }, 30000);
});
