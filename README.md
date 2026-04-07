# MyHordes Forum Summarizer

A local-first browser extension that helps summarize unread activity on the MyHordes town forum.

## Goal

This project reads forum data from the already loaded MyHordes forum page in the browser, extracts unread and new content, prioritizes the most relevant information, and generates a summary using local-only processing.

The intended priorities are:

1. Direct pings / mentions of me
2. Calls for help or urgent requests
3. Organization and action-oriented messages
4. General discussion
5. Roleplay / casual chat

## Constraints

This project is intentionally designed with the following constraints:

- Manual user-triggered analysis only
- No automatic polling or background scraping
- No remote AI APIs
- No external server for forum content
- Local-only summarization
- Reads data from the browser page DOM while the user is logged in
- Stores only local state needed for incremental analysis

## Planned architecture

Main components:

- Browser extension popup
- Content script for reading the forum page DOM
- Background/service worker for orchestration
- Local storage for seen post IDs and settings
- Optional local AI endpoint (for example via localhost)

## Planned phases

1. Hello world extension
2. Verify we are on the MyHordes town forum
3. Read thread list and unread markers
4. Read posts and metadata
5. Normalize forum data into JSON
6. Store seen post IDs locally
7. Build rule-based prioritization
8. Integrate local AI summarization
9. Display results in popup
10. Add settings and quality improvements

## Non-goals for early versions

- Fancy UI
- Automatic page navigation
- Background automation
- Cloud sync
- Remote summarization
- Full historical indexing

## Development principles

- Keep each issue small and testable
- Prefer simple implementations over clever ones
- Centralize page selectors
- Keep extracted data structured and normalized
- Make failures explicit and debuggable

## Manual testing strategy

Each feature should be manually testable in a real browser against the MyHordes forum page while logged in.

## Future ideas

- Summary history
- Configurable keyword weights
- Better roleplay detection
- Debug export/import
- More polished popup UI