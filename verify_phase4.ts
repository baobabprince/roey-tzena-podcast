
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

async function verify() {
  console.log('Starting Phase 4 Manual Verification...');
  
  const testDataDir = path.join(__dirname, 'prod-verify');
  const rssPath = path.join(testDataDir, 'podcast.xml');

  // Clean up previous run
  if (fs.existsSync(testDataDir)) {
    fs.rmSync(testDataDir, { recursive: true, force: true });
  }

  console.log('Running the application via npm start with custom environment variables...');
  
  // We use a mock-like behavior by pointing it to a local file or just running it 
  // with a very small range if possible. 
  // However, for this verification, we just want to see if it starts and creates the directory.
  
  try {
    // We'll set a very short timeout or use a mock URL to avoid long hangs during verification
    // Actually, let's just check if it can be called and if it initializes the data dir.
    execSync('npm start', {
      env: {
        ...process.env,
        DATA_DIR: testDataDir,
        FACEBOOK_URL: 'https://example.com', // Dummy URL to fail fast or just test init
        RSS_OUTPUT: rssPath,
        CI: 'true'
      },
      stdio: 'inherit',
      timeout: 10000 // 10 seconds
    });
  } catch (e: any) {
    // It might fail because of the dummy URL, but we check if it created the directory
    console.log('Process exited (expectedly or not). Checking side effects...');
  }

  console.log('\n--- Verification Results ---');
  const dirCreated = fs.existsSync(testDataDir);
  console.log(`Data Directory Created: ${dirCreated ? 'YES' : 'NO'}`);
  
  const audioDirCreated = fs.existsSync(path.join(testDataDir, 'audio'));
  console.log(`Audio Directory Created: ${audioDirCreated ? 'YES' : 'NO'}`);

  // Check if GitHub Action file exists
  const gaExists = fs.existsSync('.github/workflows/scrape.yml');
  console.log(`GitHub Action Workflow: ${gaExists ? 'EXISTS' : 'MISSING'}`);

  console.log('\nVerification complete.');
}

verify().catch(console.error);
