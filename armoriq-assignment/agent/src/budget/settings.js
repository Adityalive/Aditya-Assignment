import mongoose from "mongoose";

const globalSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const GlobalSettings = mongoose.model("GlobalSettings", globalSettingsSchema);
