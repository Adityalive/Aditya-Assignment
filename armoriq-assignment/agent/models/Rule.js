import mongoose from "mongoose";

const ruleSchema = new mongoose.Schema(
  {
    toolName: { type: String, required: true, unique: true },
    ruleType: {
      type: String,
      enum: ["allow", "block", "require_approval"],
      default: "allow",
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Rule = mongoose.model("Rule", ruleSchema);
