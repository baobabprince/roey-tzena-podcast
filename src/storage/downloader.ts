import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';

export class Downloader {
  constructor(private downloadDir: string) {
    if (!existsSync(this.downloadDir)) {
      // Note: sync version in constructor for simplicity, 
      // but usually better handled in init or async
    }
  }

  async download(url: string, fileNameBase: string): Promise<string> {
    const ext = this.getExtension(url);
    const fileName = `${fileNameBase}${ext}`;
    const filePath = path.join(this.downloadDir, fileName);

    if (existsSync(filePath)) {
      return filePath;
    }

    const buffer = await this.downloadUrl(url);
    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  private async downloadUrl(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download ${url}: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private getExtension(url: string): string {
    const urlPath = new URL(url).pathname;
    const match = urlPath.match(/\.(mp3|wav|m4a|ogg)$/i);
    return match ? match[0].toLowerCase() : '.mp3';
  }
}
