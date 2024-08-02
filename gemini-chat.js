import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();
import readline from "readline";

// Check if API_KEY is loaded correctly
if (!process.env.API_KEY) {
  console.error("API_KEY is not defined in environment variables.");
  process.exit(1);
}

// Declare a new Google Generative AI object
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    async function askAndResponse() {
      rl.question("YOU: ", async (msg) => {
        if (msg.toLowerCase() === "exit") {
          rl.close();
        } else {
          try {
            const result = await chat.sendMessage(msg);
            const response = await result.response;

            const text = await response.text();
            console.log("AI: ", text);
          } catch (error) {
            console.error("Error sending message: ", error);
          }
          askAndResponse(); // Recursively call after processing
        }
      });
    }

    askAndResponse(); // Start the interaction loop
  } catch (error) {
    console.error("Error initializing chat: ", error);
  }
}

run();
