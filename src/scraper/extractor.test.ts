import { chromium, Browser, Page } from 'playwright';
import { extractPosts } from './extractor';

describe('Extractor', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  it('should extract posts from a page', async () => {
    const html = `
      <div role="article">
         <div data-ad-preview="message">This is a post</div>
         <a href="/post/123" aria-label="Jan 14">Jan 14</a>
      </div>
    `;
    await page.setContent(html);
    const posts = await extractPosts(page);
    expect(posts).toHaveLength(1);
    expect(posts[0]?.text).toContain('This is a post');
  }, 30000);
});
