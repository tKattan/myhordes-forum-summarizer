# AGENTS.md

## Project summary

This repository contains a browser extension for summarizing unread/new content from the MyHordes town forum.

The extension must remain local-first and manual-triggered.

## Hard constraints

- Do not add any remote API integration.
- Do not send forum content to external services.
- Do not add automatic polling, scheduled scraping, or background refresh loops.
- Assume analysis is triggered only by explicit user action from the extension popup.
- Prefer reading the already loaded page DOM instead of making extra network requests.
- Keep the implementation incremental and easy to test manually.

## Coding style

- Use clear, boring, maintainable code.
- Keep functions small.
- Add comments only where they help.
- Prefer explicit names over abbreviations.
- Avoid premature abstractions.

## Scope discipline

When working on an issue:
- Read README.md and docs/architecture.md first.
- Implement only the requested issue.
- Do not silently expand scope.
- If something is missing, leave a short note instead of building unrelated features.

## Architecture guidance

Expected areas of responsibility:

- popup: user-triggered controls and simple result display
- content script: forum page validation, DOM extraction, structured data collection
- background: orchestration, storage coordination, AI request coordination
- core utilities: normalization, prioritization, storage helpers
- docs: keep architecture and data-flow docs aligned with implementation

## Data handling

Use these stages:

1. Raw DOM from the current browser page
2. Extracted structured objects
3. Derived metadata such as priority flags and scores
4. Optional local AI request payload
5. Local summary result

Avoid storing raw HTML unless explicitly needed for debug mode.

## Implementation preferences

- Centralize selectors in one place
- Normalize extracted forum data into plain JSON-friendly objects
- Keep local AI integration behind a small interface
- Build rule-based prioritization before relying on AI output

## Expected output from the agent

For each implementation task:
1. Explain the plan
2. Make the code changes
3. Summarize files changed
4. Explain manual test steps
5. Note assumptions or limitations