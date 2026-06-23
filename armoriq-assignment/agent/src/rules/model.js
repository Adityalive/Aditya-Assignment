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
    // Input validation: if set, the regex is tested against the specified argument field
    inputPattern: { type: String, default: "" },     // regex string e.g. "^[a-zA-Z0-9 ]+$"
    inputPatternField: { type: String, default: "" }, // which arg to check e.g. "title", "query"
    inputPatternAction: {
      type: String,
      enum: ["block", "require_approval"],
      default: "block",
    },
  },
  { timestamps: true }
);

export const Rule = mongoose.model("Rule", ruleSchema);
