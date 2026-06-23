import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Note = mongoose.model("Note", noteSchema);

export async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI);
}
