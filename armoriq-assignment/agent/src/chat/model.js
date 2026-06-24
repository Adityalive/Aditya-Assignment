import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, unique: true },
    title: { type: String, default: "New Chat" },
    messages: [mongoose.Schema.Types.Mixed],
  },
  { timestamps: true }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
