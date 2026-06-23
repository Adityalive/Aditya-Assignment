# ArmorIQ — Guarded AI Agent with MCP Support

A multi-service system where a Mistral AI agent can use external tools via the Model Context Protocol (MCP), with a **policy engine** sitting in between as a security guard. An admin dashboard lets you set rules that control which tools the agent can call — and changes take effect **instantly, no restart required**.

---

## Architecture (3 Services)

```
┌─────────────────────────┐
│    Dashboard (React)    │  port 5173
│  Rules | Logs | Chat   │
│  Notes (live mirror)    │
└─────────┬───────────────┘
          │ HTTP + Socket.io
          ▼
┌─────────────────────────┐
│   Agent (Node/Express)  │  port 8001
│                         │
│  ┌───────────────────┐  │
│  │   Policy Engine   │  │  ← intercepts every tool call
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │    MCP Client     │  │  ← discovers + calls tools
│  └───────────────────┘  │
└─────────┬───────────────┘
          │ stdio
          ▼
┌─────────────────────────┐
│  MCP Server (Node.js)   │
│  Notes CRUD (5 tools)   │
│  create, read, update,  │
│  delete, list           │
└─────────┬───────────────┘
          │
     ┌────┴────┐
     │ MongoDB │  (Atlas)
     └─────────┘
```

### Data flow for a tool call

```
User: "create a note: buy milk"
  → Agent receives POST /api/chat
  → Mistral decides: call create_note
  → Policy Engine checks rules for create_note
      → ALLOWED → MCP Client forwards to Notes MCP Server
      → BLOCKED → returns error to Mistral, logs to dashboard
      → PENDING → waits for admin approval in dashboard
  → MCP Server creates note in MongoDB
  → Agent emits socket events:
      → log:result → Logs page updates
      → notes:changed → Notes page refetches
  → Mistral receives result, formulates response
  → Response sent back to chat
```

---

## Services Breakdown

### 1. `agent/` — Express server (port 8001)

The brain. Contains Mistral integration, policy engine, MCP client, and serves the API.

| File | Purpose |
|------|---------|
| `index.js` | Entry point. Sets up Express + Socket.io, mounts all routes, connects to MongoDB + MCP server |
| `agent.js` | Mistral tool-use loop. Sends messages + tool schemas to Mistral, processes tool calls through policy engine |
| `mcpClient.js` | Connects to MCP servers via stdio. Discovers tools, calls them. Has a built-in `search_web` tool that calls Exa REST API |
| `policyEngine.js` | Caches rules from MongoDB (3s TTL). `checkPolicy(toolName)` returns `{ allowed, requiresApproval, reason }` |

**Routes:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat` | POST | Send message to agent. Body: `{ message, conversationId? }` |
| `/api/rules` | GET | List all policy rules |
| `/api/rules` | POST | Create/update rule. Body: `{ toolName, ruleType }` |
| `/api/rules/:id` | DELETE | Delete a rule |
| `/api/rules/:id/toggle` | PATCH | Toggle rule active/inactive |
| `/api/logs` | GET | Fetch recent tool call logs. Query: `?conversationId=` |
| `/api/notes` | GET | List all notes from MongoDB |
| `/api/tools` | GET | List all discovered MCP tools |

**Socket.io events (namespace: `admin`):**

| Event | Direction | Payload |
|-------|-----------|---------|
| `log:new` | agent → dashboard | `{ toolName, toolInput, status, reason, conversationId, timestamp }` |
| `log:result` | agent → dashboard | `{ toolName, result, conversationId, timestamp }` |
| `notes:changed` | agent → dashboard | `{ timestamp }` → Notes page refetches |
| `rule:updated` | agent → dashboard | `{ rule, timestamp }` |
| `rule:toggled` | agent → dashboard | `{ rule, timestamp }` |
| `rule:deleted` | agent → dashboard | `{ id, timestamp }` |

**Policy Engine behavior:**

```
Rules cached in-memory, refreshed every 3 seconds.
On rule create/update/delete/toggle, cache is invalidated immediately.
Next tool call always uses fresh rules from MongoDB.

Rule types:
  allow              → tool executes normally
  block              → tool is rejected, error returned to LLM
  require_approval   → tool is paused, dashboard notified, waits for admin
```

---

### 2. `mcp-server/` — Notes CRUD MCP Server (stdio)

A custom MCP server following the Model Context Protocol. Exposes 5 tools that the agent discovers automatically on startup.

**Tools:**

| Tool | Input | Output |
|------|-------|--------|
| `create_note` | `{ title: string, content?: string }` | `{ id, title, content }` |
| `read_note` | `{ id: string }` | `{ id, title, content }` |
| `update_note` | `{ id, title?, content? }` | `{ id, title, content }` |
| `delete_note` | `{ id: string }` | `{ deleted: true, id }` |
| `list_notes` | `{}` | `[{ id, title, content, createdAt }]` |

**Built-in tool** (in mcpClient.js, not a separate server):

| Tool | Input | Output |
|------|-------|--------|
| `search_web` | `{ query: string, numResults?: number }` | Web search results via Exa API |

---

### 3. `dashboard/` — React Admin UI (port 5173)

Vite + React + Tailwind + Framer Motion + react-hot-toast + Headless UI.

**Pages:**

| Route | Page | Features |
|-------|------|----------|
| `/rules` | Rules Panel | Add/toggle/delete policy rules. Uses Headless UI Listbox for selects. Toast notifications on every action. |
| `/logs` | Activity Logs | Real-time log of every tool call + policy change. Socket.io live indicator with pulsing dot. Staggered animations. |
| `/chat` | Agent Chat | Talk to the agent. Messages rendered with react-markdown. Spring-animated message bubbles. Animated typing dots. |
| `/notes` | Notes Mirror | Live card grid of all notes. Refetches on `notes:changed` socket event. |

**Animated typing indicator** — 3 bouncing dots animate during loading.

**Note:** Dashboard proxies `/api/*` and `/socket.io` to the agent via Vite config.

---

## File Tree (Complete)

```
armoriq-assignment/
├── .gitignore
├── README.md
│
├── agent/
│   ├── index.js              # Express + Socket.io + route mounting
│   ├── agent.js              # Mistral tool-use loop + conversation memory
│   ├── mcpClient.js          # Stdio MCP client + built-in search_web
│   ├── policyEngine.js       # Rule cache + checkPolicy()
│   ├── models/
│   │   ├── Rule.js           # { toolName, ruleType, active }
│   │   ├── Log.js            # { conversationId, toolName, status, result }
│   │   ├── Conversation.js   # { conversationId, messages[] } — memory
│   │   └── Note.js           # { title, content } — for dashboard API
│   ├── routes/
│   │   ├── chat.js           # POST /api/chat
│   │   ├── rules.js          # CRUD /api/rules + socket emits
│   │   ├── logs.js           # GET /api/logs
│   │   └── notes.js          # GET /api/notes
│   ├── package.json
│   └── .env                  # MISTRAL_API_KEY, MONGO_URI, EXA_API_KEY
│
├── mcp-server/
│   ├── index.js              # MCP server entry (stdio transport)
│   ├── db.js                 # Mongoose Note model + connectDB()
│   ├── tools/
│   │   ├── createNote.js
│   │   ├── readNote.js
│   │   ├── updateNote.js
│   │   ├── deleteNote.js
│   │   └── listNotes.js
│   ├── package.json
│   └── .env                  # MONGO_URI
│
└── dashboard/
    ├── index.html
├── vite.config.js        # Proxy /api → localhost:8001
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    ├── .env                  # VITE_AGENT_URL
    └── src/
        ├── main.jsx
        ├── index.css          # Tailwind directives
        ├── App.jsx            # Routes + AnimatePresence + Toaster
        ├── api/
        │   └── index.js       # Axios wrappers for all endpoints
        ├── components/
        │   ├── Navbar.jsx     # Top nav with active state + animations
        │   ├── RuleCard.jsx   # Rule display with toggle/delete
        │   └── LogRow.jsx     # Log entry with status icon + animation
        └── pages/
            ├── Rules.jsx      # Policy rules CRUD
            ├── Logs.jsx       # Real-time activity feed
            ├── Chat.jsx       # Agent chat with markdown rendering
            └── Notes.jsx      # Live notes mirror
```

---

## How to Run

### Requirements
- Node.js 18+
- MongoDB Atlas URI (or local MongoDB)
- Mistral API key
- Exa API key (for web search)

### 1. Fill in `.env` files

**`agent/.env`:**
```
MISTRAL_API_KEY=<your-key>
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/armoriq
AGENT_PORT=8001
EXA_API_KEY=<your-key>
DASHBOARD_URL=http://localhost:5173
```

**`mcp-server/.env`:**
```
MONGO_URI=<same-as-above>
```

**`dashboard/.env`:**
```
VITE_AGENT_URL=http://localhost:8001
```

### 2. Install dependencies

```bash
cd agent && npm install
cd ../mcp-server && npm install
cd ../dashboard && npm install
```

### 3. Start services

```bash
# Terminal 1 — Agent
cd agent
npm start

# Terminal 2 — Dashboard
cd dashboard
npm run dev
```

Agent logs MongoDB connection, MCP server connection, and discovered tools. Dashboard opens at `http://localhost:5173`.

---

## Demo Flow (for submission recording)

1. Open Dashboard → `/chat`
2. Ask: *"search the web for latest AI news and save a note about it"*
3. Watch Dashboard → `/logs` — shows `search_web ALLOWED`, `create_note ALLOWED`
4. Switch to Dashboard → `/notes` — see the note appear
5. Go to Dashboard → `/rules` — add rule: `delete_note → Block`
6. Switch to Dashboard → `/logs` — see `Policy updated: delete_note → block` in real time
7. Go back to `/chat` — ask: *"delete the note you just created"*
8. Watch `/logs` — shows `delete_note BLOCKED` with reason
9. Show that no restart was needed — rules took effect instantly

---

## Important Conventions (for AI agents)

### Do NOT:
- Do NOT add comments to code unless asked
- Do NOT create new files unless explicitly needed — prefer editing existing files
- Do NOT modify `.env` files with placeholder values — they should contain real keys
- Do NOT use `node --watch` on Windows — it causes "Cannot read image.png" errors
- Do NOT import default from `@mistralai/mistralai` — use `{ Mistral }`
- Do NOT pass raw stdio streams to `StdioClientTransport` — pass `{ command, args }`

### DO:
- Use `mongoose.model("Note", noteSchema)` for Note model (shared between agent and mcp-server)
- Use `io.to("admin").emit()` for all real-time dashboard events
- Cache rules in `policyEngine.js` with 3s poll interval + immediate invalidation on writes
- Import MCP transports from `@modelcontextprotocol/sdk/client/<transport>.js`
- Store conversation history in MongoDB via `Conversation` model for memory
- Use `toolChoice: "auto"` for Mistral — never force tool calls

### Socket.io pattern:
```js
// Server emit
io.to("admin").emit("event:name", { data });

// Client listen (any page)
socket.on("event:name", (data) => { ... });
```

### Adding a new page to dashboard:
1. Create `src/pages/YourPage.jsx`
2. Add route in `App.jsx`
3. Add nav link in `components/Navbar.jsx`
4. Add API call in `api/index.js` if needed

---

## Deploy to Render

3 services, all pointing to same MongoDB Atlas:

| Service | Type | Start Command | Env Vars |
|---------|------|---------------|----------|
| `armoriq-agent` | Web Service | `cd agent && npm start` | `MISTRAL_API_KEY`, `MONGO_URI`, `EXA_API_KEY`, `DASHBOARD_URL` |
| `armoriq-mcp-server` | Web Service | `cd mcp-server && node index.js` | `MONGO_URI` |
| `armoriq-dashboard` | Static Site | `cd dashboard && npm run build` | `VITE_AGENT_URL` |

Dashboard build output is `dashboard/dist/`.

**Note:** For production, the MCP server should be deployed as a separate stdio-triggered process (the agent spawns it). On Render, you may need to adjust the spawning path or deploy it inline.

---

## Submission

Email to: `fuzail@armoriq.io`
CC: `aniket@armoriq.io`, `arun@armoriq.io`, `pulkit@armoriq.io`
Subject: `{YourName} - Armoriq SWE intern assignment submission`

Include:
- Link to GitHub repo (private, add them as collaborators)
- Link to live demo (Render URLs)
- Demo video (2-3 min) showing the flow described above
