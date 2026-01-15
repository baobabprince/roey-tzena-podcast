import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import { Post } from '../types';

export class Storage {
  constructor(private dbPath: string) {}

  async loadPosts(): Promise<Post[]> {
    if (!existsSync(this.dbPath)) {
      return [];
    }
    const data = await fs.readFile(this.dbPath, 'utf-8');
    try {
      const posts = JSON.parse(data);
      return posts.map((p: any) => ({
        ...p,
        date: new Date(p.date)
      }));
    } catch (e) {
      console.error('Error parsing storage file, returning empty array.', e);
      return [];
    }
  }

  async savePosts(posts: Post[]): Promise<void> {
    const existingPosts = await this.loadPosts();
    const existingIds = new Set(existingPosts.map(p => p.id));
    
    const newPosts = posts.filter(p => !existingIds.has(p.id));
    const allPosts = [...existingPosts, ...newPosts];
    
    await fs.writeFile(this.dbPath, JSON.stringify(allPosts, null, 2), 'utf-8');
  }

  async isProcessed(postId: string): Promise<boolean> {
    const posts = await this.loadPosts();
    return posts.some(p => p.id === postId);
  }
}
