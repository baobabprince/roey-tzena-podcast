
import os
import json
from feedgen.feed import FeedGenerator
from datetime import datetime, timezone
import pytz

class RSSManager:
    def __init__(self, feed_url, site_url):
        self.feed_url = feed_url
        self.site_url = site_url
        self.db_path = 'episodes_db.json'

    def load_episodes(self):
        if os.path.exists(self.db_path):
            with open(self.db_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []

    def save_episodes(self, episodes):
        # Keep only the last 5 episodes
        episodes = episodes[-5:]
        with open(self.db_path, 'w', encoding='utf-8') as f:
            json.dump(episodes, f, ensure_ascii=False, indent=2)

    def add_episode(self, title, description, audio_url, length_bytes):
        episodes = self.load_episodes()
        new_episode = {
            'title': title,
            'description': description,
            'audio_url': audio_url,
            'length': length_bytes,
            'pub_date': datetime.now(timezone.utc).isoformat()
        }
        # Check if already exists (by title/date)
        if not any(e['title'] == title for e in episodes):
            episodes.append(new_episode)
            self.save_episodes(episodes)
        return episodes

    def generate_rss(self, episodes, output_path):
        fg = FeedGenerator()
        fg.load_extension('podcast')
        fg.title('X-Radio Digest')
        fg.author({'name': 'X-Radio Editor', 'email': 'editor@x-radio.local'})
        fg.logo('https://abs.twimg.com/favicons/twitter.2.ico')
        fg.link(href=self.site_url, rel='alternate')
        fg.description('Daily Personal X (Twitter) Digest')
        fg.language('he')

        for ep in episodes:
            fe = fg.add_entry()
            fe.id(ep['audio_url'])
            fe.title(ep['title'])
            fe.description(ep['description'])
            fe.enclosure(ep['audio_url'], str(ep['length']), 'audio/mpeg')
            fe.pubDate(ep['pub_date'])

        fg.rss_file(output_path)
        print(f"RSS feed generated at {output_path}")

def main():
    # These would be passed from env or args in the workflow
    base_url = os.getenv('BASE_URL', 'https://github.com/rotemhadar/roey-tzena-podcast/releases/download/')
    
    # Example usage:
    # rss = RSSManager(feed_url="...", site_url="...")
    # rss.add_episode(...)
    # rss.generate_rss(...)
    pass

if __name__ == "__main__":
    main()
