import { chromium } from 'playwright-extra';
import { Browser, Page, BrowserContext } from 'playwright';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import { createCursor, GhostCursor } from 'ghost-cursor';

// Register the stealth plugin
chromium.use(stealthPlugin());

export interface BrowserConfig {
  headless?: boolean;
  proxy?: {
    server: string;
    username?: string;
    password?: string;
  };
  userDataDir?: string;
}

export class StealthBrowser {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  constructor(private config: BrowserConfig = {}) {}

  async launch(): Promise<void> {
    const launchOptions: any = {
      headless: this.config.headless ?? true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
        '--disable-blink-features=AutomationControlled', // Key for stealth
      ]
    };

    if (this.config.proxy) {
      launchOptions.proxy = this.config.proxy;
    }

    this.browser = await chromium.launch(launchOptions);
  }

  async createContext(): Promise<BrowserContext> {
    if (!this.browser) {
      throw new Error('Browser not launched. Call launch() first.');
    }

    this.context = await this.browser.newContext({
      viewport: { width: 1280 + Math.floor(Math.random() * 100), height: 800 + Math.floor(Math.random() * 100) }, // Randomize viewport slightly
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36', // Should ideally be rotated
      locale: 'en-US',
      timezoneId: 'America/New_York',
      hasTouch: false,
      isMobile: false,
      javaScriptEnabled: true,
    });
    
    // Add init script to further hide webdriver (though stealth plugin handles most)
    await this.context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
        });
    });

    return this.context;
  }

  async createPage(context: BrowserContext): Promise<{ page: Page; cursor: GhostCursor }> {
    const page = await context.newPage();
    const cursor = createCursor(page);
    return { page, cursor };
  }

  async close(): Promise<void> {
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }
}

// Helper for delays
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const randomDelay = (min: number, max: number) => 
  delay(Math.floor(Math.random() * (max - min + 1) + min));
