import os
import pytest
import sys
import asyncio
from unittest.mock import MagicMock, patch, AsyncMock

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'python'))

from twitter_scraper import TwitterScraper

@pytest.fixture
def mock_twikit_client():
    with patch('twitter_scraper.Client') as mock:
        yield mock

@pytest.mark.asyncio
async def test_twitter_scraper_login_with_cookies(mock_twikit_client):
    with patch.dict(os.environ, {"X_AUTH_TOKEN": "token", "X_CT0": "ct0"}):
        scraper = TwitterScraper()
        await scraper.login()
        mock_twikit_client.return_value.set_cookies.assert_called_once_with({
            'auth_token': 'token',
            'ct0': 'ct0'
        })

@pytest.mark.asyncio
async def test_twitter_scraper_login_with_credentials(mock_twikit_client):
    with patch.dict(os.environ, {"X_USERNAME": "user", "X_PASSWORD": "pass", "X_EMAIL": "email"}):
        with patch.dict(os.environ, {"X_AUTH_TOKEN": "", "X_CT0": ""}):
            scraper = TwitterScraper()
            scraper.auth_token = None
            scraper.ct0 = None

            mock_login = AsyncMock()
            mock_twikit_client.return_value.login = mock_login

            await scraper.login()
            mock_login.assert_called_once()

@pytest.mark.asyncio
async def test_fetch_home_timeline_success(mock_twikit_client):
    scraper = TwitterScraper()
    mock_get_latest_timeline = AsyncMock(return_value=["tweet1", "tweet2"])
    mock_twikit_client.return_value.get_latest_timeline = mock_get_latest_timeline

    tweets = await scraper.fetch_home_timeline(limit=10)
    assert tweets == ["tweet1", "tweet2"]
    mock_get_latest_timeline.assert_called_once_with(count=10)

@pytest.mark.asyncio
async def test_fetch_home_timeline_fallback(mock_twikit_client):
    scraper = TwitterScraper()
    mock_twikit_client.return_value.get_latest_timeline.side_effect = Exception("401 Unauthorized")
    mock_search_tweet = AsyncMock(return_value=["fallback_tweet"])
    mock_twikit_client.return_value.search_tweet = mock_search_tweet

    tweets = await scraper.fetch_home_timeline(limit=10)
    assert tweets == ["fallback_tweet"]
    mock_search_tweet.assert_called_once()

def test_filter_and_rank():
    scraper = TwitterScraper()

    class MockTweet:
        def __init__(self, id, text, favorite_count, retweet_count, promoted=False):
            self.id = id
            self.text = text
            self.favorite_count = favorite_count
            self.retweet_count = retweet_count
            self.user = MagicMock(screen_name="user")
            if promoted:
                self.promoted_metadata = True

    tweets = [
        MockTweet(1, "Text 1", 10, 5),
        MockTweet(2, "Text 2", 20, 10),
        MockTweet(3, "Promoted", 100, 100, promoted=True),
        MockTweet(4, None, 0, 0)
    ]

    ranked = scraper.filter_and_rank(tweets)

    assert len(ranked) == 2
    assert ranked[0]['id'] == 2
    assert ranked[0]['engagement'] == 30
    assert ranked[1]['id'] == 1
    assert ranked[1]['engagement'] == 15

@pytest.mark.asyncio
async def test_get_deep_dive(mock_twikit_client):
    scraper = TwitterScraper()

    top_tweets = [
        {'id': 1, 'user': 'user1'}
    ]

    mock_tweet_with_replies = MagicMock()
    mock_reply = MagicMock(text="reply text")
    mock_reply.user.screen_name = "replier"
    mock_tweet_with_replies.replies = [mock_reply]

    mock_get_tweet_by_id = AsyncMock(return_value=mock_tweet_with_replies)
    mock_twikit_client.return_value.get_tweet_by_id = mock_get_tweet_by_id

    with patch('asyncio.sleep', AsyncMock()):
        result = await scraper.get_deep_dive(top_tweets)

    assert len(result[0]['replies']) == 1
    assert result[0]['replies'][0]['text'] == "reply text"
    assert result[0]['replies'][0]['user'] == "replier"

@pytest.mark.asyncio
async def test_twitter_scraper_main_no_auth(mock_twikit_client):
    from twitter_scraper import main
    with patch.dict(os.environ, {"X_AUTH_TOKEN": "", "X_CT0": ""}):
        with patch('builtins.print') as mock_print:
            await main()
            mock_print.assert_any_call("Error: X_AUTH_TOKEN or X_CT0 not set.")

@pytest.mark.asyncio
async def test_twitter_scraper_main_success(mock_twikit_client):
    from twitter_scraper import main
    with patch.dict(os.environ, {"X_AUTH_TOKEN": "token", "X_CT0": "ct0"}):
        with patch('twitter_scraper.TwitterScraper.login', AsyncMock()), \
             patch('twitter_scraper.TwitterScraper.fetch_home_timeline', AsyncMock(return_value=[])), \
             patch('twitter_scraper.TwitterScraper.filter_and_rank', MagicMock(return_value=[])), \
             patch('twitter_scraper.TwitterScraper.get_deep_dive', AsyncMock(return_value=[])), \
             patch('builtins.open', MagicMock()):
            await main()
