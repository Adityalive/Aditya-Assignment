import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, unique: true },
    messages: [{ role: String, content: String, toolCallId: String }],
  },
  { timestamps: true }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
