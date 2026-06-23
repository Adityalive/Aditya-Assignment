import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    conversationId: { type: String, 
      required: true },
    toolName: { type: String, required: true },
    toolInput: { type: mongoose.Schema.Types.Mixed },
    status: {
      type: String,
      enum: ["allowed", "blocked", "pending_approval", "error"],
      required: true,
    },
    reason: { type: String, default: "" },
    result: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

export const Log = mongoose.model("Log", logSchema);
