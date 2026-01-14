# Technology Stack

## Core Development
- **Language:** TypeScript
- **Runtime:** Node.js
- **Scraping Framework:** Playwright or Puppeteer (Headless Browser) to handle dynamic content and JavaScript execution on Facebook.

## Data Storage
- **Metadata Storage:** JSON / Flat Files. A simple, versionable approach for storing discovered post metadata and feed state, ideal for portability and ease of debugging in a self-hosted or GitHub Actions environment.

## Content Management
- **Audio Strategy:** Download & Host. Audio files will be downloaded locally (or to the execution environment) and served alongside the RSS feed. This ensures link stability and bypasses potential hotlinking restrictions from the source.
- **Feed Generation:** `podcast` or `rss` NPM packages for standard-compliant XML generation.

## Infrastructure & Deployment
- **Environment:** Node.js 20+
- **Hosting Options:**
    - **Self-Hosted:** Docker container running on a VPS or local server.
    - **GitHub Actions:** Scheduled workflow to scrape, download, and commit/upload updates to a static site host (like GitHub Pages).
