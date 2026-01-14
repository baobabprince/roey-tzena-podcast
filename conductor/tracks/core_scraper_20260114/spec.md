# Specification: Core Scraper and RSS Generator

## Overview
This track focuses on the fundamental capability of the system: identifying audio summary links within the comments of Facebook posts by Roey Tzezana and generating a standard-compliant RSS podcast feed.

## Functional Requirements
1. **Facebook Scraper:**
    - Navigate to a specified Facebook Page or Profile.
    - Identify posts and their associated comments.
    - Extract links specifically targeting audio summary providers (e.g., specific domains mentioned in the concept).
    - Handle pagination to discover both new and historical posts.
2. **Audio Management:**
    - Download the discovered audio files to local storage.
    - Maintain a mapping between the original post and the local audio file.
3. **RSS Generation:**
    - Produce a valid `podcast.xml` file.
    - Each item in the feed must include title, date, description (extracted from the post), and a link to the locally hosted audio file.
4. **Data Persistence:**
    - Store metadata for discovered posts in a local JSON file to avoid duplicate processing.

## Technical Constraints
- Language: TypeScript (Node.js).
- Scraping: Playwright/Puppeteer.
- Storage: JSON files for metadata, local filesystem for audio.
- Deployment: Optimized for GitHub Actions or Self-hosting.
