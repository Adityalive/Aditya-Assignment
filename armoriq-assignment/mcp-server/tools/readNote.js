import { Note } from "../db.js";

export async function readNote({ id }) {
  if (!id) {
    return { content: [{ type: "text", text: "Error: id is required" }], isError: true };
  }
  const note = await Note.findById(id);
  if (!note) {
    return { content: [{ type: "text", text: "Note not found" }], isError: true };
  }
  return {
    content: [{ type: "text", text: JSON.stringify({ id: note._id.toString(), title: note.title, content: note.content }) }],
  };
}
