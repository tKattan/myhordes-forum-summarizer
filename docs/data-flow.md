# Data Flow

## End-to-end flow

1. User opens the MyHordes forum while logged in
2. User clicks the extension action
3. Popup sends a message to the background/service worker
4. Background requests extraction from the content script
5. Content script validates page context and extracts structured data
6. Background compares extracted items against local storage
7. Background derives priority metadata
8. Background optionally sends a structured payload to a local AI endpoint
9. Background stores results locally
10. Popup displays a summary or debug output

## Data stages

### Raw page data
DOM nodes and browser page state

### Structured extraction
Plain objects for threads, posts, unread state, and metadata

### Derived metadata
Flags and scores such as:
- isPing
- isUrgent
- isOrganization
- isLikelyRoleplay
- priorityScore

### AI payload
Minimal, structured summary input

### Final result
Summary text and categorized action items

## Principles

- Prefer structured data over raw HTML
- Minimize stored data
- Keep transformations explicit