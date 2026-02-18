import os
import json
import pytest
import sys
from datetime import datetime, timezone
from unittest.mock import patch

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'python'))

from rss_manager import RSSManager

@pytest.fixture
def temp_db(tmp_path):
    db_file = tmp_path / "test_episodes_db.json"
    return str(db_file)

@pytest.fixture
def rss_manager(temp_db):
    manager = RSSManager(feed_url="http://example.com/rss", site_url="http://example.com")
    manager.db_path = temp_db
    return manager

def test_load_episodes_empty(rss_manager):
    assert rss_manager.load_episodes() == []

def test_save_and_load_episodes(rss_manager):
    episodes = [
        {'title': 'Ep 1', 'description': 'Desc 1', 'audio_url': 'url1', 'length': 100, 'pub_date': 'date1'}
    ]
    rss_manager.save_episodes(episodes)
    loaded = rss_manager.load_episodes()
    assert loaded == episodes

def test_save_episodes_limit(rss_manager):
    episodes = [
        {'title': f'Ep {i}', 'description': f'Desc {i}', 'audio_url': f'url{i}', 'length': 100, 'pub_date': f'date{i}'}
        for i in range(10)
    ]
    rss_manager.save_episodes(episodes)
    loaded = rss_manager.load_episodes()
    assert len(loaded) == 5
    assert loaded[-1]['title'] == 'Ep 9'
    assert loaded[0]['title'] == 'Ep 5'

def test_add_episode(rss_manager):
    rss_manager.add_episode("New Title", "New Desc", "http://audio.url", 12345)
    episodes = rss_manager.load_episodes()
    assert len(episodes) == 1
    assert episodes[0]['title'] == "New Title"
    assert episodes[0]['description'] == "New Desc"
    assert episodes[0]['audio_url'] == "http://audio.url"
    assert episodes[0]['length'] == 12345
    assert 'pub_date' in episodes[0]

def test_add_duplicate_episode(rss_manager):
    rss_manager.add_episode("Title", "Desc", "url", 100)
    rss_manager.add_episode("Title", "Desc 2", "url 2", 200)
    episodes = rss_manager.load_episodes()
    assert len(episodes) == 1
    assert episodes[0]['description'] == "Desc"

def test_generate_rss(rss_manager, tmp_path):
    episodes = [
        {
            'title': 'Test Episode',
            'description': 'Test Description',
            'audio_url': 'http://example.com/audio.mp3',
            'length': 1000,
            'pub_date': datetime.now(timezone.utc).isoformat()
        }
    ]
    output_rss = tmp_path / "rss.xml"
    rss_manager.generate_rss(episodes, str(output_rss))

    assert os.path.exists(output_rss)
    with open(output_rss, 'r', encoding='utf-8') as f:
        content = f.read()
        assert '<title>Test Episode</title>' in content
        assert 'http://example.com/audio.mp3' in content

def test_rss_manager_main():
    from rss_manager import main
    with patch('os.getenv', return_value='http://example.com/'):
        main()
