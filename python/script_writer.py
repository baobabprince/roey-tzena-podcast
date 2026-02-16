
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class ScriptWriter:
    def __init__(self):
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        # Using the most updated Gemini 2.0 Flash model
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    def generate_script(self, data):
        prompt = f"""
        אתה עורך רדיו מנוסה, חד ושנון. התפקיד שלך הוא להפוך את נתוני הציוצים הבאים למהדורת פודקאסט יומית קולחת, אינטליגנטית ומבדרת (3-5 דקות הקראה).
        
        הנחיות קריאייטיב:
        1. **תמה מרכזית**: זהה 3-4 נושאים בוערים בפיד וחבר ביניהם בחוטים מקשרים שנונים.
        2. **דיאלוג**: שלב את התגובות מה-"Deep Dive" בתוך הטקסט. אל תגיד "משתמש X אמר", אלא "מישהו כאן טען ש..." או "בתגובות דווקא חשבו אחרת...".
        3. **טון**: סמכותי אך חברי, שפה של רדיו 2026 - לא רשמית מדי, אבל מאוד חריפה. 
        4. **ניקיון**: אל תקריא לינקים, יוזרנאיימס עם מספרים, או האשטאגים. 
        5. **מבנה**: פתיח מוזיקלי דמיוני -> הצגת הנושאים -> צלילה לתוכן -> סיכום קצר וסגירה.
        6. **שפה**: עברית טבעית בלבד.

        נתוני הציוצים הגולמיים:
        {json.dumps(data, ensure_ascii=False)}
        
        ענה בפורמט JSON עם השדות הבאים:
        - "title": כותרת קצרה וקולעת לפרק (ללא המילה "פרק").
        - "script": התסריט המלא להקראה.
        """
        
        print("Generating script with Gemini 2.0 Flash...")
        response = self.model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        try:
            return json.loads(response.text)
        except:
            # Fallback if JSON parsing fails
            return {"title": "עדכון יומי", "script": response.text}

def main():
    if not os.path.exists('tweets_data.json'):
        return

    with open('tweets_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    writer = ScriptWriter()
    script = writer.generate_script(data)
    
    with open('podcast_script.txt', 'w', encoding='utf-8') as f:
        f.write(script)
    print("Script (Gemini 2.0) saved to podcast_script.txt")

if __name__ == "__main__":
    main()
