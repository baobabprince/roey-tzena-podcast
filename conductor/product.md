# Initial Concept
ערוץ פודקאסט שמציג את כל הפרסומים של roey tzena בפייסבוק. הרבה פעמים הוא מעלה פוסטים שבתגובות אלים הוא שם קישוק לסקירה קולית של הפוסט. הייתי רוצה את זה בצורת פודקאסט עם ערוץ rss סטנדרטי.

# Product Vision
A podcast feed generator that automatically discovers and aggregates audio summaries shared by Roey Tzezana on Facebook, providing a standard RSS feed for easy consumption in podcast players.

# Target Audience
- Existing followers of Roey Tzezana who prefer audio consumption.
- New listeners interested in technology and future trends who don't use Facebook.
- Commuters or busy professionals looking for a way to catch up on long-form social media content.

# Key Features
- Automated scraping of Facebook posts and comments to identify and extract audio review links.
- Persistent hosting/caching of identified audio files to ensure reliable access via the feed.
- Standard-compliant RSS feed generation (podcast XML) for compatibility with all major podcast players.
- Web-based status dashboard to monitor scraper activity and feed health.

# Deployment & Hosting
- Flexible deployment options: Optimized for self-hosting (local server/VPS) or as a scheduled GitHub Action for a low-maintenance, serverless approach.