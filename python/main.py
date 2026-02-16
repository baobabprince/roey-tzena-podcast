
import asyncio
import os
import sys
from datetime import datetime
from twitter_scraper import TwitterScraper
from script_writer import ScriptWriter
from audio_producer import AudioProducer
from rss_manager import RSSManager
import json

async def run_pipeline():
    print(f"--- X-Radio Digest Pipeline Started at {datetime.now()} ---")
    
    try:
        # 1. Scrape Tweets
        scraper = TwitterScraper()
        await scraper.login()
        raw_tweets = await scraper.fetch_home_timeline(70)
        ranked_tweets = scraper.filter_and_rank(raw_tweets)
        top_5 = ranked_tweets[:5]
        deep_dive_data = await scraper.get_deep_dive(top_5)
        
        tweets_context = {
            'top_stories': deep_dive_data,
            'other_mentions': ranked_tweets[5:20]
        }
        
        # 2. Generate Script
        writer = ScriptWriter()
        script = writer.generate_script(tweets_context)
        
        # 3. Generate Audio
        producer = AudioProducer()
        date_str = datetime.now().strftime('%Y-%m-%d')
        tag_name = f"digest-{date_str}"
        audio_filename = f"digest_{date_str}.mp3"
        
        success = producer.generate_audio(script, audio_filename)
        if not success:
            print("Failed to generate audio.")
            sys.exit(1)

        # 4. Prepare for RSS (The actual URL will be the GitHub Release URL)
        # Pattern: https://github.com/<OWNER>/<REPO>/releases/download/<TAG>/<FILE>
        repo = os.getenv('GITHUB_REPOSITORY', 'rotemhadar/roey-tzena-podcast')
        audio_url = f"https://github.com/{repo}/releases/download/{tag_name}/{audio_filename}"
        file_size = os.path.getsize(audio_filename)
        
        rss = RSSManager(feed_url="", site_url="https://twitter.com")
        description = script[:200] + "..." # Short summary for RSS
        episodes = rss.add_episode(f"X-Radio Digest {date_str}", description, audio_url, file_size)
        rss.generate_rss(episodes, 'rss.xml')
        
        print(f"--- Pipeline Finished. Created {audio_filename} ---")
        
        # Output the tag and filename for the GitHub Action to use
        github_output = os.environ.get('GITHUB_OUTPUT')
        if github_output:
            with open(github_output, 'a') as f:
                f.write(f"tag_name={tag_name}\n")
                f.write(f"audio_file={audio_filename}\n")
        else:
            with open('pipeline_output.txt', 'a') as f:
                f.write(f"tag_name={tag_name}\n")
                f.write(f"audio_file={audio_filename}\n")
    except Exception as e:
        print(f"Pipeline failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_pipeline())
