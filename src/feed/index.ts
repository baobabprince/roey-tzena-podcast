import { Post } from '../types';

export interface FeedConfig {
  title: string;
  description: string;
  siteUrl: string;
  author: string;
}

export async function generateRss(posts: Post[], config: FeedConfig): Promise<string> {
  const items = posts.map(post => {
    const title = post.text.slice(0, 100).replace(/[<>&"']/g, ''); // Simple escape
    const description = post.text.replace(/[<>&"']/g, '');
    const date = new Date(post.date).toUTCString();
    
    return `
    <item>
      <title>${title}</title>
      <link>${post.url}</link>
      <guid isPermaLink="false">${post.id}</guid>
      <pubDate>${date}</pubDate>
      <description>${description}</description>
      <enclosure url="${post.audioUrl}" length="0" type="audio/mpeg" />
      <itunes:author>${config.author}</itunes:author>
      <itunes:summary>${description}</itunes:summary>
    </item>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${config.title}</title>
    <link>${config.siteUrl}</link>
    <language>he</language>
    <copyright>Copyright ${new Date().getFullYear()} ${config.author}</copyright>
    <itunes:author>${config.author}</itunes:author>
    <itunes:summary>${config.description}</itunes:summary>
    <description>${config.description}</description>
    <itunes:owner>
      <itunes:name>${config.author}</itunes:name>
    </itunes:owner>
    <itunes:explicit>no</itunes:explicit>
    <itunes:category text="Technology" />
    ${items}
  </channel>
</rss>`;
}
