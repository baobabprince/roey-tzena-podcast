import { Storage } from './index';
import * as fs from 'fs';
import * as path from 'path';

describe('Storage', () => {
  const testDbPath = path.join(__dirname, '../../test-db.json');

  beforeEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  afterAll(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it('should save and load posts', async () => {
    const storage = new Storage(testDbPath);
    const posts = [
      {
        id: 'post-1',
        text: 'Hello world',
        date: new Date(),
        url: 'https://fb.com/1',
        comments: [],
        audioUrl: 'https://audio.com/1.mp3',
        title: 'Custom Title',
        sourceUrl: 'https://notebooklm.google.com/123'
      }
    ];

    await storage.savePosts(posts);
    const loadedPosts = await storage.loadPosts();
    expect(loadedPosts).toHaveLength(1);
    expect(loadedPosts[0].id).toBe('post-1');
    expect(loadedPosts[0].date).toBeInstanceOf(Date);
    expect(loadedPosts[0].title).toBe('Custom Title');
    expect(loadedPosts[0].sourceUrl).toBe('https://notebooklm.google.com/123');
  });

  it('should return empty array if file does not exist', async () => {
    const storage = new Storage(testDbPath);
    const loadedPosts = await storage.loadPosts();
    expect(loadedPosts).toEqual([]);
  });

  it('should identify if a post is already processed', async () => {
    const storage = new Storage(testDbPath);
    const posts = [{ id: 'post-1', text: '', date: new Date(), url: '', comments: [] }];
    await storage.savePosts(posts);
    
    expect(await storage.isProcessed('post-1')).toBe(true);
    expect(await storage.isProcessed('post-2')).toBe(false);
  });
});
