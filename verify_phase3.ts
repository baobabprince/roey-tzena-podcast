
import * as fs from 'fs';
import * as path from 'path';
import { Orchestrator } from './src/orchestrator';
import { Storage } from './src/storage';
import { Downloader } from './src/storage/downloader';

async function verify() {
  console.log('Starting Phase 3 Manual Verification...');
  
  const testDir = path.join(__dirname, 'manual-verify-p3');
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);
  const dbPath = path.join(testDir, 'db.json');
  const audioDir = path.join(testDir, 'audio');
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir);
  const xmlPath = path.join(testDir, 'podcast.xml');

  // 1. Mock Scraper
  const mockScraper: any = {
    navigate: async () => console.log('Mock: Navigating to Facebook...'),
    extract: async () => [
      {
        id: 'manual-post-1',
        text: 'Test post for Phase 3 manual verification',
        date: new Date().toISOString(),
        url: 'https://fb.com/manual-1',
        comments: [],
        audioUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' // Just a dummy URL that returns something
      }
    ]
  };

  const storage = new Storage(dbPath);
  const downloader = new Downloader(audioDir);
  
  // Patch downloader to use a mock download if needed, but let's try a real one with a small file
  // Using a small public asset for real verification of the Downloader logic
  const realAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  mockScraper.extract = async () => [
    {
      id: 'manual-post-1',
      text: 'Test post with real audio download',
      date: new Date().toISOString(),
      url: 'https://fb.com/manual-1',
      comments: [],
      audioUrl: realAudioUrl
    }
  ];

  const orchestrator = new Orchestrator(mockScraper, storage, downloader, {
    title: 'Manual Test Podcast',
    description: 'Verifying Phase 3',
    siteUrl: 'https://example.com',
    author: 'Conductor',
    baseUrl: 'http://localhost:8080/audio/'
  });

  console.log('Running orchestrator cycle...');
  await orchestrator.run('https://facebook.com/roey.tzezana', xmlPath);

  // 2. Verification
  console.log('\n--- Verification Results ---');
  
  const dbExists = fs.existsSync(dbPath);
  console.log(`Metadata Storage (db.json): ${dbExists ? 'EXISTS' : 'MISSING'}`);
  
  const audioFiles = fs.readdirSync(audioDir);
  console.log(`Audio Downloads: ${audioFiles.length > 0 ? 'SUCCESS (' + audioFiles[0] + ')' : 'FAILED'}`);
  
  const xmlExists = fs.existsSync(xmlPath);
  console.log(`RSS Feed (podcast.xml): ${xmlExists ? 'EXISTS' : 'MISSING'}`);
  
  if (xmlExists) {
    const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
    const hasItem = xmlContent.includes('<item>');
    const hasAudioLink = xmlContent.includes('http://localhost:8080/audio/manual-post-1.mp3');
    console.log(`RSS Content - Has Item: ${hasItem}`);
    console.log(`RSS Content - Has Local Audio Link: ${hasAudioLink}`);
  }

  // Cleanup instruction
  console.log('\nVerification complete. You can inspect the results in the "manual-verify-p3" directory.');
}

verify().catch(console.error);
