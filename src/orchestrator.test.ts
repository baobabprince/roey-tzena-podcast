import { Orchestrator } from './orchestrator';
import { Scraper } from './scraper';
import { Storage } from './storage';
import { Downloader } from './storage/downloader';
import * as fs from 'fs';
import * as path from 'path';

describe('Orchestrator', () => {
  const testDir = path.join(__dirname, '../test-orchestrator');
  const dbPath = path.join(testDir, 'db.json');
  const audioDir = path.join(testDir, 'audio');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);
    if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir);
  });

  afterAll(() => {
    if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('should run the full cycle and produce podcast.xml', async () => {
    // Mock dependencies
    const mockPosts = [
      {
        id: 'p1',
        text: 'Post 1',
        date: new Date().toISOString(),
        url: 'https://fb.com/p1',
        comments: [],
        audioUrl: 'https://example.com/a1.mp3'
      }
    ];

    const mockScraper = {
      navigate: jest.fn(),
      extract: jest.fn().mockResolvedValue(mockPosts)
    } as any;

    const storage = new Storage(dbPath);
    const downloader = new Downloader(audioDir);
    // Mock downloader.download to avoid network
    jest.spyOn(downloader, 'download').mockResolvedValue(path.join(audioDir, 'p1.mp3'));

    const orchestrator = new Orchestrator(mockScraper, storage, downloader, {
      title: 'Test Podcast',
      description: 'Test',
      siteUrl: 'https://test.com',
      author: 'Tester',
      baseUrl: 'https://my-host.com/audio/'
    });

    const xmlPath = path.join(testDir, 'podcast.xml');
    await orchestrator.run('https://facebook.com/target', xmlPath);

    expect(fs.existsSync(xmlPath)).toBe(true);
    const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
    expect(xmlContent).toContain('<title>Test Podcast</title>');
    expect(xmlContent).toContain('https://my-host.com/audio/p1.mp3');
  });
});
