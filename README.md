# Roey Tzezana Podcast Feed Generator

A tool to automatically scrape audio summaries from Roey Tzezana's Facebook posts (often generated via NotebookLM) and provide them as a standard RSS podcast feed.

## Setup

### Environment Variables

The following environment variables are required for the scraper to function correctly, especially for NotebookLM extraction via Apify:

- `FACEBOOK_URL`: (Optional) The URL of the Facebook profile to scrape.
- `APIFY_TOKEN`: **Required** for NotebookLM extraction. Get it from your Apify account.
- `GOOGLE_EMAIL`: **Required** for NotebookLM extraction. Your Google account email.
- `GOOGLE_APP_PASSWORD`: **Required** for NotebookLM extraction. A 16-character App Password (NOT your regular Google password).

### GitHub Secrets

When deploying via GitHub Actions, ensure the following secrets are configured in your repository (**Settings > Secrets and variables > Actions**):

- `APIFY_TOKEN`
- `GOOGLE_EMAIL`
- `GOOGLE_APP_PASSWORD`

## Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file based on `.env.example`.
3. Build the project:
   ```bash
   npm run build
   ```
4. Run the orchestrator:
   ```bash
   npm start
   ```

## Testing

Run the test suite:
```bash
npm test
```
