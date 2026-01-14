import { Page } from 'playwright';
import { Post } from '../types';

export async function extractPosts(page: Page): Promise<Post[]> {
  const articles = page.locator('[role="article"]');
  const count = await articles.count();
  const posts: Post[] = [];

  for (let i = 0; i < count; i++) {
    const article = articles.nth(i);
    const text = await article.locator('[data-ad-preview="message"]').textContent().catch(() => '') || '';
    
    posts.push({
      id: `post-${i}`,
      text: text.trim(),
      date: new Date(),
      url: '',
      comments: []
    });
  }
  return posts;
}