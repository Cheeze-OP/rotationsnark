import { Client, GatewayIntentBits } from "discord.js";
import { loadClassifier, isRotationComplaint } from "./classifier.js";
import { getSnarkResponse, getReplyResponse } from "./responder.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// When the bot starts up
client.once("clientReady", async () => {
  console.log(`Bot is online as ${client.user.tag}`);
  await loadClassifier();
  console.log("Bot is fully ready and listening!");
});

// When a new message is sent
client.on("messageCreate", async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Only watch the channel specified in .env
  if (message.channel.id !== process.env.CHANNEL_ID) return;

  // Handle replies to the bot
  if (message.reference) {
    try {
      const repliedTo = await message.fetchReference();
      if (repliedTo.author.id === client.user.id) {
        const response = await getReplyResponse(message.content);
        await message.reply(response);
        return;
      }
    } catch (error) {
      console.error("Error handling reply:", error);
    }
  }

  try {
    const complaint = await isRotationComplaint(message.content);

    if (complaint) {
      console.log("Rotation complaint detected, generating response...");

      // Get snarky response from Ollama
      const response = await getSnarkResponse();

      // Reply to the message
      const disclaimer = `\n\n*If this response was generated in error, our apologies. If this was generated for an actual rotation complaint, please know that this was posted from our gigabit wifi aboard the OP Private Jet in transit to your mom's house.*`;
      await message.reply(response + disclaimer);

      console.log("Complaint handled!");
    }
  } catch (error) {
    console.error("Error handling message:", error);
  }
});

client.login(process.env.DISCORD_TOKEN);
