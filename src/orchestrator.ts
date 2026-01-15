import * as fs from 'fs/promises';
import * as path from 'path';
import { Scraper } from './scraper';
import { Storage } from './storage';
import { Downloader } from './storage/downloader';
import { generateRss, FeedConfig } from './feed';
import { Post } from './types';

export interface OrchestratorConfig extends FeedConfig {
  baseUrl: string;
}

export class Orchestrator {
  constructor(
    private scraper: Scraper,
    private storage: Storage,
    private downloader: Downloader,
    private config: OrchestratorConfig
  ) {}

  async run(targetUrl: string, outputXmlPath: string): Promise<void> {
    console.log(`Starting scrape of ${targetUrl}...`);
    await this.scraper.navigate(targetUrl);
    const posts = await this.scraper.extract();
    
    console.log(`Found ${posts.length} posts. Processing...`);
    const processedPosts: Post[] = [];

    for (const post of posts) {
      if (post.audioUrl) {
        console.log(`Downloading audio for post: ${post.id}`);
        try {
          const localPath = await this.downloader.download(post.audioUrl, post.id);
          const fileName = path.basename(localPath);
          
          // Create a copy of the post with the new public audio URL
          const publicPost: Post = {
            ...post,
            audioUrl: `${this.config.baseUrl}${fileName}`
          };
          processedPosts.push(publicPost);
        } catch (e) {
          console.error(`Failed to download audio for ${post.id}:`, e);
        }
      }
    }

    console.log(`Saving ${processedPosts.length} posts to storage...`);
    await this.storage.savePosts(processedPosts);

    const allPosts = await this.storage.loadPosts();
    console.log(`Generating RSS feed with ${allPosts.length} total posts...`);
    const rss = await generateRss(allPosts, this.config);
    
    await fs.writeFile(outputXmlPath, rss, 'utf-8');
    console.log(`RSS feed generated at ${outputXmlPath}`);
  }
}
