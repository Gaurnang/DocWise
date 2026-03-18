# Collaborative Editor — HLD & LLD

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [High-Level Design (HLD)](#2-high-level-design-hld)
   - 2.1 [System Architecture](#21-system-architecture)
   - 2.2 [Tech Stack](#22-tech-stack)
   - 2.3 [Data Flow](#23-data-flow)
   - 2.4 [Component Map](#24-component-map)
3. [Low-Level Design (LLD)](#3-low-level-design-lld)
   - 3.1 [Server — REST API](#31-server--rest-api)
   - 3.2 [Server — Socket.IO Events](#32-server--socketio-events)
   - 3.3 [Server — DocumentManager](#33-server--documentmanager)
   - 3.4 [Server — FileStorage](#34-server--filestorage)
   - 3.5 [Client — Routing](#35-client--routing)
   - 3.6 [Client — DocumentListPage](#36-client--documentlistpage)
   - 3.7 [Client — DocumentEditorPage](#37-client--documenteditorpage)
   - 3.8 [Client — Navbar](#38-client--navbar)
   - 3.9 [Client — Sidebar](#39-client--sidebar)
   - 3.10 [Client — EditorContainer](#310-client--editorcontainer)
   - 3.11 [Client — EditorToolbar](#311-client--editortoolbar)
   - 3.12 [Client — DocumentList](#312-client--documentlist)
4. [Collaboration Model (Yjs + Socket.IO)](#4-collaboration-model-yjs--socketio)
5. [Persistence Model](#5-persistence-model)
6. [Directory Structure](#6-directory-structure)

---

## 1. Project Overview

**Docwise** is a real-time collaborative document editor. Multiple users can open the same document simultaneously and see each other's edits reflected live. Documents are persisted on the server using Yjs CRDT snapshots stored as binary files, so content survives server restarts.

---

## 2. High-Level Design (HLD)

### 2.1 System Architecture

```
┌──────────────────────────────────────────────────────┐
│                      Browser                         │
│                                                      │
│   React SPA (Vite)        port 5173/5174             │
│   ┌──────────────┐  HTTP  ┌──────────────────────┐   │
│   │  Pages /     │◄──────►│  Express REST API    │   │
│   │  Components  │        │  port 4000           │   │
│   └──────┬───────┘        └──────────┬───────────┘   │
│          │  WebSocket (Socket.IO)     │               │
│          └───────────────────────────┘               │
└──────────────────────────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   DocumentManager     │
                    │   (In-memory Yjs docs)│
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   FileStorage         │
                    │   server/storage/     │
                    │   documents/*.bin     │
                    └───────────────────────┘
```

### 2.2 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend framework | React 19 + Vite 7 | UI rendering, SPA routing |
| Styling | Tailwind CSS 4 | Utility-first styling |
| Routing | React Router v7 | Client-side navigation |
| Real-time (client) | Socket.IO Client v4 | WebSocket connection to server |
| CRDT (client) | Yjs v13 | Conflict-free replicated data type for text |
| Backend framework | Express v5 | REST API server |
| Real-time (server) | Socket.IO v4 | WebSocket rooms and event broadcasting |
| CRDT (server) | Yjs v13 | Authoritative document state management |
| Persistence | Node.js `fs/promises` | Binary Yjs snapshots saved to disk |

### 2.3 Data Flow

#### Initial Page Load (Document List)
```
Browser → GET /api/documents → Server returns [{id, title}, ...]
```

#### Opening a Document
```
Browser → GET /api/documents/:id
        ← Server loads Yjs snapshot from disk, returns {id, title, content}

Browser → socket.emit('join_document', {documentId})
        ← Server emits 'yjs_sync' (full Yjs state vector)
        ← Server emits 'doc_update' (plain text content)
```

#### Typing / Editing
```
User types
  → Client updates local Yjs doc
  → socket.emit('yjs_update', {documentId, update: Uint8Array})
  → Server applies update to its Yjs doc
  → Server saves new snapshot to disk (.bin file)
  → Server broadcasts 'yjs_update' to all other clients in the room
  → Server broadcasts 'doc_update' (updated plain text)
  → Other clients apply Yjs update → UI updates
```

#### Save Button
```
User clicks Save
  → PUT /api/documents/:id {title, content}
  → Server calls documentManager.setText() → updates Yjs doc + saves snapshot
  → Returns updated document
```

#### Real-time Title Sync
```
User edits title input
  → socket.emit('title_update', {documentId, title})
  → Server updates in-memory document list
  → Broadcasts 'title_update' to other clients in room
  → Other clients update their title state
```

### 2.4 Component Map

```
App
├── DocumentListPage          (route: "/")
│   ├── Navbar
│   └── Sidebar
│       └── DocumentList
│
└── DocumentEditorPage        (route: "/documents/:id")
    ├── Navbar
    ├── Sidebar
    │   └── DocumentList
    └── EditorContainer
        ├── EditorToolbar
        ├── <input> Title
        ├── Stats bar (word count, char count)
        ├── <textarea> Content
        └── Footer save bar (sticky)
```

---

## 3. Low-Level Design (LLD)

### 3.1 Server — REST API

**File:** `server/src/index.js`  
**Port:** `4000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check — returns "Server is running" |
| `GET` | `/api/documents` | Returns `[{id, title}]` list (no content) |
| `GET` | `/api/documents/:id` | Returns `{id, title, content}` — loads Yjs snapshot, extracts plain text |
| `POST` | `/api/documents` | Creates document, seeds Yjs doc with initial content, returns new doc |
| `PUT` | `/api/documents/:id` | Updates title and/or content — syncs content into Yjs via `setText()` |
| `DELETE` | `/api/documents/:id` | Removes from in-memory list and deletes `.bin` snapshot file |

**In-memory store:** `documents[]` — array of `{id, title, content}` objects seeded with two default documents on startup. Acts as a fast lookup layer on top of the Yjs/file persistence.

---

### 3.2 Server — Socket.IO Events

**All clients join a named room per document** using `socket.join(documentId)`.

#### Received from client → handled by server

| Event | Payload | Server action |
|---|---|---|
| `join_document` | `{documentId}` | Joins socket room; emits full Yjs state (`yjs_sync`) and plain text (`doc_update`) back to joining client |
| `yjs_update` | `{documentId, update: number[]}` | Applies Yjs binary update to server doc, saves snapshot, broadcasts update + doc_update to room |
| `doc_update` | `{documentId, content: string}` | Persists plain text via `setText()`, broadcasts to room |
| `title_update` | `{documentId, title: string}` | Updates in-memory title, broadcasts to room |

#### Emitted from server → received by client

| Event | Payload | Client action |
|---|---|---|
| `yjs_sync` | `{update: number[]}` | Full state vector — client applies to local Yjs doc on join |
| `yjs_update` | `{update: number[]}` | Delta update — client applies to local Yjs doc |
| `doc_update` | `{content: string}` | Updates React `content` state |
| `title_update` | `{title: string}` | Updates React `title` state and sidebar document list |

---

### 3.3 Server — DocumentManager

**File:** `server/src/collaboration/documentManager.js`

Manages a pool of live in-memory Yjs `Y.Doc` instances, one per document ID.

#### Internal State
```
docs: Map<documentId, Y.Doc>         — loaded documents
loadPromises: Map<documentId, Promise> — deduplicates concurrent loads
```

#### Methods

| Method | Signature | Description |
|---|---|---|
| `getOrCreate` | `(documentId, initialContent?) → Y.Doc` | Returns cached doc or loads/creates one. Deduplicates parallel load calls via promise map |
| `loadDocument` | `(documentId, initialContent?) → Y.Doc` | Creates a new `Y.Doc`, registers `update` listener for auto-save, loads snapshot from storage or seeds with initial content |
| `getText` | `(documentId, initialContent?) → string` | Gets current plain text from Yjs doc |
| `setText` | `(documentId, nextContent, initialContent?) → string` | Replaces entire Yjs text in a transaction (delete all + insert), triggering auto-save |
| `applyUpdate` | `(documentId, update: Uint8Array, initialContent?) → string` | Applies a Yjs binary delta update (from client) |
| `getEncodedState` | `(documentId, initialContent?) → Uint8Array` | Returns full Yjs state vector for sync on client join |
| `destroy` | `(documentId) → void` | Destroys the Yjs doc and deletes its snapshot |

**Auto-save:** Each `Y.Doc` has an `update` listener that calls `FileStorage.saveSnapshot()` on every Yjs mutation.

---

### 3.4 Server — FileStorage

**File:** `server/src/persistence/fileStorage.js`  
**Directory:** `server/storage/documents/`

Stores each document's Yjs state as a binary file: `{documentId}.bin`

| Method | Description |
|---|---|
| `getDocPath(id)` | Returns absolute path to `{id}.bin` |
| `ensureDir()` | Creates storage directory if it doesn't exist |
| `loadSnapshot(id)` | Reads `.bin` file → `Uint8Array`. Returns `null` if file doesn't exist |
| `saveSnapshot(id, stateVector)` | Writes `Uint8Array` to `.bin` file via `fs.writeFile` |
| `deleteSnapshot(id)` | Deletes `.bin` file (ignores ENOENT) |

---

### 3.5 Client — Routing

**File:** `client/src/App.jsx`

```
/                    → DocumentListPage
/documents/:id       → DocumentEditorPage
```

Both routes are wrapped in `<div className="h-screen overflow-hidden">` to prevent page scroll.

---

### 3.6 Client — DocumentListPage

**File:** `client/src/pages/DocumentListPage.jsx`  
**Route:** `/`

**State:**
- `documents[]` — fetched from `GET /api/documents`
- `loading` — shown as skeleton whilst fetching
- `error` — shown if fetch fails
- `sidebarOpen` — controls sidebar visibility
- `searchQuery` — filters documents in the main grid

**Behaviour:**
- On mount: fetches full document list
- `handleCreate()`: `POST /api/documents` → navigates to new document editor
- Renders a card grid of documents with title and a click-to-open interaction

---

### 3.7 Client — DocumentEditorPage

**File:** `client/src/pages/DocumentEditorPage.jsx`  
**Route:** `/documents/:id`

The core page. Manages all editor state, HTTP data fetching, Yjs CRDT, and Socket.IO lifecycle.

**State:**

| State | Type | Purpose |
|---|---|---|
| `documents` | `Array` | Sidebar document list |
| `title` | `string` | Current document title (controlled input) |
| `content` | `string` | Current document body (controlled textarea) |
| `loading` | `boolean` | Shows spinner while fetching |
| `saving` | `boolean` | Disables Save button during PUT request |
| `error` | `string` | Error message |
| `message` | `string` | "Saved" confirmation (auto-clears after 2s) |
| `sidebarOpen` | `boolean` | Sidebar collapsed/expanded toggle |
| `wordCount` | `number` | Live word count |
| `charCount` | `number` | Live character count (non-whitespace only) |

**Refs:**

| Ref | Purpose |
|---|---|
| `socketRef` | Socket.IO socket instance (avoids re-render on change) |
| `ydocRef` | Yjs `Y.Doc` instance |
| `isRemoteRef` | Guards against echo: `true` while applying remote update |

**Key Methods:**

- **`updateStats(text)`** — updates `wordCount` with `text.trim().split(/\s+/).filter()` and `charCount` with `text.match(/[^\s]/g).length` (non-whitespace chars only)
- **`handleSave()`** — `PUT /api/documents/:id` with current title and content
- **`handleDelete()`** — `DELETE /api/documents/:id` → navigates to `/`
- **`handleTitleChange(nextTitle)`** — updates local state, updates sidebar list, emits `title_update` via socket
- **`handleCreateDocument()`** — `POST /api/documents` → navigates to new doc

**Effects:**

1. **Data fetch effect** (`[id]`): fetches document list + current document, seeds state
2. **Yjs + Socket effect** (`[id]`): creates `Y.Doc`, connects Socket.IO, registers all socket event handlers, returns cleanup that disconnects socket and destroys Yjs doc

**Layout:**
```
<div h-screen flex-col>
  <Navbar />
  <div flex flex-1>
    <Sidebar />
    <main flex flex-1>
      <EditorContainer>
        <EditorToolbar />
        <div flex flex-col overflow-y-auto>
          <input title />
          <div stats bar />
          <textarea content />
          <div sticky footer save />
        </div>
      </EditorContainer>
    </main>
  </div>
</div>
```

---

### 3.8 Client — Navbar

**File:** `client/src/components/layout/Navbar.jsx`

**Props:**
- `saveStatus`: `'idle' | 'saving' | 'saved' | 'live' | 'error'` — drives the status indicator
- `title`: document title shown in the center
- `onToggleSidebar`: callback when hamburger button clicked

**Features:**
- Sticky top bar (`sticky top-0 z-40`)
- Logo "Docwise" with gradient icon — clickable, navigates to `/`
- Hamburger button to toggle sidebar
- Center: current document title (hidden on mobile)
- Right: save status indicator, mock collaborator avatars (JD, AK, NP), settings menu

---

### 3.9 Client — Sidebar

**File:** `client/src/components/layout/Sidebar.jsx`

**Props:** `documents[]`, `loading`, `onCreate`, `collapsed`

**Features:**
- Collapses to `w-0` with `opacity-0` transition when `collapsed=true`
- "New Document" button calls `onCreate`
- Search input: filters `documents` by title (case-insensitive)
- Delegates filtered list rendering to `<DocumentList>`
- Footer: mock user avatar ("U") + name + email

---

### 3.10 Client — EditorContainer

**File:** `client/src/components/editor/EditorContainer.jsx`

Thin layout wrapper — renders as a full-height flex column filling the available space with a white background. No padding or card styling — the document section fills edge-to-edge.

```jsx
<div className="flex flex-1 flex-col overflow-hidden bg-white">
  {children}
</div>
```

---

### 3.11 Client — EditorToolbar

**File:** `client/src/components/editor/EditorToolbar.jsx`

**Props:** `onDelete`

**Internal State:** `formats` (bold/italic/underline toggles), `showFormatMenu`, `showMoreMenu`, `showDeleteConfirm`, `deleting`, `dropdownPos`

**Features:**
- Format style dropdown ("Normal Text", Heading 1, Heading 2, etc.)
- Bold / Italic / Underline toggle buttons with active state highlight
- Text alignment buttons (Left, Center, Right, Justify)
- Lists (Bullet, Numbered), Blockquote, Code block buttons
- "More options" dropdown (rendered via `createPortal` to avoid clipping) — contains "Delete document"
- Delete confirmation modal with `onDelete` callback
- `useEffect` for click-outside detection to close the more-options dropdown

---

### 3.12 Client — DocumentList

**File:** `client/src/components/documents/DocumentList.jsx`

**Props:** `documents[]`

Renders a `<ul>` of `<Link>` items. Uses `useLocation()` to detect the active document, applying a blue gradient highlight to the current item. Each item shows a 📄 icon and truncated title.

---

## 4. Collaboration Model (Yjs + Socket.IO)

Yjs implements a **CRDT (Conflict-free Replicated Data Type)**. Each `Y.Doc` holds a `Y.Text` instance under the key `'content'`. Edits are represented as **operations** rather than full-text snapshots, meaning:

- Two users editing simultaneously produce **no conflicts** — Yjs merges both sets of operations deterministically
- Updates are binary-encoded (`Uint8Array`) and sent over Socket.IO as arrays of numbers
- The server holds an **authoritative** copy of every document's Yjs state in memory (`DocumentManager.docs`)
- On any mutation, the server auto-saves a full state snapshot to disk
- When a new client joins, the server encodes the full state (`getEncodedState`) and sends it in one `yjs_sync` event — the client applies this to hydrate its local doc

**Dual-channel sync:** Both Yjs binary updates (`yjs_update`) and plain text (`doc_update`) are exchanged. The Yjs path handles merge semantics; the plain text path ensures the React `content` state stays current for non-Yjs consumers (e.g. the save PUT endpoint).

---

## 5. Persistence Model

```
server/
└── storage/
    └── documents/
        ├── 1.bin          ← Yjs state snapshot for document id "1"
        ├── 2.bin          ← Yjs state snapshot for document id "2"
        └── {timestamp}.bin ← User-created documents (id = Date.now())
```

- Each `.bin` file is a raw `Uint8Array` produced by `Y.encodeStateAsUpdate(ydoc)`
- On server restart: each `.bin` is loaded via `Y.applyUpdate()` into a fresh `Y.Doc`, restoring the full edit history and content
- In-memory `documents[]` array is re-seeded from defaults on restart — content is then overwritten lazily from the `.bin` files when each document is first accessed
- Document IDs for user-created docs use `String(Date.now())` — monotonically increasing, no collision under normal use

---

## 6. Directory Structure

```
collaborative-editor/
│
├── DESIGN.md                          ← This file
│
├── client/                            ← React frontend (Vite)
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx                   ← ReactDOM.createRoot entry point
│       ├── App.jsx                    ← Router with two routes
│       ├── index.css                  ← Tailwind base + global styles
│       ├── pages/
│       │   ├── DocumentListPage.jsx   ← "/" — list and create documents
│       │   └── DocumentEditorPage.jsx ← "/documents/:id" — full editor
│       └── components/
│           ├── layout/
│           │   ├── Navbar.jsx         ← Global top bar
│           │   └── Sidebar.jsx        ← Collapsible document sidebar
│           ├── editor/
│           │   ├── EditorContainer.jsx ← Full-height layout wrapper
│           │   └── EditorToolbar.jsx   ← Formatting toolbar + delete
│           └── documents/
│               └── DocumentList.jsx    ← Sidebar document link list
│
└── server/                            ← Node.js backend
    ├── package.json
    └── src/
        ├── index.js                   ← Express app + Socket.IO server
        ├── collaboration/
        │   └── documentManager.js     ← Yjs doc pool manager
        └── persistence/
            └── fileStorage.js         ← Binary snapshot read/write
```
