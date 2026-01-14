import { Page } from 'playwright';

export class Scraper {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(url: string): Promise<void> {
    await this.page.goto(url);
  }
}
