import { Mistral } from "@mistralai/mistralai";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { Conversation } from "./src/chat/model.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
  const conv = await Conversation.findOne().sort({ updatedAt: -1 }).lean();
  let conversation = [...conv.messages];
  conversation.push({ role: "user", content: "ok save this note" });
  
  // Clean Mongoose fields if lean wasn't used:
  // wait, lean() was used so _id might be a string.
  
  try {
    const response = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages: conversation,
    });
    console.log("Success");
  } catch (err) {
    console.error("Mistral error:", err);
  }
  process.exit(0);
}
run();
