import mongoose from "mongoose";
import dotenv from "dotenv";
import { Log } from "./models/Log.js";
import { Conversation } from "./models/Conversation.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const logs = await Log.find().sort({ createdAt: -1 }).limit(5);
  console.log("Recent Logs:");
  console.log(JSON.stringify(logs, null, 2));

  const convs = await Conversation.find().sort({ updatedAt: -1 }).limit(1);
  console.log("\nRecent Conversation Messages:");
  if (convs.length > 0) {
    const msgs = convs[0].messages.slice(-5);
    console.log(JSON.stringify(msgs, null, 2));
  }
  
  process.exit(0);
}
run();
