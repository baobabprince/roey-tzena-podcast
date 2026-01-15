import { chromium, Browser, Page } from 'playwright';
import { extractPosts } from './extractor';

describe('Extractor', () => {
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
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
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

  it('should extract audio links from comments', async () => {
    const html = `
      <html><body>
      <div role="article">
         <div data-ad-preview="message">Post with audio</div>
         <a href="/post/123" aria-label="Jan 14">Jan 14</a>
         <div class="comment">
            <span>Here is the audio summary: https://audio-host.com/summary.mp3</span>
         </div>
      </div>
      </body></html>
    `;
    await page.setContent(html);
    const posts = await extractPosts(page);
    expect(posts).toHaveLength(1);
    expect(posts[0]!.comments.length).toBeGreaterThan(0);
    expect(posts[0]?.audioUrl).toBe('https://audio-host.com/summary.mp3');
  }, 30000);

  it('should extract .wav audio links from comments', async () => {
    const html = `
      <html><body>
      <div role="article">
         <div data-ad-preview="message">Post with wav audio</div>
         <a href="/post/124" aria-label="Jan 14">Jan 14</a>
         <div class="comment">
            <span>Audio here: https://audio-host.com/summary.wav</span>
         </div>
      </div>
      </body></html>
    `;
    await page.setContent(html);
    const posts = await extractPosts(page);
    expect(posts).toHaveLength(1);
    expect(posts[0]?.audioUrl).toBe('https://audio-host.com/summary.wav');
  }, 30000);
});
