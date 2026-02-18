import os
import pytest
import sys
from unittest.mock import MagicMock, patch

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'python'))

from audio_producer import AudioProducer

@pytest.fixture
def mock_tts_client():
    with patch('google.cloud.texttospeech.TextToSpeechClient') as mock:
        yield mock

def test_audio_producer_init(mock_tts_client, tmp_path):
    with patch('builtins.open', MagicMock()) as mock_open, \
         patch.dict(os.environ, {"GCP_SA_KEY": '{"type": "service_account"}'}):
        producer = AudioProducer()
        mock_open.assert_any_call('gcp_creds.json', 'w')
        assert os.environ['GOOGLE_APPLICATION_CREDENTIALS'] == 'gcp_creds.json'

def test_generate_audio_success(mock_tts_client, tmp_path):
    mock_instance = mock_tts_client.return_value
    mock_response = MagicMock()
    mock_response.audio_content = b"fake audio content"
    mock_instance.synthesize_speech.return_value = mock_response

    with patch('builtins.open', MagicMock()):
        producer = AudioProducer()
    output_file = tmp_path / "test.mp3"

    success = producer.generate_audio("Hello world", str(output_file))

    assert success is True
    assert os.path.exists(output_file)
    with open(output_file, "rb") as f:
        assert f.read() == b"fake audio content"

    mock_instance.synthesize_speech.assert_called_once()

def test_generate_audio_failure(mock_tts_client, tmp_path):
    mock_instance = mock_tts_client.return_value
    mock_instance.synthesize_speech.side_effect = Exception("TTS Error")

    with patch('builtins.open', MagicMock()):
        producer = AudioProducer()
    output_file = tmp_path / "test_fail.mp3"

    success = producer.generate_audio("Hello world", str(output_file))

    assert success is False
    assert not os.path.exists(output_file)

def test_audio_producer_main(mock_tts_client):
    from audio_producer import main
    with patch('os.path.exists', side_effect=lambda x: x == 'podcast_script.txt'), \
         patch('builtins.open', MagicMock()), \
         patch('audio_producer.AudioProducer.generate_audio', return_value=True):
        main()

def test_audio_producer_main_no_file():
    from audio_producer import main
    with patch('os.path.exists', return_value=False):
        assert main() is None
