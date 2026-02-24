
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
        self.username = os.getenv('X_USERNAME')
        self.password = os.getenv('X_PASSWORD')
        self.email = os.getenv('X_EMAIL')
        self.totp_secret = os.getenv('X_TOTP_SECRET')
        self.auth_token = os.getenv('X_AUTH_TOKEN')
        self.ct0 = os.getenv('X_CT0')
        self.apify_token = os.getenv('APIFY_TOKEN')
        self.apify_actor = os.getenv('APIFY_ACTOR_ID', 'apify/twitter-scraper')

    async def login(self):
        # Prefer session cookies if available
        if self.auth_token and self.ct0:
            print("Initializing client with session cookies...")
            try:
                self.client.set_cookies({
                    'auth_token': self.auth_token,
                    'ct0': self.ct0
                })
                return
            except Exception as e:
                print(f"Error setting cookies: {e}")

        # Fallback to full login if cookies are missing or expired
        if self.username and self.password:
            print(f"Logging in as {self.username}...")
            try:
                await self.client.login(
                    auth_info_1=self.username,
                    auth_info_2=self.email,
                    password=self.password,
                    totp_secret=self.totp_secret
                )
                print("Login successful.")
            except Exception as e:
                print(f"Login failed: {e}")
                if '403' in str(e):
                    print("CRITICAL: Login blocked by Cloudflare (403). X is detecting this runner as a bot.")
                    print("HINT: Update your X_AUTH_TOKEN and X_CT0 secrets with fresh session cookies from a real browser.")
                elif '401' in str(e):
                    print("CRITICAL: Authentication failed (401). Check your credentials.")
        else:
            print("Error: No authentication method provided (cookies or credentials).")

    async def fetch_via_apify(self, limit=70):
        """Fallback method using Apify to scrape the home timeline."""
        if not self.apify_token:
            print("Apify token not set. Skipping Apify fallback.")
            return []

        print(f"Attempting to fetch home timeline via Apify actor {self.apify_actor}...")
        try:
            from apify_client import ApifyClientAsync
            client = ApifyClientAsync(self.apify_token)

            # Construct cookie string from available session data
            cookie_list = []
            if self.auth_token: cookie_list.append(f"auth_token={self.auth_token}")
            if self.ct0: cookie_list.append(f"ct0={self.ct0}")
            cookie_str = "; ".join(cookie_list)

            # Common input format for Twitter scrapers on Apify
            run_input = {
                "maxItems": limit,
                "cookie": cookie_str,
                "urls": ["https://x.com/home"],
                "scrapeHomeTimeline": True # Some actors use this flag
            }

            # Start the actor and wait for it to finish
            run = await client.actor(self.apify_actor).call(run_input=run_input)

            tweets = []
            async for item in client.dataset(run['defaultDatasetId']).iterate_items():
                tweets.append(item)

            print(f"Apify successfully fetched {len(tweets)} items.")
            return tweets
        except Exception as e:
            print(f"Apify fallback failed: {e}")
            import traceback
            traceback.print_exc()
            return []

    async def fetch_home_timeline(self, limit=70):
        print(f"Fetching {limit} tweets from home timeline...")
        tweets = []
        try:
            # Try latest API method first
            tweets = await self.client.get_latest_timeline(count=limit)
        except Exception as e:
            print(f"Error fetching home timeline: {e}")
            if '401' in str(e):
                print("Session cookies (X_AUTH_TOKEN/X_CT0) appear to be expired or invalid.")

            # If 401, maybe try to login again if we haven't already
            if '401' in str(e) and self.username and self.password:
                print("Attempting full login fallback...")
                try:
                    await self.client.login(
                        auth_info_1=self.username,
                        auth_info_2=self.email,
                        password=self.password,
                        totp_secret=self.totp_secret
                    )
                    tweets = await self.client.get_latest_timeline(count=limit)
                except Exception as login_err:
                    print(f"Login fallback failed: {login_err}")
                    if '403' in str(login_err):
                        print("Cloudflare block detected during login fallback. Cannot proceed with standard scraping.")

            if not tweets:
                try:
                    # Fallback to older/alternative method
                    # The get_timeline method in recent twikit doesn't take 'category'
                    tweets = await self.client.get_timeline(count=limit)
                except Exception as e2:
                    print(f"Error fetching home timeline fallback: {e2}")
        
        # Apify Fallback - Try to get the specific user feed if twikit failed
        if not tweets:
            if self.apify_token:
                print("Twikit failed to fetch home timeline. Trying Apify fallback...")
                tweets = await self.fetch_via_apify(limit)
            else:
                print("NOTICE: Apify fallback not configured. Consider setting APIFY_API_TOKEN for better resilience.")

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

        def get_val(obj, key, default=None):
            if isinstance(obj, dict):
                return obj.get(key, default)
            return getattr(obj, key, default)

        for t in tweets:
            is_dict = isinstance(t, dict)

            # Extract text (handle twikit and various Apify actors)
            text = get_val(t, 'text')
            if not text and is_dict:
                text = t.get('full_text')

            if not text:
                continue

            # Absolute filtering of promoted content
            promoted = False
            if is_dict:
                promoted = any([
                    t.get('is_ad'),
                    t.get('is_promoted'),
                    t.get('promoted_metadata'),
                    'promoted' in str(t.get('source', '')).lower()
                ])
            else:
                promoted = hasattr(t, 'promoted_metadata') and t.promoted_metadata

            if promoted:
                continue
            
            # Engagement = Likes + Retweets
            favs = get_val(t, 'favorite_count', 0) or 0
            rts = get_val(t, 'retweet_count', 0) or 0
            engagement = favs + rts
            
            # User info
            user_val = get_val(t, 'user')
            screen_name = 'unknown'
            if user_val:
                screen_name = get_val(user_val, 'screen_name', 'unknown')

            # ID
            tweet_id = get_val(t, 'id')
            if not tweet_id and is_dict:
                tweet_id = t.get('id_str')

            processed.append({
                'id': tweet_id,
                'text': text,
                'user': screen_name,
                'engagement': engagement,
                'created_at': get_val(t, 'created_at', '')
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
                replies = await self.client.get_tweet_by_id(tweet['id'])
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
