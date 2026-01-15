import { chromium, Browser, Page } from 'playwright';
import { extractAudioFromNotebookLM } from './notebooklm';

describe('NotebookLM Extractor', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  }, 30000);

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  }, 30000);

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  it('should extract audio URL and title from a mock NotebookLM page', async () => {
    // We'll use a data URL to simulate the page content if possible, 
    // or just set content after navigation if extractAudioFromNotebookLM allows it.
    // For now, let's assume we can mock the page behavior or that it uses specific selectors.
    
    // NotebookLM often has an <audio> tag with a src, and a title in some header.
    const mockHtml = `
      <html>
        <head><title>Mock Notebook Title</title></head>
        <body>
          <h1 id="notebook-title">The Real Title</h1>
          <audio src="https://example.com/audio.mp3"></audio>
        </body>
      </html>
    `;
    
    // We need to override page.goto to not actually navigate or use setContent
    // Since extractAudioFromNotebookLM calls page.goto, we might need to mock it.
    
    const originalGoto = page.goto.bind(page);
    page.goto = jest.fn().mockImplementation(async (url) => {
      await page.setContent(mockHtml);
      return null;
    });

    const result = await extractAudioFromNotebookLM(page, 'https://notebooklm.google.com/test');
    
    expect(result.audioUrl).toBe('https://example.com/audio.mp3');
    expect(result.title).toBe('The Real Title');
  }, 30000);

  it('should inject cookies if GOOGLE_COOKIES env var is set', async () => {
    const mockCookies = [
      { name: 'test-cookie', value: 'test-value', domain: '.google.com', path: '/' }
    ];
    process.env.GOOGLE_COOKIES = JSON.stringify(mockCookies);

    const context = page.context();
    const addCookiesSpy = jest.spyOn(context, 'addCookies').mockResolvedValue(undefined);
    
    page.goto = jest.fn().mockImplementation(async (url) => {
      await page.setContent('<html><body><h1 id="notebook-title">Title</h1><audio src="url"></audio></body></html>');
      return null;
    });

    await extractAudioFromNotebookLM(page, 'https://notebooklm.google.com/test');
    
    expect(addCookiesSpy).toHaveBeenCalledWith(mockCookies);
    
    addCookiesSpy.mockRestore();
    delete process.env.GOOGLE_COOKIES;
  }, 30000);

  it('should not throw if GOOGLE_COOKIES is invalid JSON', async () => {
    process.env.GOOGLE_COOKIES = 'invalid-json';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    page.goto = jest.fn().mockImplementation(async (url) => {
      await page.setContent('<html><body><h1 id="notebook-title">Title</h1><audio src="url"></audio></body></html>');
      return null;
    });

    await extractAudioFromNotebookLM(page, 'https://notebooklm.google.com/test');
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to parse or add GOOGLE_COOKIES:'), expect.any(Error));
    
    consoleSpy.mockRestore();
    delete process.env.GOOGLE_COOKIES;
  }, 30000);

  it('should retry once on failure', async () => {
    let callCount = 0;
    page.goto = jest.fn().mockImplementation(async (url) => {
      callCount++;
      if (callCount === 1) {
        throw new Error('Network error');
      }
      await page.setContent(`
        <html><body>
          <h1 id="notebook-title">Retry Title</h1>
          <audio src="https://example.com/retry.mp3"></audio>
        </body></html>
      `);
      return null;
    });

    const result = await extractAudioFromNotebookLM(page, 'https://notebooklm.google.com/test');
    expect(callCount).toBe(2);
    expect(result.audioUrl).toBe('https://example.com/retry.mp3');
  }, 30000);

  it('should throw error after two failed attempts', async () => {
    let callCount = 0;
    page.goto = jest.fn().mockImplementation(async (url) => {
      callCount++;
      throw new Error('Persistent error');
    });

    await expect(extractAudioFromNotebookLM(page, 'https://notebooklm.google.com/test'))
      .rejects.toThrow('Persistent error');
    expect(callCount).toBe(2);
  }, 30000);
});
