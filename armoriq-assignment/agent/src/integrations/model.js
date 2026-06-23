import mongoose from "mongoose";

const integrationSchema = new mongoose.Schema(
  {
    provider: { type: String, required: true, unique: true }, // e.g., 'alphavantage'
    apiKey: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Integration = mongoose.model("Integration", integrationSchema);
