# Implementation Plan: NotebookLM Link Extraction

This plan outlines the steps to enhance the scraper to extract audio links from NotebookLM pages linked in the first comment of Facebook posts.

## Phase 1: Type Updates & Infrastructure
- [x] Task: Update `Post` and `Comment` types to include NotebookLM-specific metadata. (d68ff7c)
    - [x] Add `title` and `sourceUrl` (the NotebookLM link) to `Post`.
    - [x] Update any existing mocks or tests to reflect type changes.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Type Updates & Infrastructure' (Protocol in workflow.md)

## Phase 2: NotebookLM Deep Scraper (TDD)
- [ ] Task: Create `src/scraper/notebooklm.ts` for specialized NotebookLM extraction.
- [ ] Task: Write failing tests for `extractAudioFromNotebookLM`.
    - [ ] Test successful extraction of audio URL and title from a mock NotebookLM page.
    - [ ] Test retry logic on failure.
    - [ ] Test final failure after one retry.
- [ ] Task: Implement `extractAudioFromNotebookLM` to pass tests.
    - [ ] Use Playwright to navigate and extract data.
    - [ ] Implement robust selectors for the audio element and page title.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: NotebookLM Deep Scraper (TDD)' (Protocol in workflow.md)

## Phase 3: Integration into Facebook Scraper
- [ ] Task: Update `extractPosts` in `src/scraper/extractor.ts` to identify NotebookLM links.
- [ ] Task: Write failing tests for the updated `extractPosts`.
    - [ ] Mock the NotebookLM extraction function.
    - [ ] Verify that the first comment's link is correctly passed to the NotebookLM extractor if detected.
- [ ] Task: Implement integration in `extractPosts`.
    - [ ] Extract the first URL from the first comment.
    - [ ] If it matches the NotebookLM pattern, call the specialized extractor.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Integration into Facebook Scraper' (Protocol in workflow.md)

## Phase 4: Final Verification
- [ ] Task: Run end-to-end extraction with the provided example URL.
    - [ ] URL: `https://www.facebook.com/roey.tzezana/posts/pfbid02W5aN2BABvDUHPnFrhTCWQzddTUfk1jnE81gQ3VBNo8kiFLqjJcvP6a8HWkUp7Ai5l`
- [ ] Task: Verify that the resulting `Post` object contains the correct title, description, date, and audio URL.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Verification' (Protocol in workflow.md)
