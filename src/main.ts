import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { Scraper } from './scraper';
import { Storage } from './storage';
import { Downloader } from './storage/downloader';
import { Orchestrator } from './orchestrator';

async function main() {
  const FACEBOOK_URL = process.env.FACEBOOK_URL || 'https://www.facebook.com/roey.tzezana';
  const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/audio/';
  const RSS_OUTPUT = process.env.RSS_OUTPUT || path.join(DATA_DIR, 'podcast.xml');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const audioDir = path.join(DATA_DIR, 'audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });
  const page = await context.newPage();

  const scraper = new Scraper(page);
  const storage = new Storage(path.join(DATA_DIR, 'db.json'));
  const downloader = new Downloader(audioDir);

  const orchestrator = new Orchestrator(scraper, storage, downloader, {
    title: 'Roey Tzezana Podcast',
    description: 'Audio summaries of Roey Tzezana Facebook posts',
    siteUrl: FACEBOOK_URL,
    author: 'Roey Tzezana',
    baseUrl: BASE_URL
  });

  try {
    await orchestrator.run(FACEBOOK_URL, RSS_OUTPUT);
    console.log('Successfully updated podcast feed.');
  } catch (error) {
    console.error('Error during execution:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

export { main };
