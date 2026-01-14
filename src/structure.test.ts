import * as fs from 'fs';
import * as path from 'path';

describe('Project Structure', () => {
  const dirs = ['scraper', 'feed', 'storage'];

  dirs.forEach(dir => {
    it(`should have src/${dir} directory`, () => {
      const dirPath = path.join(__dirname, dir);
      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.lstatSync(dirPath).isDirectory()).toBe(true);
    });
  });
});
