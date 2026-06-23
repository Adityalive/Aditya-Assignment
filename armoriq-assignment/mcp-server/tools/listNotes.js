import { Note } from "../db.js";

export async function listNotes() {
  const notes = await Note.find().sort({ createdAt: -1 }).lean();
  const result = notes.map((n) => ({
    id: n._id.toString(),
    title: n.title,
    content: n.content,
    createdAt: n.createdAt,
  }));
  return {
    content: [{ type: "text", text: JSON.stringify(result) }],
  };
}
