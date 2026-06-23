import { Note } from "../db.js";

export async function deleteNote({ id }) {
  if (!id) {
    return { content: [{ type: "text", text: "Error: id is required" }], isError: true };
  }
  const note = await Note.findByIdAndDelete(id);
  if (!note) {
    return { content: [{ type: "text", text: "Note not found" }], isError: true };
  }
  return {
    content: [{ type: "text", text: JSON.stringify({ deleted: true, id }) }],
  };
}
