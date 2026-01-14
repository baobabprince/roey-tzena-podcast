import { Page } from 'playwright';
import { Post, Comment } from '../types';

export async function extractPosts(page: Page): Promise<Post[]> {
  const rawPosts = await page.$$eval('[role="article"]', (articles) => {
    return articles.map((article, i) => {
      const text = article.querySelector('[data-ad-preview="message"]')?.textContent || '';
      // Try both class and aria-label for comments to be robust
      const comments = Array.from(article.querySelectorAll('.comment, [aria-label="Comment"]'));
      
      const extractedComments = comments.map((c, j) => ({
        id: `comment-${j}`,
        author: 'Unknown',
        text: c.textContent?.trim() || '',
        dateString: new Date().toISOString()
      }));
      
      let audioUrl = undefined;
      // Audio patterns to look for
      const audioRegex = /(https?:\/\/[^\s]+\.(mp3|wav|m4a|ogg))/i;
      
      for (const comment of extractedComments) {
        const match = comment.text.match(audioRegex);
        if (match) {
          audioUrl = match[0];
          break;
        }
      }

      return {
        id: `post-${i}`,
        text: text.trim(),
        dateString: new Date().toISOString(),
        url: '',
        comments: extractedComments,
        audioUrl
      };
    });
  });

  return rawPosts.map(p => {
    const post: Post = {
      id: p.id,
      text: p.text,
      date: new Date(p.dateString),
      url: p.url,
      comments: p.comments.map(c => ({
        id: c.id,
        author: c.author,
        text: c.text,
        date: new Date(c.dateString)
      }))
    };
    if (p.audioUrl) {
      post.audioUrl = p.audioUrl;
    }
    return post;
  });
}
