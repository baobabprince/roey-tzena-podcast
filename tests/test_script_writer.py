import os
import pytest
import sys
import json
from unittest.mock import MagicMock, patch

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'python'))

from script_writer import ScriptWriter

@pytest.fixture
def mock_genai_client():
    with patch('google.genai.Client') as mock:
        yield mock

def test_script_writer_init():
    with patch('google.genai.Client') as mock_client:
        with patch.dict(os.environ, {"GEMINI_API_KEY": "fake_key"}):
            writer = ScriptWriter()
            mock_client.assert_called_once_with(api_key="fake_key")

def test_generate_script_success(mock_genai_client):
    mock_instance = mock_genai_client.return_value
    mock_response = MagicMock()
    mock_response.text = json.dumps({
        "title": "Test Title",
        "script": "Test Script Content"
    })
    mock_instance.models.generate_content.return_value = mock_response

    writer = ScriptWriter()
    result = writer.generate_script({"data": "some data"})

    assert result['title'] == "Test Title"
    assert result['script'] == "Test Script Content"

def test_script_writer_main(mock_genai_client):
    from script_writer import main
    with patch('os.path.exists', return_value=True), \
         patch('builtins.open', MagicMock()), \
         patch('json.load', return_value={}), \
         patch('script_writer.ScriptWriter.generate_script', return_value={'title': 'T', 'script': 'S'}):
        main()

def test_script_writer_main_no_file():
    from script_writer import main
    with patch('os.path.exists', return_value=False):
        assert main() is None

def test_generate_script_fallback_on_invalid_json(mock_genai_client):
    mock_instance = mock_genai_client.return_value
    mock_response = MagicMock()
    mock_response.text = "Not a JSON"
    mock_instance.models.generate_content.return_value = mock_response

    writer = ScriptWriter()
    result = writer.generate_script({"data": "some data"})

    assert result['title'] == "עדכון יומי"
    assert result['script'] == "Not a JSON"

def test_generate_script_list_response(mock_genai_client):
    mock_instance = mock_genai_client.return_value
    mock_response = MagicMock()
    mock_response.text = json.dumps([{
        "title": "Test Title",
        "script": "Test Script Content"
    }])
    mock_instance.models.generate_content.return_value = mock_response

    writer = ScriptWriter()
    result = writer.generate_script({"data": "some data"})

    assert result['title'] == "Test Title"
    assert result['script'] == "Test Script Content"
