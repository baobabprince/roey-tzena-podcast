import { Downloader } from './downloader';
import * as fs from 'fs';
import * as path from 'path';

describe('Downloader', () => {
  const testDownloadDir = path.join(__dirname, '../../test-downloads');

  beforeAll(() => {
    if (!fs.existsSync(testDownloadDir)) {
      fs.mkdirSync(testDownloadDir);
    }
  });

  afterAll(() => {
    if (fs.existsSync(testDownloadDir)) {
      fs.rmSync(testDownloadDir, { recursive: true, force: true });
    }
  });

  it('should download a file and return local path', async () => {
    const downloader = new Downloader(testDownloadDir);
    // Use a small public file for testing if possible, or mock fetch
    // For now, let's mock the internal fetch-like behavior or use a known small file.
    // Actually, it's better to mock the actual download logic for unit tests.
    const mockDownload = jest.spyOn(downloader as any, 'downloadUrl').mockResolvedValue(Buffer.from('mock audio content'));
    
    const localPath = await downloader.download('https://example.com/audio.mp3', 'post-1');
    
    expect(localPath).toContain('post-1.mp3');
    expect(fs.existsSync(localPath)).toBe(true);
    expect(fs.readFileSync(localPath).toString()).toBe('mock audio content');
  });

  it('should detect file extension from URL', async () => {
     const downloader = new Downloader(testDownloadDir);
     expect((downloader as any).getExtension('https://site.com/file.wav')).toBe('.wav');
     expect((downloader as any).getExtension('https://site.com/file.MP3?query=1')).toBe('.mp3');
     expect((downloader as any).getExtension('https://site.com/no-ext')).toBe('.mp3'); // default
  });
});
