import { Note } from "../db.js";

export async function updateNote({ id, title, content }) {
  if (!id) {
    return { content: [{ type: "text", text: "Error: id is required" }], isError: true };
  }
  const update = {};
  if (title !== undefined) update.title = title;
  if (content !== undefined) update.content = content;

  const note = await Note.findByIdAndUpdate(id, update, { new: true });
  if (!note) {
    return { content: [{ type: "text", text: "Note not found" }], isError: true };
  }
  return {
    content: [{ type: "text", text: JSON.stringify({ id: note._id.toString(), title: note.title, content: note.content }) }],
  };
}
