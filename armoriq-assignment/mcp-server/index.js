import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { connectDB } from "./db.js";
import { createNote } from "./tools/createNote.js";
import { readNote } from "./tools/readNote.js";
import { updateNote } from "./tools/updateNote.js";
import { deleteNote } from "./tools/deleteNote.js";
import { listNotes } from "./tools/listNotes.js";

const server = new Server(
  { name: "armoriq-notes-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "create_note",
      description: "Create a new note",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string", description: "Title of the note" },
          content: { type: "string", description: "Content of the note" },
        },
        required: ["title"],
      },
    },
    {
      name: "read_note",
      description: "Read a note by ID",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "Note ID" },
        },
        required: ["id"],
      },
    },
    {
      name: "update_note",
      description: "Update a note by ID",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "Note ID" },
          title: { type: "string", description: "New title" },
          content: { type: "string", description: "New content" },
        },
        required: ["id"],
      },
    },
    {
      name: "delete_note",
      description: "Delete a note by ID",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "Note ID" },
        },
        required: ["id"],
      },
    },
    {
      name: "list_notes",
      description: "List all notes",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  switch (name) {
    case "create_note":
      return createNote(args);
    case "read_note":
      return readNote(args);
    case "update_note":
      return updateNote(args);
    case "delete_note":
      return deleteNote(args);
    case "list_notes":
      return listNotes();
    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
});

async function main() {
  await connectDB();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
