import { Page } from 'playwright';
import { extractPosts } from './extractor';
import { Post } from '../types';

export class Scraper {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async extract(): Promise<Post[]> {
    return extractPosts(this.page);
  }

  async wait(min: number = 1000, max: number = 3000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await (this.page as any).waitForTimeout(delay);
  }
}
