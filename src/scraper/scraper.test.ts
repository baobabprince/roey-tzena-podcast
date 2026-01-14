import { Scraper } from './index';
import { Page } from 'playwright';

describe('Scraper', () => {
  let mockPage: Page;
  let scraper: Scraper;

  beforeEach(() => {
    // Partial mock of Page
    mockPage = {
      goto: jest.fn(),
    } as unknown as Page;
    scraper = new Scraper(mockPage);
  });

  it('should navigate to the given URL', async () => {
    const url = 'https://www.facebook.com/roey.tzezana';
    await scraper.navigate(url);
    expect(mockPage.goto).toHaveBeenCalledWith(url);
  });
});
