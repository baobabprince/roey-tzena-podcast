
import os
import json
from google.cloud import texttospeech
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class AudioProducer:
    def __init__(self):
        # The library looks for GOOGLE_APPLICATION_CREDENTIALS path or 
        # we can initialize from a JSON string if needed.
        # For GitHub Actions, we'll likely pass the JSON content via secret.
        creds_json = os.getenv('GCP_SA_KEY')
        if creds_json:
            with open('gcp_creds.json', 'w') as f:
                f.write(creds_json)
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'gcp_creds.json'
        
        self.client = texttospeech.TextToSpeechClient()
        self.voice = texttospeech.VoiceSelectionParams(
            language_code="he-IL",
            name="he-IL-Wavenet-A" # High-quality Wavenet voice for Hebrew
        )
        self.audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            effects_profile_id=["small-bluetooth-speaker-class-device"]
        )

    def generate_audio(self, text, output_filename):
        print("Generating audio with Google Cloud TTS (Neural2 Hebrew)...")
        
        synthesis_input = texttospeech.SynthesisInput(text=text)

        try:
            response = self.client.synthesize_speech(
                input=synthesis_input, 
                voice=self.voice, 
                audio_config=self.audio_config
            )

            with open(output_filename, "wb") as out:
                out.write(response.audio_content)
            
            print(f"Audio saved to {output_filename}")
            return True
        except Exception as e:
            print(f"Error generating audio: {e}")
            return False
        finally:
            if os.path.exists('gcp_creds.json'):
                os.remove('gcp_creds.json')

def main():
    if not os.path.exists('podcast_script.txt'):
        return

    with open('podcast_script.txt', 'r', encoding='utf-8') as f:
        text = f.read()

    producer = AudioProducer()
    date_str = datetime.now().strftime('%Y-%m-%d')
    output_filename = f"digest_{date_str}.mp3"
    
    producer.generate_audio(text, output_filename)

if __name__ == "__main__":
    main()
