import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, unique: true },
    tokensUsed: { type: Number, default: 0 },
    callCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Budget = mongoose.model("Budget", budgetSchema);
