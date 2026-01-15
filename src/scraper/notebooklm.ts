import { Page } from 'playwright';

export interface NotebookLMExtraction {
  audioUrl: string;
  title: string;
}

export async function extractAudioFromNotebookLM(page: Page, url: string): Promise<NotebookLMExtraction> {
  const maxRetries = 1;
  let lastError: Error | undefined;

  // Handle cookies if provided via environment variable
  if (process.env.GOOGLE_COOKIES) {
    try {
      const cookies = JSON.parse(process.env.GOOGLE_COOKIES);
      await page.context().addCookies(cookies);
    } catch (e) {
      console.error('Failed to parse or add GOOGLE_COOKIES:', e);
    }
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await page.goto(url, { waitUntil: 'networkidle' });

      // Wait for the audio element to ensure page content is loaded
      const audioHandle = await page.waitForSelector('audio', { state: 'attached', timeout: 5000 });
      if (!audioHandle) throw new Error('Audio element not found');

      const audioUrl = await audioHandle.getAttribute('src');
      
      // Try to find the title
      const titleHandle = await page.$('h1');
      const title = await titleHandle?.innerText();

      if (!audioUrl) throw new Error('Audio source not found');
      if (!title) throw new Error('Title not found');

      return { audioUrl, title };

    } catch (error) {
      lastError = error as Error;
      // If we have retries left, continue to next iteration
      if (attempt < maxRetries) {
        continue;
      }
    }
  }

  throw lastError || new Error('Failed to extract from NotebookLM');
}