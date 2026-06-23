import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, unique: true },
    title: { type: String, default: "New Chat" },
    messages: [{ role: String, content: String, toolCallId: String }],
  },
  { timestamps: true }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
