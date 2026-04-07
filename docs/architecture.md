# Architecture

## Overview

The extension analyzes the MyHordes town forum from the already loaded browser page.

The system has four main parts:

1. Popup UI
2. Content script
3. Background/service worker
4. Local storage and optional local AI adapter

## Components

### Popup

Responsibilities:
- Expose manual actions such as "Analyze current page"
- Display simple status and later the summary result

### Content script

Responsibilities:
- Verify the current page is the MyHordes town forum
- Read DOM elements for threads, unread markers, posts, and metadata
- Convert page information into structured objects

### Background/service worker

Responsibilities:
- Coordinate popup and content script messaging
- Compare extracted data with stored state
- Prepare summarization payloads
- Call local summarization adapters
- Save results

### Storage

Responsibilities:
- Persist seen thread/post IDs
- Store settings
- Store summary history if needed

## Data model

Example thread:

```json
{
  "threadId": "12345",
  "title": "Expédition ce matin",
  "isUnread": true,
  "posts": []
}
```

Example post:

```json
{
  "postId": "987",
  "threadId": "12345",
  "author": "PlayerA",
  "timestampText": "08:14",
  "contentText": "@Taleiven on a besoin de toi dehors"
}
```

## Design goals

- Minimal network usage
- Manual trigger only
- Local-first processing
- Incremental development
- Simple manual testing