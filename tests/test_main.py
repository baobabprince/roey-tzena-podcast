import os
import pytest
import sys
import asyncio
from unittest.mock import MagicMock, patch, AsyncMock

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'python'))

from main import run_pipeline

@pytest.mark.asyncio
async def test_run_pipeline_success():
    with patch('main.TwitterScraper') as MockScraper,          patch('main.ScriptWriter') as MockWriter,          patch('main.AudioProducer') as MockProducer,          patch('main.RSSManager') as MockRSS:

        mock_scraper = MockScraper.return_value
        mock_scraper.login = AsyncMock()
        mock_scraper.fetch_home_timeline = AsyncMock(return_value=[])
        mock_scraper.filter_and_rank = MagicMock(return_value=[])
        mock_scraper.get_deep_dive = AsyncMock(return_value=[])

        mock_writer = MockWriter.return_value
        mock_writer.generate_script = MagicMock(return_value={'title': 'Test', 'script': 'Content'})

        mock_producer = MockProducer.return_value
        mock_producer.generate_audio = MagicMock(return_value=True)

        mock_rss = MockRSS.return_value
        mock_rss.add_episode = MagicMock(return_value=[])
        mock_rss.generate_rss = MagicMock()

        with patch('os.path.getsize', return_value=1024),              patch('os.environ.get', return_value=None):

            await run_pipeline()

            mock_scraper.login.assert_called_once()
            mock_writer.generate_script.assert_called_once()
            mock_producer.generate_audio.assert_called_once()
            mock_rss.add_episode.assert_called_once()
            mock_rss.generate_rss.assert_called_once()

@pytest.mark.asyncio
async def test_run_pipeline_failure():
    with patch('main.TwitterScraper') as MockScraper:
        mock_scraper = MockScraper.return_value
        mock_scraper.login = AsyncMock(side_effect=Exception("Login failed"))

        with pytest.raises(SystemExit) as cm:
            await run_pipeline()

        assert cm.value.code == 1
