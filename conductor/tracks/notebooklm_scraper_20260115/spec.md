# Track Specification: NotebookLM Link Extraction

## Overview
This track enhances the Facebook scraper to support extracting audio links from NotebookLM pages. Currently, the scraper only looks for direct audio file links (.mp3, etc.) in comments. Roey Tzezana often posts links to NotebookLM pages in the first comment of his posts, which contain the actual audio summary.

## Functional Requirements
1. **First Comment Link Extraction**:
    - The scraper must identify the first comment of a Facebook post.
    - It must extract the first URL found in that comment.
2. **NotebookLM Detection & Deep Scraping**:
    - If the extracted URL is a NotebookLM link (e.g., `notebooklm.google.com/...`), the scraper must navigate to that URL using Playwright.
    - It must then extract the direct audio source URL (typically an `<audio>` tag or a specific download link) from the NotebookLM page.
3. **Metadata Extraction**:
    - **Post Title**: Extract the title from the NotebookLM page.
    - **Post Description**: Extract the full text of the original Facebook post.
    - **Post Date**: Extract the publication date from the Facebook post.
4. **Resilience**:
    - If extraction from NotebookLM fails, the scraper should retry exactly once before skipping the post and logging the error.

## Non-Functional Requirements
- **Performance**: Deep scraping increases navigation time; the scraper should handle timeouts gracefully.
- **Reliability**: Use robust selectors for NotebookLM, as its internal structure might change.

## Acceptance Criteria
- [ ] Scraper successfully identifies a NotebookLM link in the first comment of a Facebook post.
- [ ] Scraper navigates to the NotebookLM page and extracts a valid audio URL.
- [ ] Scraper extracts the title from the NotebookLM page.
- [ ] Scraper extracts the description and date from the Facebook post.
- [ ] If NotebookLM navigation fails, it retries once.
- [ ] Unit tests verify the extraction logic with a mock NotebookLM page.

## Out of Scope
- Scraping comments other than the first one.
- Handling audio sources other than direct links and NotebookLM (e.g., Spotify, YouTube).
- Advanced error recovery beyond a single retry.
