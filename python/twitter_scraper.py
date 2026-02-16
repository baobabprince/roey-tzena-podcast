
import asyncio
import os
import time
import json
from twikit import Client
from dotenv import load_dotenv

load_dotenv()

class TwitterScraper:
    def __init__(self):
        self.client = Client('en-US')
        self.auth_token = os.getenv('X_AUTH_TOKEN')
        self.ct0 = os.getenv('X_CT0')

    async def login(self):
        print("Initializing client with session cookies...")
        self.client.set_cookies({
            'auth_token': self.auth_token,
            'ct0': self.ct0
        })

    async def fetch_home_timeline(self, limit=70):
        print(f"Fetching {limit} tweets from home timeline...")
        tweets = []
        try:
            # Try latest API method first
            tweets = await self.client.get_latest_timeline(count=limit)
        except Exception as e:
            print(f"Error fetching home timeline: {e}")
            try:
                # Fallback to older/alternative method
                tweets = await self.client.get_timeline('home', count=limit)
            except Exception as e2:
                print(f"Error fetching home timeline fallback: {e2}")
        
        if not tweets:
            print("Home timeline is empty. Falling back to searching popular Hebrew tech/news accounts...")
            # Fallback: Search for tweets from popular Hebrew accounts or specific hashtags
            # This ensures we always have some content.
            fallback_query = '(from:israelhayom OR from:ynetalerts OR from:N12News OR from:kann_news) lang:he'
            try:
                tweets = await self.client.search_tweet(fallback_query, product='Latest', count=limit)
            except Exception as e3:
                print(f"Error fetching fallback search: {e3}")

        print(f"Fetched {len(tweets) if tweets else 0} raw tweets.")
        return tweets

    def filter_and_rank(self, tweets):
        print("Filtering ads and ranking by engagement...")
        processed = []
        for t in tweets:
            # Ensure it is a tweet object with text
            if not hasattr(t, 'text') or not t.text:
                continue

            # Absolute filtering of promoted content
            if hasattr(t, 'promoted_metadata') and t.promoted_metadata:
                continue
            
            # Engagement = Likes + Retweets
            # Handle potential missing attributes safely
            favs = getattr(t, 'favorite_count', 0) or 0
            rts = getattr(t, 'retweet_count', 0) or 0
            engagement = favs + rts
            
            processed.append({
                'id': t.id,
                'text': t.text,
                'user': getattr(t.user, 'screen_name', 'unknown'),
                'engagement': engagement,
                'created_at': getattr(t, 'created_at', '')
            })
        
        # Sort by engagement descending
        processed.sort(key=lambda x: x['engagement'], reverse=True)
        return processed

    async def get_deep_dive(self, top_tweets, replies_limit=5):
        print(f"Performing deep-dive on top {len(top_tweets)} tweets...")
        for tweet in top_tweets:
            print(f"Fetching replies for tweet {tweet['id']} by {tweet['user']}...")
            try:
                # Fetching tweet thread/replies
                replies = await self.client.get_tweet_details(tweet['id'])
                # Filter for top replies (usually the first ones returned are high engagement)
                tweet['replies'] = [
                    {'user': r.user.screen_name, 'text': r.text}
                    for r in getattr(replies, 'replies', [])[:replies_limit]
                ]
                # Polite scraping
                await asyncio.sleep(2)
            except Exception as e:
                print(f"Error fetching replies for {tweet['id']}: {e}")
                tweet['replies'] = []
        return top_tweets

async def main():
    scraper = TwitterScraper()
    if not scraper.auth_token or not scraper.ct0:
        print("Error: X_AUTH_TOKEN or X_CT0 not set.")
        return

    await scraper.login()
    raw_tweets = await scraper.fetch_home_timeline(70)
    ranked_tweets = scraper.filter_and_rank(raw_tweets)
    
    top_5 = ranked_tweets[:5]
    deep_dive_data = await scraper.get_deep_dive(top_5)
    
    output = {
        'top_stories': deep_dive_data,
        'other_mentions': ranked_tweets[5:20] # Provide some context for the "editor"
    }
    
    with open('tweets_data.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print("Tweet data saved to tweets_data.json")

if __name__ == "__main__":
    asyncio.run(main())
