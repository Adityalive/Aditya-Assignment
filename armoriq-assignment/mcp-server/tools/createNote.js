import { Note } from "../db.js";

export async function createNote({ title, content }) {
  if (!title || typeof title !== "string") {
    return { content: [{ type: "text", text: "Error: title is required and must be a string" }], isError: true };
  }
  const note = await Note.create({ title, content: content || "" });
  return {
    content: [{ type: "text", text: JSON.stringify({ id: note._id.toString(), title: note.title, content: note.content }) }],
  };
}
