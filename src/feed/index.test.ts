import { generateRss } from './index';
import { Post } from '../types';

describe('RSS Generation', () => {
  it('should generate a valid RSS feed string', async () => {
    const posts: Post[] = [
      {
        id: 'post-1',
        text: 'Description of the post',
        date: new Date('2026-01-15T10:00:00Z'),
        url: 'https://facebook.com/post1',
        comments: [],
        audioUrl: 'https://example.com/audio1.mp3'
      }
    ];

    const rss = await generateRss(posts, {
      title: 'Roey Tzezana Podcast',
      description: 'Audio summaries of Roey Tzezana posts',
      siteUrl: 'https://github.com/user/repo',
      author: 'Roey Tzezana'
    });

    expect(rss).toContain('<title>Roey Tzezana Podcast</title>');
    expect(rss).toContain('<item>');
    expect(rss).toContain('<title>Description of the post</title>');
    expect(rss).toContain('<enclosure url="https://example.com/audio1.mp3"');
    expect(rss).toContain('</item>');
    expect(rss).toContain('</rss>');
  });

  it('should handle empty posts list', async () => {
    const rss = await generateRss([], {
      title: 'Empty Feed',
      description: 'No posts',
      siteUrl: 'https://example.com',
      author: 'Tester'
    });
    expect(rss).toContain('<title>Empty Feed</title>');
    expect(rss).not.toContain('<item>');
  });

  it('should truncate long titles from description', async () => {
     const posts: Post[] = [
      {
        id: 'post-1',
        text: 'A'.repeat(200),
        date: new Date('2026-01-15T10:00:00Z'),
        url: 'https://facebook.com/post1',
        comments: [],
        audioUrl: 'https://example.com/audio1.mp3'
      }
    ];
    const rss = await generateRss(posts, { title: 'T', description: 'D', siteUrl: 'S', author: 'A' });
    // Title should be a subset of the long text
    expect(rss).toContain('<title>' + 'A'.repeat(100)); 
  });

  it('should use post title if provided', async () => {
    const posts: Post[] = [
      {
        id: 'post-1',
        text: 'Description of the post',
        date: new Date('2026-01-15T10:00:00Z'),
        url: 'https://facebook.com/post1',
        comments: [],
        audioUrl: 'https://example.com/audio1.mp3',
        title: 'Custom NotebookLM Title'
      }
    ];

    const rss = await generateRss(posts, {
      title: 'Roey Tzezana Podcast',
      description: 'D',
      siteUrl: 'S',
      author: 'A'
    });

    expect(rss).toContain('<title>Custom NotebookLM Title</title>');
  });
});
