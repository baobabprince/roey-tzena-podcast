# Apify Fallback Setup Guide

The X-Radio Digest now supports [Apify](https://apify.com) as a fallback mechanism for scraping your Twitter home timeline. This is useful if the primary `twikit` library encounters rate limits or authentication issues.

## 1. Obtain Apify API Token

1.  Sign up or log in to [Apify](https://apify.com).
2.  Go to **Settings > Integrations**.
3.  Copy your **Personal API token**.
4.  **GitHub Secret Name**: `APIFY_TOKEN`

## 2. Configure Apify Actor (Optional)

By default, the system uses `apify/twitter-scraper`. If you wish to use a different actor, you can specify it.

1.  Find a Twitter scraper actor on the Apify Store (e.g., `apify/twitter-scraper` or `quacker/twitter-scraper`).
2.  **GitHub Secret Name**: `APIFY_ACTOR_ID` (Default: `apify/twitter-scraper`)

## 3. How it Works

The pipeline will automatically try to use Apify if the standard scraping method fails. It uses the same session cookies (`X_AUTH_TOKEN` and `X_CT0`) that you've already configured for the project.

### Required Environment Variables / Secrets:

| Secret | Description |
| :--- | :--- |
| `APIFY_TOKEN` | Your Apify API Token |
| `APIFY_ACTOR_ID` | (Optional) The ID of the Apify actor to use |

### Why use Apify?
*   **Residential Proxies**: Apify actors often use high-quality proxies that are less likely to be flagged by X.
*   **Reliability**: If one scraping method is patched by X, Apify actors are often updated quickly by the community.
*   **Browser Simulation**: Many Apify actors use full browser automation (Playwright/Puppeteer), making them harder to detect than simple API requests.

---
*Note: Using Apify may incur costs depending on your Apify plan and the actor's usage fees.*
