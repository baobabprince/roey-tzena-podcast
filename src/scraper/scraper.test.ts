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

  it('should wait for a random duration within a range', async () => {
    // We'll mock waitForTimeout on the page
    const waitForTimeoutMock = jest.fn();
    (mockPage as any).waitForTimeout = waitForTimeoutMock;

    await scraper.wait(100, 200);

    expect(waitForTimeoutMock).toHaveBeenCalled();
    const delay = waitForTimeoutMock.mock.calls[0][0];
    expect(delay).toBeGreaterThanOrEqual(100);
    expect(delay).toBeLessThanOrEqual(200);
  });
});
