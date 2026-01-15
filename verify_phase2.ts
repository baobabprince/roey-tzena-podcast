
import { chromium } from 'playwright';
import { Scraper } from './src/scraper/index';
import { extractPosts } from './src/scraper/extractor';

async function verify() {
  console.log('Starting Manual Verification...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const scraper = new Scraper(page);
  
  // 1. Verify Navigation and Delay
  console.log('Testing navigation and human-mimicry delay...');
  const start = Date.now();
  await scraper.wait(1000, 2000);
  const duration = Date.now() - start;
  console.log(`Delay lasted ${duration}ms (Expected: 1000-2000ms)`);
  
  // 2. Verify Extraction Logic with mock content
  console.log('Testing extraction logic with mock HTML...');
  const mockHtml = `
    <div role="article">
       <div data-ad-preview="message">Roey Tzezana Post: The Future of AI</div>
       <a href="/post/123" aria-label="Jan 15">Jan 15</a>
       <div class="comment">
          <span>Check out the audio summary: https://example.com/audio/ai-future.mp3</span>
       </div>
    </div>
  `;
  await page.setContent(mockHtml);
  const posts = await extractPosts(page);
  
  if (posts.length === 1 && posts[0]?.audioUrl === 'https://example.com/audio/ai-future.mp3') {
    console.log('SUCCESS: Extractor correctly identified the post and audio link.');
    console.log('Extracted Data:', JSON.stringify(posts, null, 2));
  } else {
    console.log('FAILURE: Extraction failed or produced incorrect results.');
    console.log('Extracted Data:', JSON.stringify(posts, null, 2));
  }

  await browser.close();
}

verify().catch(console.error);
