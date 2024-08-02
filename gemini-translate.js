import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pkg from '@google-cloud/translate';
const { Translate } = pkg.v2; 
import readline from "readline";
dotenv.config();

// Check if API_KEY or GOOGLE_TRANSLATE_API_KEY is loaded correctly
if (!process.env.API_KEY || !process.env.GOOGLE_TRANSLATE_API_KEY) {
  console.error("API_KEY or GOOGLE_TRANSLATE_API_KEY is not defined in environment variables.");
  process.exit(1);
}

// Initialize Google Generative AI and Translate client
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const translate = new Translate({ key: process.env.GOOGLE_TRANSLATE_API_KEY });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function translateText(text, targetLanguage) {
  try {
    const [translation] = await translate.translate(text, targetLanguage);
    return translation;
  } catch (error) {
    console.error("Error translating text: ", error);
    return text; // Return original text in case of error
  }
}

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

            const englishText = await response.text();
            console.log("AI (English): ", englishText);

            // Translate response to Arabic
            const arabicText = await translateText(englishText, 'ar');
            console.log("AI (Arabic): ", arabicText);

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
